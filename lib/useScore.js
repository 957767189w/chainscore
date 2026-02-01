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
      const txParams = {
        from: signerAddress,
        to: CONTRACT_ADDRESS,
        value: '0x' + QUERY_FEE.toString(16),
        data: encodeFunctionCall('calculate_score', [targetAddress]),
      };

      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      setTxHash(hash);

      const receipt = await waitForTransaction(hash);
      
      if (!receipt.status) {
        throw new Error('Payment failed');
      }

      const result = decodeResult(receipt);
      
      if (result.error) {
        throw new Error(result.message || 'Payment failed');
      }

      setScoreData(result);
      return result;

    } catch (err) {
      console.error('Query error:', err);
      
      if (err.code === 4001) {
        setError('Transaction cancelled');
      } else if (err.message?.includes('insufficient')) {
        setError('Insufficient GEN balance');
      } else {
        setError(err.message || 'Payment failed');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCachedScore = useCallback(async (targetAddress) => {
    if (!CONTRACT_ADDRESS) {
      return null;
    }

    try {
      const result = await callReadMethod('get_cached_score', [targetAddress]);
      
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

function encodeFunctionCall(method, args) {
  const methodId = '0x9b8b9a35';
  const addressParam = args[0].toLowerCase().replace('0x', '').padStart(64, '0');
  return methodId + addressParam;
}

async function waitForTransaction(hash, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [hash],
      });
      
      if (receipt) {
        return receipt;
      }
    } catch (err) {
      // Continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Transaction confirmation timeout');
}

async function callReadMethod(method, args) {
  try {
    const response = await fetch(`${networkConfig.rpcUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: CONTRACT_ADDRESS,
          data: encodeFunctionCall(method, args),
        }, 'latest'],
        id: 1,
      }),
    });
    
    const data = await response.json();
    return decodeResult({ data: data.result });
  } catch (err) {
    return null;
  }
}

function decodeResult(receipt) {
  try {
    if (receipt.logs && receipt.logs.length > 0) {
      const log = receipt.logs[0];
      return JSON.parse(hexToString(log.data));
    }
    
    if (receipt.data) {
      return JSON.parse(hexToString(receipt.data));
    }
    
    return { error: 'decode_failed' };
  } catch {
    return { error: 'decode_failed' };
  }
}

function hexToString(hex) {
  if (!hex || hex === '0x') return '';
  const str = hex.replace('0x', '');
  let result = '';
  for (let i = 0; i < str.length; i += 2) {
    const code = parseInt(str.substr(i, 2), 16);
    if (code > 0) result += String.fromCharCode(code);
  }
  return result;
}
