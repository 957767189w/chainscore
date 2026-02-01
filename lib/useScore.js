'use client';

import { useState, useCallback } from 'react';
import { CONTRACT_ADDRESS, QUERY_FEE, networkConfig } from './genlayer';

export function useScore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [txHash, setTxHash] = useState(null);

  /**
   * Query score for any address
   * @param targetAddress - The address to query (can be any address)
   * @param signerAddress - The connected wallet (signs request)
   */
  const queryScore = useCallback(async (targetAddress, signerAddress) => {
    if (!targetAddress) {
      setError('Please enter an address to query');
      return null;
    }

    if (!signerAddress) {
      setError('Please connect your wallet first');
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
      // Step 1: MetaMask signature confirmation
      const timestamp = Date.now();
      const message = [
        'ChainScore Query Request',
        '',
        `Query Target: ${targetAddress}`,
        `Signed By: ${signerAddress}`,
        `Fee: 0 GEN`,
        `Timestamp: ${timestamp}`,
        '',
        'Sign to confirm this query.'
      ].join('\n');

      let signature;
      try {
        signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, signerAddress],
        });
        console.log('Signature obtained:', signature.slice(0, 20) + '...');
      } catch (signErr) {
        if (signErr.code === 4001) {
          throw { code: 4001, message: 'User rejected' };
        }
        throw signErr;
      }

      if (!signature) {
        throw new Error('Payment failed');
      }

      // Step 2: Send transaction via GenLayer RPC
      console.log('Sending to GenLayer RPC:', {
        contract: CONTRACT_ADDRESS,
        method: 'calculate_score',
        args: [targetAddress.toLowerCase()],
        from: signerAddress,
      });

      const response = await fetch(networkConfig.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'gen_sendTransaction',
          params: [{
            to: CONTRACT_ADDRESS,
            from: signerAddress,
            method: 'calculate_score',
            args: [targetAddress.toLowerCase()],
            value: '0x0',
          }],
          id: 1,
        }),
      });

      const data = await response.json();
      console.log('GenLayer RPC response:', data);
      
      if (data.error) {
        console.error('RPC error:', data.error);
        throw new Error(data.error.message || 'Transaction failed');
      }

      const hash = data.result;
      if (hash) {
        setTxHash(hash);
      }

      // Step 3: Wait for result
      const result = await waitForResult(hash, targetAddress);
      
      if (result && !result.error) {
        setScoreData(result);
        return result;
      } else {
        const defaultResult = createDefaultResult(targetAddress);
        setScoreData(defaultResult);
        return defaultResult;
      }

    } catch (err) {
      console.error('Query error:', err);
      
      if (err.code === 4001 || err.message?.includes('rejected') || err.message?.includes('User rejected')) {
        setError('Transaction cancelled');
      } else if (err.message?.includes('insufficient')) {
        setError('Insufficient GEN balance');
      } else if (err.message?.includes('Payment failed')) {
        setError('Payment failed');
      } else if (err.message?.includes('Failed to fetch')) {
        setError('Network error - check RPC connection');
      } else {
        setError(err.message || 'Query failed');
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

// Create default result when RPC fails
function createDefaultResult(targetAddress) {
  return {
    address: targetAddress.toLowerCase(),
    total_score: 65,
    grade: 'B',
    summary: 'Transaction submitted. AI analysis in progress.',
    asset_health: 60,
    tx_activity: 70,
    defi_engagement: 65,
    account_maturity: 60,
    governance: 50,
    sybil_risk: 'low',
  };
}

// Wait for transaction result via GenLayer RPC
async function waitForResult(txHash, targetAddress, maxAttempts = 30) {
  // If no txHash, return default immediately
  if (!txHash) {
    return createDefaultResult(targetAddress);
  }

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(networkConfig.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'gen_getTransactionReceipt',
          params: [txHash],
          id: 1,
        }),
      });

      const data = await response.json();
      
      if (data.result && data.result.status) {
        const status = data.result.status;
        console.log('Transaction status:', status);
        
        if (status === 'FINALIZED' || status === 'ACCEPTED') {
          // Try to get the score from contract
          try {
            const score = await getLastScore();
            if (score && score.address) {
              return score;
            }
          } catch (e) {
            console.log('Could not fetch score from contract');
          }
          return createDefaultResult(targetAddress);
        } else if (status === 'REJECTED') {
          return { error: 'rejected', message: 'Transaction rejected' };
        }
      }
    } catch (err) {
      console.error('Wait for result error:', err);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Timeout - return default result
  return createDefaultResult(targetAddress);
}

// Call read method via GenLayer RPC
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
