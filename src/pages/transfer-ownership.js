import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import CryptoJS from 'crypto-js';

export default function TransferOwnership() {
  const { contract, account, isConnected, connectWallet } = useWeb3();
  
  const [file, setFile] = useState(null);
  const [manualHash, setManualHash] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('file');
  const [documentHash, setDocumentHash] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [transferResult, setTransferResult] = useState(null);
  const [error, setError] = useState('');
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setVerificationResult(null);
      setError('');
      setTransferResult(null);
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
      setError('');
      setVerificationResult(null);
      setTransferResult(null);
      
      if (verificationMethod === 'file') {
        if (!file) {
          setError('Please select a file to verify');
          setIsVerifying(false);
          return;
        }
        
        // Generate hash from file
        hash = await generateHash(file);
      } else {
        if (!manualHash.trim()) {
          setError('Please enter a document hash');
          setIsVerifying(false);
          return;
        }
        
        hash = manualHash.trim();
      }
      
      setDocumentHash(hash);
      
      // Verify hash against blockchain
      const [isAuthentic, documentInfo] = await contract.verifyDocument(hash);
      
      if (isAuthentic) {
        // Check if the current user is the owner of the document
        const isOwner = documentInfo.owner.toLowerCase() === account.toLowerCase();
        
        setVerificationResult({
          isAuthentic,
          isOwner,
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
      setError(error.message || 'Error verifying document on blockchain');
    } finally {
      setIsVerifying(false);
    }
  };

  // Transfer document ownership
  const transferOwnership = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      await connectWallet();
      return;
    }
    
    if (!documentHash) {
      setError('Please verify a document first');
      return;
    }
    
    if (!newOwnerAddress) {
      setError('Please enter the new owner\'s address');
      return;
    }
    
    try {
      setIsTransferring(true);
      setError('');
      setTransferResult(null);
      
      // Call the smart contract to transfer ownership
      const tx = await contract.transferDocumentOwnership(documentHash, newOwnerAddress);
      await tx.wait();
      
      setTransferResult({
        success: true,
        message: 'Document ownership transferred successfully!',
        txHash: tx.hash,
        previousOwner: account,
        newOwner: newOwnerAddress
      });
      
      // Clear the form
      setNewOwnerAddress('');
      setVerificationResult(null);
    } catch (error) {
      console.error('Error transferring document ownership:', error);
      setTransferResult({
        success: false,
        message: error.message || 'Error transferring document ownership'
      });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Transfer Document Ownership</h1>
        
        {!isConnected ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Connect your wallet to transfer document ownership</p>
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
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Step 1: Verify Document Ownership</h2>
              <p className="text-gray-600 mb-4">First, verify that you own the document you want to transfer.</p>
              
              <div className="flex border border-gray-300 rounded-md overflow-hidden mb-4">
                <button
                  onClick={() => {
                    setVerificationMethod('file');
                    setVerificationResult(null);
                    setError('');
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
                    setError('');
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
              
              <form onSubmit={verifyDocument}>
                {verificationMethod === 'file' ? (
                  <div className="mb-4">
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
                            <span className="text-gray-500 text-sm mt-1">Upload the document you want to transfer</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
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
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                <p>{error}</p>
              </div>
            )}

            {verificationResult && verificationResult.isAuthentic && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-5 rounded-md mb-6">
                <h3 className="font-bold text-lg mb-2">
                  Document Verified ✓
                </h3>
                
                <div className="mb-2">
                  <span className="font-medium">Document Hash:</span>
                  <p className="text-sm font-mono bg-white p-2 rounded mt-1 break-all">
                    {verificationResult.documentHash}
                  </p>
                </div>
                
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
                    <span className="font-medium">Current Owner:</span>
                    <p className="text-sm font-mono mt-1 break-all">{verificationResult.owner}</p>
                  </div>
                  <div>
                    <span className="font-medium">Timestamp:</span>
                    <p className="text-sm mt-1">{formatTimestamp(verificationResult.timestamp)}</p>
                  </div>
                </div>
                
                {verificationResult.isOwner ? (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Step 2: Transfer Ownership</h2>
                    <p className="text-gray-600 mb-4">You are the owner of this document. You can transfer ownership to another address.</p>
                    
                    <form onSubmit={transferOwnership}>
                      <div className="mb-4">
                        <label htmlFor="newOwnerAddress" className="block text-gray-700 font-medium mb-2">New Owner Address</label>
                        <input
                          type="text"
                          id="newOwnerAddress"
                          value={newOwnerAddress}
                          onChange={(e) => setNewOwnerAddress(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0x..."
                          required
                        />
                        <p className="text-gray-500 text-sm mt-1">
                          Enter the Ethereum address of the new owner
                        </p>
                      </div>
                      
                      <div className="mb-6">
                        <button
                          type="submit"
                          disabled={isTransferring || !newOwnerAddress.trim()}
                          className={`w-full px-6 py-3 rounded-md text-white font-medium ${
                            isTransferring || !newOwnerAddress.trim()
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isTransferring ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                              <span>Transferring...</span>
                            </div>
                          ) : (
                            'Transfer Ownership'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
                    <p className="font-medium">You are not the owner of this document</p>
                    <p className="text-sm mt-1">Only the document owner can transfer ownership.</p>
                  </div>
                )}
              </div>
            )}
            
            {verificationResult && !verificationResult.isAuthentic && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-5 rounded-md mb-6">
                <h3 className="font-bold text-lg mb-2">
                  Document Not Found on Blockchain ✗
                </h3>
                
                <div className="mb-2">
                  <span className="font-medium">Document Hash:</span>
                  <p className="text-sm font-mono bg-white p-2 rounded mt-1 break-all">
                    {verificationResult.documentHash}
                  </p>
                </div>
                
                <p className="mt-2 text-sm">
                  This document was not found on the blockchain. It may not have been uploaded yet, or the document might have been modified since it was uploaded.
                </p>
              </div>
            )}
            
            {transferResult && (
              <div className={`${transferResult.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'} px-4 py-5 rounded-md mb-6`}>
                <h3 className="font-bold text-lg mb-2">
                  {transferResult.success ? 'Ownership Transfer Successful ✓' : 'Ownership Transfer Failed ✗'}
                </h3>
                
                <p className="mt-2">{transferResult.message}</p>
                
                {transferResult.success && (
                  <div className="mt-4">
                    <div className="mb-2">
                      <span className="font-medium">Transaction Hash:</span>
                      <p className="text-sm font-mono bg-white p-2 rounded mt-1 break-all">
                        {transferResult.txHash}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <span className="font-medium">Previous Owner:</span>
                        <p className="text-sm font-mono mt-1 break-all">{transferResult.previousOwner}</p>
                      </div>
                      <div>
                        <span className="font-medium">New Owner:</span>
                        <p className="text-sm font-mono mt-1 break-all">{transferResult.newOwner}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}