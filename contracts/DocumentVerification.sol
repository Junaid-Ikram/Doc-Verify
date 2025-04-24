// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DocumentVerification
 * @dev Contract for verifying document authenticity on the blockchain
 */
contract DocumentVerification is Ownable {
    constructor() Ownable(msg.sender) {}

    struct Document {
        string documentHash;
        address owner;
        uint256 timestamp;
        string documentType;
        string documentName;
    }
    
    struct ShareToken {
        string token;
        string documentHash;
        uint256 expiryTime;
        bool isRevoked;
    }

    mapping(string => Document) private documents;
    string[] private documentHashes;
    mapping(string => ShareToken) private shareTokens;
    mapping(string => string[]) private documentShareTokens; // Maps document hash to its share tokens

    event DocumentAdded(string indexed documentHash, address indexed owner, uint256 timestamp);
    event DocumentOwnershipTransferred(string indexed documentHash, address indexed previousOwner, address indexed newOwner);
    event ShareTokenCreated(string indexed documentHash, string token, uint256 expiryTime);
    event ShareTokenRevoked(string indexed documentHash, string token);

    /**
     * @dev Add a new document to the blockchain
     */
    function addDocument(string memory _documentHash, string memory _documentType, string memory _documentName) public {
        require(bytes(_documentHash).length > 0, "Document hash cannot be empty");
        require(bytes(documents[_documentHash].documentHash).length == 0, "Document already exists");

        documents[_documentHash] = Document({
            documentHash: _documentHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            documentType: _documentType,
            documentName: _documentName
        });

        documentHashes.push(_documentHash);

        emit DocumentAdded(_documentHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify if a document exists on the blockchain
     */
    function verifyDocument(string memory _documentHash) public view returns (bool isAuthentic, Document memory documentInfo) {
        isAuthentic = bytes(documents[_documentHash].documentHash).length > 0;
        documentInfo = documents[_documentHash];
        return (isAuthentic, documentInfo);
    }

    /**
     * @dev Get document information
     */
    function getDocument(string memory _documentHash) public view returns (Document memory) {
        return documents[_documentHash];
    }

    /**
     * @dev Get all documents added by a specific address
     */
    function getDocumentsByOwner(address _owner) public view returns (string[] memory) {
        uint count = 0;

        for (uint i = 0; i < documentHashes.length; i++) {
            if (documents[documentHashes[i]].owner == _owner) {
                count++;
            }
        }

        string[] memory result = new string[](count);
        uint index = 0;

        for (uint i = 0; i < documentHashes.length; i++) {
            if (documents[documentHashes[i]].owner == _owner) {
                result[index] = documentHashes[i];
                index++;
            }
        }

        return result;
    }

    /**
     * @dev Get the total number of documents stored
     */
    function getDocumentCount() public view returns (uint256) {
        return documentHashes.length;
    }
    
    /**
     * @dev Transfer ownership of a document to a new address
     * @param _documentHash The hash of the document to transfer
     * @param _newOwner The address of the new owner
     */
    function transferDocumentOwnership(string memory _documentHash, address _newOwner) public {
        require(bytes(documents[_documentHash].documentHash).length > 0, "Document does not exist");
        require(documents[_documentHash].owner == msg.sender, "Only the document owner can transfer ownership");
        require(_newOwner != address(0), "New owner cannot be the zero address");
        require(_newOwner != msg.sender, "New owner cannot be the current owner");
        
        address previousOwner = documents[_documentHash].owner;
        documents[_documentHash].owner = _newOwner;
        
        emit DocumentOwnershipTransferred(_documentHash, previousOwner, _newOwner);
    }
    
    /**
     * @dev Generate a share token for a document
     * @param _documentHash The hash of the document to share
     * @param _expiryTime The timestamp when the token expires (in seconds since epoch)
     * @return token The generated share token
     */
    function createShareToken(string memory _documentHash, uint256 _expiryTime) public returns (string memory) {
        require(bytes(documents[_documentHash].documentHash).length > 0, "Document does not exist");
        require(documents[_documentHash].owner == msg.sender, "Only the document owner can create share tokens");
        require(_expiryTime > block.timestamp, "Expiry time must be in the future");
        
        // Generate a unique token using keccak256 hash of document hash, sender, timestamp, and a nonce
        string memory tokenBase = string(abi.encodePacked(_documentHash, msg.sender, block.timestamp, documentShareTokens[_documentHash].length));
        string memory token = toHexString(uint256(keccak256(abi.encodePacked(tokenBase))));
        
        // Store the share token
        shareTokens[token] = ShareToken({
            token: token,
            documentHash: _documentHash,
            expiryTime: _expiryTime,
            isRevoked: false
        });
        
        // Add token to document's tokens list
        documentShareTokens[_documentHash].push(token);
        
        emit ShareTokenCreated(_documentHash, token, _expiryTime);
        
        return token;
    }
    
    /**
     * @dev Revoke a share token
     * @param _token The token to revoke
     */
    function revokeShareToken(string memory _token) public {
        require(bytes(shareTokens[_token].token).length > 0, "Share token does not exist");
        string memory documentHash = shareTokens[_token].documentHash;
        require(documents[documentHash].owner == msg.sender, "Only the document owner can revoke share tokens");
        
        shareTokens[_token].isRevoked = true;
        
        emit ShareTokenRevoked(documentHash, _token);
    }
    
    /**
     * @dev Get document information using a share token
     * @param _token The share token
     * @return isValid Whether the token is valid
     * @return documentInfo The document information
     */
    function getDocumentByToken(string memory _token) public view returns (bool isValid, Document memory documentInfo) {
        // Check if token exists
        if (bytes(shareTokens[_token].token).length == 0) {
            return (false, Document("", address(0), 0, "", ""));
        }
        
        ShareToken memory shareToken = shareTokens[_token];
        
        // Check if token is expired or revoked
        if (shareToken.expiryTime < block.timestamp || shareToken.isRevoked) {
            return (false, Document("", address(0), 0, "", ""));
        }
        
        // Return the document information
        return (true, documents[shareToken.documentHash]);
    }
    
    /**
     * @dev Get all share tokens for a document
     * @param _documentHash The document hash
     * @return tokens Array of share tokens
     */
    function getDocumentShareTokens(string memory _documentHash) public view returns (ShareToken[] memory) {
        require(bytes(documents[_documentHash].documentHash).length > 0, "Document does not exist");
        require(documents[_documentHash].owner == msg.sender, "Only the document owner can view share tokens");
        
        string[] memory tokenIds = documentShareTokens[_documentHash];
        ShareToken[] memory tokens = new ShareToken[](tokenIds.length);
        
        for (uint i = 0; i < tokenIds.length; i++) {
            tokens[i] = shareTokens[tokenIds[i]];
        }
        
        return tokens;
    }
    
    /**
     * @dev Convert a uint256 to its hex string representation
     * @param value The uint256 value
     * @return result The hex string
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0x00";
        }
        
        bytes memory buffer = new bytes(64);
        uint256 length = 0;
        
        for (uint256 i = 0; i < 32; i++) {
            uint8 byteValue = uint8((value >> (8 * (31 - i))) & 0xff);
            
            if (length > 0 || byteValue > 0) {
                uint8 hi = uint8(byteValue >> 4);
                uint8 lo = uint8(byteValue & 0xf);
                
                buffer[length++] = hi < 10 ? bytes1(uint8(48 + hi)) : bytes1(uint8(87 + hi)); // '0'-'9' or 'a'-'f'
                buffer[length++] = lo < 10 ? bytes1(uint8(48 + lo)) : bytes1(uint8(87 + lo)); // '0'-'9' or 'a'-'f'
            }
        }
        
        bytes memory result = new bytes(length + 2);
        result[0] = '0';
        result[1] = 'x';
        
        for (uint256 i = 0; i < length; i++) {
            result[i + 2] = buffer[i];
        }
        
        return string(result);
    }
}
