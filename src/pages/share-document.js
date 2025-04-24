import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ShareDocument() {
  const { contract, account, isConnected, connectWallet } = useWeb3();
  const router = useRouter();
  
  const [documentHashes, setDocumentHashes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [shareTokens, setShareTokens] = useState([]);
  const [expiryTime, setExpiryTime] = useState('');
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [isRevokingToken, setIsRevokingToken] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [newToken, setNewToken] = useState('');
  
  // Format timestamp to readable date
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Calculate expiry time options
  const getExpiryTimeOptions = () => {
    // Use a fixed reference time when the component mounts
    // This prevents the values from changing on re-renders
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    
    return [
      { label: '1 hour', value: String(now + 3600) },
      { label: '24 hours', value: String(now + 86400) },
      { label: '7 days', value: String(now + 604800) },
      { label: '30 days', value: String(now + 2592000) },
    ];
  };
  
  // Memoize the options to prevent recalculation on every render
  const [expiryOptions] = useState(getExpiryTimeOptions());

  // Handle document selection change
  const handleDocumentChange = (e) => {
    const hash = e.target.value;
    if (!hash) {
      setSelectedDocument(null);
      setShareTokens([]);
      return;
    }
    
    const doc = documents.find(d => d.documentHash === hash);
    setSelectedDocument(doc);
  };

  // Load user's documents
  const loadDocuments = async () => {
    if (!isConnected || !contract) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Get document hashes owned by the current user
      const hashes = await contract.getDocumentsByOwner(account);
      setDocumentHashes(hashes);
      
      // Get document details for each hash
      const documentsData = await Promise.all(
        hashes.map(async (hash) => {
          const document = await contract.getDocument(hash);
          return {
            documentHash: document.documentHash,
            documentName: document.documentName,
            documentType: document.documentType,
            timestamp: Number(document.timestamp),
            owner: document.owner
          };
        })
      );
      
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Error loading your documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load share tokens for a document
  const loadShareTokens = async (documentHash) => {
    if (!isConnected || !contract || !documentHash) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Get share tokens for the document
      const tokens = await contract.getDocumentShareTokens(documentHash);
      
      // Format tokens data
      const formattedTokens = tokens.map(token => ({
        token: token.token,
        documentHash: token.documentHash,
        expiryTime: Number(token.expiryTime),
        isRevoked: token.isRevoked,
        isExpired: Number(token.expiryTime) < Math.floor(Date.now() / 1000)
      }));
      
      setShareTokens(formattedTokens);
    } catch (error) {
      console.error('Error loading share tokens:', error);
      setError('Error loading share tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new share token
  const createShareToken = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      await connectWallet();
      return;
    }
    
    if (!selectedDocument) {
      setError('Please select a document to share');
      return;
    }
    
    if (!expiryTime) {
      setError('Please select an expiry time');
      return;
    }
    
    // Ensure expiryTime is a number
    const expiryTimeValue = parseInt(expiryTime, 10);
    
    if (isNaN(expiryTimeValue)) {
      setError('Invalid expiry time value');
      return;
    }
    
    try {
      setIsCreatingToken(true);
      setError('');
      setShareSuccess(false);
      
      // Call the smart contract to create a share token
      const tx = await contract.createShareToken(selectedDocument.documentHash, expiryTimeValue);
      
      // Get the transaction receipt
      const receipt = await tx.wait();
      
      // In ethers v6, events are accessed differently
      // Look for the ShareTokenCreated event in the logs
      const shareTokenCreatedEvent = receipt.logs
        .filter(log => log.topics.length > 0)
        .map(log => {
          try {
            return contract.interface.parseLog({ topics: log.topics, data: log.data });
          } catch (e) {
            return null;
          }
        })
        .filter(parsedLog => parsedLog && parsedLog.name === 'ShareTokenCreated')[0];
      
      // Extract the token from the event args
      const token = shareTokenCreatedEvent?.args[1] || ''; // The token is the second argument
      
      setNewToken(token);
      setShareSuccess(true);
      
      // Reload share tokens
      await loadShareTokens(selectedDocument.documentHash);
    } catch (error) {
      console.error('Error creating share token:', error);
      setError(error.message || 'Error creating share token');
    } finally {
      setIsCreatingToken(false);
    }
  };

  // Revoke a share token
  const revokeShareToken = async (token) => {
    if (!isConnected) {
      await connectWallet();
      return;
    }
    
    try {
      setIsRevokingToken(true);
      setError('');
      
      // Call the smart contract to revoke the share token
      const tx = await contract.revokeShareToken(token);
      await tx.wait();
      
      // Reload share tokens
      await loadShareTokens(selectedDocument.documentHash);
    } catch (error) {
      console.error('Error revoking share token:', error);
      setError(error.message || 'Error revoking share token');
    } finally {
      setIsRevokingToken(false);
    }
  };

  // Generate share link
  const generateShareLink = (token) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared-document?token=${token}`;
  };

  // Copy share link to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Load documents when component mounts or when connection status changes
  useEffect(() => {
    if (isConnected) {
      loadDocuments();
    }
  }, [isConnected, contract, account]);

  // Load share tokens when selected document changes
  useEffect(() => {
    if (selectedDocument) {
      loadShareTokens(selectedDocument.documentHash);
    } else {
      setShareTokens([]);
    }
  }, [selectedDocument, contract, isConnected]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Share Documents</h1>
        
        {!isConnected ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Connect your wallet to share your documents</p>
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div>
            {isLoading && documents.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You don't have any documents yet</p>
                <Link href="/upload" legacyBehavior>
                  <a className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                    Upload a Document
                  </a>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Documents</h2>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <select
                      className="w-full px-4 py-3 border-0 focus:ring-0 focus:outline-none"
                      onChange={handleDocumentChange}
                      value={selectedDocument?.documentHash || ''}
                    >
                      <option value="">Select a document</option>
                      {documents.map((doc) => (
                        <option key={doc.documentHash} value={doc.documentHash}>
                          {doc.documentName} ({doc.documentType})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  {selectedDocument ? (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-700 mb-4">Share "{selectedDocument.documentName}"</h2>
                      
                      <div className="mb-6">
                        <h3 className="font-medium text-gray-700 mb-2">Create New Share Link</h3>
                        <form onSubmit={createShareToken}>
                          <div className="mb-4">
                            <label htmlFor="expiryTime" className="block text-gray-600 text-sm mb-1">Expiry Time</label>
                            <select
                              id="expiryTime"
                              value={expiryTime}
                              onChange={(e) => setExpiryTime(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="">Select expiry time</option>
                              {expiryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <button
                            type="submit"
                            disabled={isCreatingToken}
                            className={`w-full px-4 py-2 rounded-md text-white font-medium ${isCreatingToken ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                          >
                            {isCreatingToken ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                <span>Creating...</span>
                              </div>
                            ) : (
                              'Create Share Link'
                            )}
                          </button>
                        </form>
                      </div>
                      
                      {shareSuccess && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                          <h3 className="font-bold text-sm mb-1">Share Link Created!</h3>
                          <div className="flex items-center mt-2">
                            <input
                              type="text"
                              value={generateShareLink(newToken)}
                              readOnly
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none text-sm font-mono bg-white"
                            />
                            <button
                              onClick={() => copyToClipboard(generateShareLink(newToken))}
                              className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="text-xs mt-2">
                            Anyone with this link can view the document details without connecting a wallet.
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">Active Share Links</h3>
                        {isLoading ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                          </div>
                        ) : shareTokens.length === 0 ? (
                          <p className="text-gray-500 text-sm py-2">No active share links for this document</p>
                        ) : (
                          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                            {shareTokens
                              .filter(token => !token.isRevoked && !token.isExpired)
                              .map((token) => (
                                <li key={token.token} className="px-4 py-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="text-sm font-medium text-gray-800 mb-1">
                                        Expires: {formatTimestamp(token.expiryTime)}
                                      </div>
                                      <div className="text-xs font-mono text-gray-500 truncate max-w-xs">
                                        {token.token}
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => copyToClipboard(generateShareLink(token.token))}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                      >
                                        Copy Link
                                      </button>
                                      <button
                                        onClick={() => revokeShareToken(token.token)}
                                        disabled={isRevokingToken}
                                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                      >
                                        Revoke
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                          </ul>
                        )}
                        
                        {shareTokens.filter(token => token.isRevoked || token.isExpired).length > 0 && (
                          <div className="mt-4">
                            <h3 className="font-medium text-gray-700 mb-2">Expired/Revoked Links</h3>
                            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                              {shareTokens
                                .filter(token => token.isRevoked || token.isExpired)
                                .map((token) => (
                                  <li key={token.token} className="px-4 py-3">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="text-sm font-medium text-gray-800 mb-1">
                                          {token.isRevoked ? 'Revoked' : 'Expired'}: {formatTimestamp(token.expiryTime)}
                                        </div>
                                        <div className="text-xs font-mono text-gray-500 truncate max-w-xs">
                                          {token.token}
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Select a document to share</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p>{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}