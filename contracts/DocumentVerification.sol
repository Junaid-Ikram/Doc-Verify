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

    mapping(string => Document) private documents;
    string[] private documentHashes;

    event DocumentAdded(string indexed documentHash, address indexed owner, uint256 timestamp);

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
}
