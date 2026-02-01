'use client';

import { useState, useCallback } from 'react';
import { CONTRACT_ADDRESS, QUERY_FEE, networkConfig } from './genlayer';

export function useScore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const queryScore = useCallback(async (targetAddress, signerAddress) => {
    if (!targetAddress || !signerAddress) {
      setError('Missing required parameters');
      return null;
    }

    if (!CONTRACT_ADDRESS) {
      setError('Contract not configured');
      return null;
    }

    setLoading(true);
    setError(null);
    setScoreData(null);
    setTxHash(null);

    try {
      // Build transaction - 0 GEN fee but still requires MetaMask confirmation
      const txParams = {
        from: signerAddress,
        to: CONTRACT_ADDRESS,
        value: '0x' + QUERY_FEE.toString(16),
        data: encodeCalculateScore(targetAddress),
      };

      // Send via MetaMask
      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      setTxHash(hash);

      // Wait for transaction
      const receipt = await waitForTransaction(hash);
      
      if (!receipt || receipt.status === '0x0') {
        throw new Error('Payment failed');
      }

      // Get result from contract
      const result = await getLastScore();
      
      if (result && !result.error) {
        setScoreData(result);
        return result;
      } else {
        throw new Error(result?.message || 'Score query failed');
      }

    } catch (err) {
      console.error('Query error:', err);
      
      if (err.code === 4001) {
        setError('Transaction cancelled');
      } else if (err.message?.includes('insufficient')) {
        setError('Insufficient GEN balance');
      } else {
        setError('Payment failed');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCachedScore = useCallback(async (targetAddress) => {
    if (!CONTRACT_ADDRESS) return null;

    try {
      const result = await callReadMethod('get_score', [targetAddress.toLowerCase()]);
      if (result && !result.error) {
        setScoreData(result);
        return result;
      }
      return null;
    } catch (err) {
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setScoreData(null);
    setTxHash(null);
  }, []);

  return {
    loading,
    error,
    scoreData,
    txHash,
    queryScore,
    getCachedScore,
    reset,
    queryFee: QUERY_FEE,
  };
}

// Encode calculate_score function call
function encodeCalculateScore(address) {
  // Function selector for calculate_score(string)
  const selector = '0x9b8b9a35';
  const addrParam = address.toLowerCase().replace('0x', '').padStart(64, '0');
  return selector + addrParam;
}

// Wait for transaction confirmation
async function waitForTransaction(hash, maxAttempts = 90) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [hash],
      });
      if (receipt) return receipt;
    } catch (err) {
      // Continue waiting
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Transaction confirmation timeout');
}

// Call read method via RPC
async function callReadMethod(method, args) {
  try {
    const response = await fetch(networkConfig.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'gen_call',
        params: [{
          to: CONTRACT_ADDRESS,
          method: method,
          args: args,
        }],
        id: 1,
      }),
    });
    
    const data = await response.json();
    if (data.result) {
      return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
    }
    return null;
  } catch (err) {
    console.error('Read method error:', err);
    return null;
  }
}

// Get last score from contract
async function getLastScore() {
  try {
    const response = await fetch(networkConfig.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'gen_call',
        params: [{
          to: CONTRACT_ADDRESS,
          method: 'get_last_score',
          args: [],
        }],
        id: 1,
      }),
    });
    
    const data = await response.json();
    if (data.result) {
      return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
    }
    return null;
  } catch (err) {
    console.error('Get last score error:', err);
    return null;
  }
}
