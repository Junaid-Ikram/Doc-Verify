import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import DocumentVerification from '../artifacts/contracts/DocumentVerification.sol/DocumentVerification.json';
import contractAddresses from '../config/contractAddresses.json';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState(null);

  const connectWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to use this application.");
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setAccount(account);

      // Create Web3 provider and signer - Updated for ethers v6
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      const signer = await provider.getSigner();
      setSigner(signer);

      // Check network
      const network = await provider.getNetwork();
      setNetwork(network);

      // Check if on Sepolia network (chain ID 11155111)
      if (network.chainId !== 11155111n) {
        setError("Please connect to the Sepolia test network");
      }

      // Create contract instance
      const contractAddress = contractAddresses.DocumentVerification;
      const contract = new ethers.Contract(
        contractAddress,
        DocumentVerification.abi,
        signer
      );
      setContract(contract);
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle account and network changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setIsConnected(false);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        contract,
        isLoading,
        error,
        isConnected,
        network,
        connectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => React.useContext(Web3Context);