import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import CryptoJS from 'crypto-js';

export default function Verify() {
  const { contract, isConnected, connectWallet } = useWeb3();
  
  const [file, setFile] = useState(null);
  const [manualHash, setManualHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationError, setVerificationError] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('file');
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setVerificationResult(null);
      setVerificationError('');
    }
  };

  // Generate hash from file
  const generateHash = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        try {
          const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
          const hash = CryptoJS.SHA256(wordArray).toString();
          resolve(hash);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Verify document against blockchain
  const verifyDocument = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      await connectWallet();
      return;
    }
    
    let hash;
    
    try {
      setIsVerifying(true);
      setVerificationError('');
      setVerificationResult(null);
      
      if (verificationMethod === 'file') {
        if (!file) {
          setVerificationError('Please select a file to verify');
          setIsVerifying(false);
          return;
        }
        
        // Generate hash from file
        hash = await generateHash(file);
      } else {
        if (!manualHash.trim()) {
          setVerificationError('Please enter a document hash');
          setIsVerifying(false);
          return;
        }
        
        hash = manualHash.trim();
      }
      
      // Verify hash against blockchain
      const [isAuthentic, documentInfo] = await contract.verifyDocument(hash);
      
      if (isAuthentic) {
        setVerificationResult({
          isAuthentic,
          documentName: documentInfo.documentName,
          documentType: documentInfo.documentType,
          owner: documentInfo.owner,
          timestamp: Number(documentInfo.timestamp),
          documentHash: documentInfo.documentHash
        });
      } else {
        setVerificationResult({
          isAuthentic,
          documentHash: hash
        });
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      setVerificationError(error.message || 'Error verifying document on blockchain');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Verify Document Authenticity</h1>
        
        {!isConnected ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Connect your wallet to verify documents</p>
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => {
                    setVerificationMethod('file');
                    setVerificationResult(null);
                    setVerificationError('');
                  }}
                  className={`flex-1 py-2 text-center ${
                    verificationMethod === 'file'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => {
                    setVerificationMethod('hash');
                    setVerificationResult(null);
                    setVerificationError('');
                  }}
                  className={`flex-1 py-2 text-center ${
                    verificationMethod === 'hash'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Enter Hash
                </button>
              </div>
            </div>
            
            <form onSubmit={verifyDocument}>
              {verificationMethod === 'file' ? (
                <div className="mb-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors duration-300">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      {file ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-green-600 font-medium">{file.name}</span>
                          <span className="text-gray-500 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-gray-600 font-medium">Click to upload or drag and drop</span>
                          <span className="text-gray-500 text-sm mt-1">Upload the document you want to verify</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <label htmlFor="manualHash" className="block text-gray-700 font-medium mb-2">Document Hash</label>
                  <input
                    type="text"
                    id="manualHash"
                    value={manualHash}
                    onChange={(e) => setManualHash(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the SHA-256 hash of the document"
                    required={verificationMethod === 'hash'}
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Enter the document hash you received during the upload process
                  </p>
                </div>
              )}

              <div className="mb-6">
                <button
                  type="submit"
                  disabled={isVerifying || (verificationMethod === 'file' && !file) || (verificationMethod === 'hash' && !manualHash.trim())}
                  className={`w-full px-6 py-3 rounded-md text-white font-medium ${
                    isVerifying || (verificationMethod === 'file' && !file) || (verificationMethod === 'hash' && !manualHash.trim())
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify Document'
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {verificationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <p>{verificationError}</p>
          </div>
        )}

        {verificationResult && (
          <div className={`${
            verificationResult.isAuthentic
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          } px-4 py-5 rounded-md mb-6`}>
            <h3 className="font-bold text-lg mb-2">
              {verificationResult.isAuthentic
                ? 'Document is Authentic! ✓'
                : 'Document Not Found on Blockchain ✗'}
            </h3>
            
            <div className="mb-2">
              <span className="font-medium">Document Hash:</span>
              <p className="text-sm font-mono bg-white p-2 rounded mt-1 break-all">
                {verificationResult.documentHash}
              </p>
            </div>
            
            {verificationResult.isAuthentic && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="font-medium">Document Name:</span>
                    <p className="text-sm mt-1">{verificationResult.documentName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Document Type:</span>
                    <p className="text-sm mt-1">{verificationResult.documentType}</p>
                  </div>
                  <div>
                    <span className="font-medium">Added By:</span>
                    <p className="text-sm font-mono mt-1 break-all">{verificationResult.owner}</p>
                  </div>
                  <div>
                    <span className="font-medium">Timestamp:</span>
                    <p className="text-sm mt-1">{formatTimestamp(verificationResult.timestamp)}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm">
                  This document has been verified as authentic and unchanged since it was added to the blockchain.
                </p>
              </>
            )}
            
            {!verificationResult.isAuthentic && (
              <p className="mt-2 text-sm">
                This document was not found on the blockchain. It may not have been uploaded yet, or the document might have been modified since it was uploaded.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}