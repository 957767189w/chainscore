// GenLayer 客户端配置
// 支持 Studio 和 Testnet Asimov

import { createClient } from 'genlayer-js';
import { studionet, testnetAsimov } from 'genlayer-js/chains';

// 网络配置
export const NETWORKS = {
  studionet: {
    name: 'GenLayer Studio',
    chain: studionet,
    rpcUrl: 'http://localhost:4000/api',
    chainId: 61999,
    explorer: null,
  },
  testnet: {
    name: 'Testnet Asimov',
    chain: testnetAsimov,
    rpcUrl: 'https://testnet-rpc.genlayer.com',
    chainId: 61998,
    explorer: 'https://testnet-explorer.genlayer.com',
  },
};

// 当前网络（可通过环境变量切换）
const CURRENT_NETWORK = process.env.NEXT_PUBLIC_GENLAYER_NETWORK || 'testnet';

export const networkConfig = NETWORKS[CURRENT_NETWORK];

// 合约地址（部署后填入）
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

// 查询费用（0.1 GEN，18位小数）
export const QUERY_FEE = BigInt('100000000000000000');

// 创建只读客户端
export function createReadClient() {
  return createClient({
    chain: networkConfig.chain,
  });
}

// 创建带签名的客户端（用于 MetaMask）
export function createSignerClient(address) {
  return createClient({
    chain: networkConfig.chain,
    account: address,
  });
}

// MetaMask 添加 GenLayer 网络
export async function addGenLayerNetwork() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${networkConfig.chainId.toString(16)}`,
        chainName: networkConfig.name,
        nativeCurrency: {
          name: 'GEN',
          symbol: 'GEN',
          decimals: 18,
        },
        rpcUrls: [networkConfig.rpcUrl],
        blockExplorerUrls: networkConfig.explorer ? [networkConfig.explorer] : [],
      }],
    });
    return true;
  } catch (error) {
    console.error('Failed to add network:', error);
    throw error;
  }
}

// 切换到 GenLayer 网络
export async function switchToGenLayer() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${networkConfig.chainId.toString(16)}` }],
    });
    return true;
  } catch (error) {
    // 如果网络不存在，添加它
    if (error.code === 4902) {
      return await addGenLayerNetwork();
    }
    throw error;
  }
}

// 获取 GEN 余额
export async function getGenBalance(address) {
  if (typeof window === 'undefined' || !window.ethereum) {
    return '0';
  }

  try {
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });
    return balance;
  } catch (error) {
    console.error('Failed to get balance:', error);
    return '0';
  }
}

// 格式化 GEN 数量
export function formatGen(wei) {
  const value = BigInt(wei);
  const gen = Number(value) / 1e18;
  return gen.toFixed(4);
}

// 解析 GEN 到 wei
export function parseGen(gen) {
  return BigInt(Math.floor(parseFloat(gen) * 1e18));
}
