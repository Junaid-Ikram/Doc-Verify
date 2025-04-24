import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Link from 'next/link';
import DocumentVerification from '../artifacts/contracts/DocumentVerification.sol/DocumentVerification.json';
import contractAddresses from '../config/contractAddresses.json';

export default function SharedDocument() {
  const router = useRouter();
  const { token } = router.query;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [document, setDocument] = useState(null);
  const [isValid, setIsValid] = useState(false);
  
  // Format timestamp to readable date
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Verify document using token
  const verifyDocumentWithToken = async (token) => {
    try {
      setIsLoading(true);
      setError('');
      
      // Create a provider (read-only, no wallet needed)
      const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");
      
      // Create contract instance (read-only)
      const contractAddress = contractAddresses.DocumentVerification;
      const contract = new ethers.Contract(
        contractAddress,
        DocumentVerification.abi,
        provider
      );
      
      // Get document using token
      const result = await contract.getDocumentByToken(token);
      const isValid = result[0];
      const documentInfo = result[1];
      
      setIsValid(isValid);
      
      if (isValid) {
        setDocument({
          documentName: documentInfo.documentName,
          documentType: documentInfo.documentType,
          owner: documentInfo.owner,
          timestamp: Number(documentInfo.timestamp),
          documentHash: documentInfo.documentHash
        });
      }
    } catch (error) {
      console.error('Error verifying document with token:', error);
      setError('Error verifying document. The token may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load document when token is available
  useEffect(() => {
    if (token) {
      verifyDocumentWithToken(token);
    }
  }, [token]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Shared Document</h1>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <p>{error}</p>
          </div>
        ) : !token ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
            <p>No share token provided. Please use a valid share link.</p>
          </div>
        ) : !isValid ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-5 rounded-md mb-6">
            <h3 className="font-bold text-lg mb-2">
              Invalid or Expired Share Link ✗
            </h3>
            <p className="mt-2 text-sm">
              This share link is invalid, has expired, or has been revoked by the document owner.
            </p>
            <div className="mt-4">
              <Link href="/verify" legacyBehavior>
                <a className="text-blue-600 hover:underline">
                  Verify a document instead
                </a>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-5 rounded-md mb-6">
            <h3 className="font-bold text-lg mb-2">
              Document Verified ✓
            </h3>
            
            <div className="mb-2">
              <span className="font-medium">Document Hash:</span>
              <p className="text-sm font-mono bg-white p-2 rounded mt-1 break-all">
                {document.documentHash}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <span className="font-medium">Document Name:</span>
                <p className="text-sm mt-1">{document.documentName}</p>
              </div>
              <div>
                <span className="font-medium">Document Type:</span>
                <p className="text-sm mt-1">{document.documentType}</p>
              </div>
              <div>
                <span className="font-medium">Owner:</span>
                <p className="text-sm font-mono mt-1 break-all">{document.owner}</p>
              </div>
              <div>
                <span className="font-medium">Timestamp:</span>
                <p className="text-sm mt-1">{formatTimestamp(document.timestamp)}</p>
              </div>
            </div>
            
            <p className="mt-4 text-sm">
              This document has been verified as authentic and unchanged since it was added to the blockchain.
            </p>
            
            <div className="mt-6 flex space-x-4">
              <Link href="/verify" legacyBehavior>
                <a className="text-blue-600 hover:underline">
                  Verify another document
                </a>
              </Link>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>This is a read-only view of a shared document.</p>
          <p className="mt-1">
            <Link href="/" legacyBehavior>
              <a className="text-blue-600 hover:underline">
                Go to Document Verification App
              </a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}