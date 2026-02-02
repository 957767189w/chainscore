import { createClient } from 'genlayer-js';
import { simulator, testnet } from 'genlayer-js/chains';

export const NETWORKS = {
  studionet: {
    name: 'GenLayer Studio',
    chain: simulator,
    rpcUrl: 'https://studio-api.genlayer.com/api',
    chainId: 61999,
    explorer: 'https://studio.genlayer.com',
  },
  testnet: {
    name: 'GenLayer Testnet',
    chain: testnet,
    rpcUrl: 'https://studio-api.genlayer.com/api',
    chainId: 61998,
    explorer: 'https://studio.genlayer.com',
  },
};

export const networkConfig = NETWORKS.studionet;

export const CONTRACT_ADDRESS = '0xC2Dd389015255B31c58F47bd421b1510bbD15860';

export const QUERY_FEE = BigInt('0');

export function createReadClient() {
  return createClient({ chain: networkConfig.chain });
}

export function createSignerClient(address) {
  return createClient({ chain: networkConfig.chain, account: address });
}

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
        nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
        rpcUrls: [networkConfig.rpcUrl],
        blockExplorerUrls: [networkConfig.explorer],
      }],
    });
    return true;
  } catch (error) {
    console.error('Failed to add network:', error);
    throw error;
  }
}

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
    if (error.code === 4902) {
      return await addGenLayerNetwork();
    }
    throw error;
  }
}

export async function getGenBalance(address) {
  if (typeof window === 'undefined' || !window.ethereum) return '0';
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

export function formatGen(wei) {
  try {
    const value = BigInt(wei);
    const gen = Number(value) / 1e18;
    return gen.toFixed(4);
  } catch {
    return '0.0000';
  }
}

export function parseGen(gen) {
  return BigInt(Math.floor(parseFloat(gen) * 1e18));
}
