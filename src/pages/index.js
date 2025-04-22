import { useEffect } from 'react';
import Link from 'next/link';
import { useWeb3 } from '../context/Web3Context';

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
      <div className="max-w-4xl w-full px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Blockchain Document Verification
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Securely verify the authenticity of your documents using blockchain technology
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
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
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Immutable Records</h3>
            <p className="text-gray-600">
              Documents are cryptographically hashed and stored on the Ethereum blockchain, making them tamper-proof and permanently verifiable.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Verification</h3>
            <p className="text-gray-600">
              Verify the authenticity of any document in seconds by comparing its hash with the record stored on the blockchain.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-purple-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Privacy Preserved</h3>
            <p className="text-gray-600">
              Only document hashes are stored on the blockchain, not the actual content, ensuring your sensitive information remains private.
            </p>
          </div>
        </div>
        
        <div className="mt-16 p-6 bg-blue-50 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-700">
            <li className="pl-2">
              <span className="font-medium">Upload Document:</span> Your document is hashed locally in your browser (the actual file never leaves your computer).
            </li>
            <li className="pl-2">
              <span className="font-medium">Store on Blockchain:</span> The document hash is stored on the Ethereum Sepolia testnet, creating a permanent timestamp.
            </li>
            <li className="pl-2">
              <span className="font-medium">Verify Anytime:</span> Anyone with the document can verify its authenticity by comparing its hash with the blockchain record.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}