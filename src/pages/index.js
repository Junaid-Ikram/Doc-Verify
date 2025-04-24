import { useEffect } from 'react';
import Link from 'next/link';
import { useWeb3 } from '../context/Web3Context';
import Image from 'next/image';

export default function Home() {
  const { connectWallet, isConnected } = useWeb3();

  useEffect(() => {
    // Auto connect wallet if user has previously connected
    if (typeof window !== 'undefined' && window.ethereum && !isConnected) {
      connectWallet();
    }
  }, [connectWallet, isConnected]);

  return (
    <div className="flex flex-col items-center">
      <div className="max-w-6xl w-full px-4 py-12">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <div className="md:w-1/2 text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              <span className="text-blue-600">Secure</span> Document Verification on Blockchain
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Version 2.0 with enhanced document sharing and ownership transfer capabilities
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/upload">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
                  Upload Document
                </button>
              </Link>
              <Link href="/verify">
                <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
                  Verify Document
                </button>
              </Link>
              <Link href="/share-document">
                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
                  Share Document
                </button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md h-64 md:h-80 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-blue-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v4a1 1 0 001 1h4" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-transparent h-1/3"></div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border border-gray-100">
              <div className="text-blue-500 mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Immutable Records</h3>
              <p className="text-gray-600 text-center">
                Documents are cryptographically hashed and stored on the Ethereum blockchain, making them tamper-proof and permanently verifiable.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border border-gray-100">
              <div className="text-green-500 mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Instant Verification</h3>
              <p className="text-gray-600 text-center">
                Verify the authenticity of any document in seconds by comparing its hash with the record stored on the blockchain.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border border-gray-100">
              <div className="text-purple-500 mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Document Sharing</h3>
              <p className="text-gray-600 text-center">
                Securely share your verified documents with others using time-limited access tokens while maintaining full control.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border border-gray-100">
              <div className="text-amber-500 mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Transfer Ownership</h3>
              <p className="text-gray-600 text-center">
                Transfer document ownership to another wallet address, perfect for legal document handovers and asset transfers.
              </p>
            </div>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="mb-16 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">1</div>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-center">Upload Document</h3>
              <p className="text-gray-600 text-center">
                Your document is hashed locally in your browser. The actual file never leaves your computer, ensuring complete privacy.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">2</div>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-center">Store on Blockchain</h3>
              <p className="text-gray-600 text-center">
                The document hash is stored on the Ethereum Sepolia testnet, creating a permanent timestamp and proof of existence.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">3</div>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-center">Share & Verify</h3>
              <p className="text-gray-600 text-center">
                Share documents securely with others or transfer ownership. Anyone with the document can verify its authenticity instantly.
              </p>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
              <p className="text-blue-100">Connect your wallet and start verifying documents today.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/upload">
                <button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow-lg transition duration-300 hover:bg-blue-50">
                  Upload Document
                </button>
              </Link>
              <Link href="/my-documents">
                <button className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-lg shadow-lg transition duration-300 border border-blue-400">
                  My Documents
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}