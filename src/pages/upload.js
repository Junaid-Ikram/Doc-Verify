import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import CryptoJS from 'crypto-js';

export default function Upload() {
  const { contract, account, isConnected, connectWallet } = useWeb3();
  
  const [file, setFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [documentHash, setDocumentHash] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  
  const documentTypes = [
    'Certificate',
    'Diploma',
    'ID Card',
    'Passport',
    'License',
    'Contract',
    'Invoice',
    'Medical Record',
    'Academic Transcript',
    'Other'
  ];

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setDocumentName(e.target.files[0].name);
      setUploadSuccess(false);
      setUploadError('');
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

  // Upload document to blockchain
  const uploadDocument = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      await connectWallet();
      return;
    }
    
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }
    
    if (!documentName.trim()) {
      setUploadError('Please enter a document name');
      return;
    }
    
    if (!documentType) {
      setUploadError('Please select a document type');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadError('');
      
      // Generate hash from file
      const hash = await generateHash(file);
      setDocumentHash(hash);
      
      // Upload hash to blockchain
      const tx = await contract.addDocument(hash, documentType, documentName);
      await tx.wait();
      
      setTransactionHash(tx.hash);
      setUploadSuccess(true);
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadError(error.message || 'Error uploading document to blockchain');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload Document for Verification</h1>
        
        {!isConnected ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Connect your wallet to upload documents</p>
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Connect Wallet
            </button>
          </div>
        ) : (<form onSubmit={uploadDocument}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Select Document</label>
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
                      <span className="text-gray-500 text-sm mt-1">Supported formats: PDF, DOC, DOCX, JPG, PNG</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="documentName" className="block text-gray-700 font-medium mb-2">Document Name</label>
              <input
                type="text"
                id="documentName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter document name"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="documentType" className="block text-gray-700 font-medium mb-2">Document Type</label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select document type</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <button
                type="submit"
                disabled={isUploading || !file}
                className={`w-full px-6 py-3 rounded-md text-white font-medium ${
                  isUploading || !file
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Upload Document to Blockchain'
                )}
              </button>
            </div>
          </form>
        )}

        {uploadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <p>{uploadError}</p>
          </div>
        )}

        {uploadSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-5 rounded-md mb-6">
            <h3 className="font-bold text-lg mb-2">Document Uploaded Successfully!</h3>
            <div className="mb-2">
              <span className="font-medium">Document Hash:</span>
              <p className="text-sm font-mono bg-green-100 p-2 rounded mt-1 break-all">{documentHash}</p>
            </div>
            <div>
              <span className="font-medium">Transaction:</span>
              <a
                href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block text-sm font-mono bg-blue-50 p-2 rounded mt-1 break-all"
              >
                {transactionHash}
              </a>
            </div>
            <p className="mt-4 text-sm">
              Save this document hash for future verification. Anyone with this hash can verify the document's authenticity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}