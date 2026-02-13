'use client';

import { useState, useEffect, useCallback } from 'react';
import { switchToGenLayer, getGenBalance, formatGen, networkConfig } from './genlayer';

/**
 * MetaMask wallet connection hook
 */
export function useWallet() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if connected to correct network
  const checkNetwork = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdNum = parseInt(currentChainId, 16);
      setChainId(chainIdNum);
      setIsCorrectNetwork(chainIdNum === networkConfig.chainId);
    } catch (err) {
      console.error('Check network error:', err);
    }
  }, []);

  // Update wallet balance
  const updateBalance = useCallback(async (addr) => {
    if (!addr) return;
    const bal = await getGenBalance(addr);
    setBalance(bal);
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('Please install MetaMask');
      return false;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) throw new Error('No accounts found');
      const addr = accounts[0];
      setAddress(addr);
      await switchToGenLayer();
      await checkNetwork();
      await updateBalance(addr);
      return true;
    } catch (err) {
      console.error('Connect error:', err);
      setError(err.message || 'Connection failed');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [checkNetwork, updateBalance]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance('0');
    setChainId(null);
    setIsCorrectNetwork(false);
  }, []);

  // Switch to GenLayer network
  const switchNetwork = useCallback(async () => {
    try {
      await switchToGenLayer();
      await checkNetwork();
      return true;
    } catch (err) {
      setError('Network switch failed');
      return false;
    }
  }, [checkNetwork]);

  // Listen for account and network changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        updateBalance(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      checkNetwork();
      if (address) updateBalance(address);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        updateBalance(accounts[0]);
        checkNetwork();
      }
    });

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [address, checkNetwork, disconnect, updateBalance]);

  return {
    address,
    balance,
    balanceFormatted: formatGen(balance),
    chainId,
    isConnected: !!address,
    isCorrectNetwork,
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork,
    refresh: () => updateBalance(address),
  };
}
