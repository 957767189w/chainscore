'use client';

import { useState, useCallback } from 'react';
import { CONTRACT_ADDRESS, QUERY_FEE, networkConfig } from './genlayer';

export function useScore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [txHash, setTxHash] = useState(null);

  // 查询评分（需要支付 GEN）
  const queryScore = useCallback(async (targetAddress, signerAddress) => {
    if (!targetAddress || !signerAddress) {
      setError('缺少必要参数');
      return null;
    }

    if (!CONTRACT_ADDRESS) {
      setError('合约未配置');
      return null;
    }

    setLoading(true);
    setError(null);
    setScoreData(null);
    setTxHash(null);

    try {
      // 构建交易数据
      // calculate_score(address) 的函数签名
      const functionSelector = '0x1234'; // 实际需要计算
      
      // 使用 MetaMask 发送交易
      const txParams = {
        from: signerAddress,
        to: CONTRACT_ADDRESS,
        value: '0x' + QUERY_FEE.toString(16), // 0.1 GEN
        data: encodeFunctionCall('calculate_score', [targetAddress]),
      };

      // 发送交易
      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      setTxHash(hash);

      // 等待交易确认
      const receipt = await waitForTransaction(hash);
      
      if (!receipt.status) {
        throw new Error('扣款失败');
      }

      // 解析返回数据
      const result = decodeResult(receipt);
      
      if (result.error) {
        throw new Error(result.message || '扣款失败');
      }

      setScoreData(result);
      return result;

    } catch (err) {
      console.error('Query error:', err);
      
      // 用户拒绝交易
      if (err.code === 4001) {
        setError('交易已取消');
      } else if (err.message?.includes('insufficient')) {
        setError('GEN 余额不足');
      } else {
        setError(err.message || '扣款失败');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 查询缓存（免费）
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

  // 清除状态
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

// ===== 辅助函数 =====

// 编码函数调用（简化版，实际需要 ABI 编码）
function encodeFunctionCall(method, args) {
  // 这里需要实际的 ABI 编码
  // 使用 ethers.js 或手动编码
  
  // calculate_score(string address) 的简化编码
  const methodId = '0x9b8b9a35'; // keccak256('calculate_score(string)')[:4]
  const addressParam = args[0].toLowerCase().replace('0x', '').padStart(64, '0');
  
  return methodId + addressParam;
}

// 等待交易确认
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
      // 继续等待
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('交易确认超时');
}

// 调用只读方法
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

// 解码返回结果
function decodeResult(receipt) {
  // 简化的解码逻辑
  // 实际需要根据合约 ABI 解码
  try {
    if (receipt.logs && receipt.logs.length > 0) {
      // 从事件日志解析
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

// Hex 转字符串
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
