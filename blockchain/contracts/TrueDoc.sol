// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TrueDoc {

    struct Document {
        address issuer;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Document) private documents;

    function registerDocument(string memory _docHash) public {
        require(!documents[_docHash].exists, "Document already registered");

        documents[_docHash] = Document({
            issuer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
    }

    function verifyDocument(string memory _docHash)
        public
        view
        returns (bool exists, address issuer, uint256 timestamp)
    {
        Document memory doc = documents[_docHash];
        return (doc.exists, doc.issuer, doc.timestamp);
    }
}
