// GenLayer Client Configuration
// Supports Studio and Testnet Asimov

import { createClient } from 'genlayer-js';
import { studionet, testnetAsimov } from 'genlayer-js/chains';

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

const CURRENT_NETWORK = process.env.NEXT_PUBLIC_GENLAYER_NETWORK || 'testnet';

export const networkConfig = NETWORKS[CURRENT_NETWORK];

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

// Query fee (free)
export const QUERY_FEE = BigInt('0');

export function createReadClient() {
  return createClient({
    chain: networkConfig.chain,
  });
}

export function createSignerClient(address) {
  return createClient({
    chain: networkConfig.chain,
    account: address,
  });
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

export function formatGen(wei) {
  const value = BigInt(wei);
  const gen = Number(value) / 1e18;
  return gen.toFixed(4);
}

export function parseGen(gen) {
  return BigInt(Math.floor(parseFloat(gen) * 1e18));
}
