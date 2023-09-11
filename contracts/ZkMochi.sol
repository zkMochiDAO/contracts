// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


// ZkMochis is an ERC721 token with royalties and support for updating the metadata by setting a new base URI
// It is conforming to the requirements for custom collection that want to get listed on raresama
// Minting is done through a restricted mint() function that can only be called by addresses with the MINTER_ROLE
// Additional logic for a public or whitelist sale or other means of distribution should be implemented in a separate contract
// leveraging the mint() function of this contract
contract ZkMochi is ERC721, Ownable, ERC721Royalty {

    // Utility imports
    using Strings for uint256;

    // Constants
    string private constant URI_EXTENSION = ".json";

    // private fields to keep track of token ids and the base URI
    uint256 private _tokenIds = 0;
    string private _baseUri;

    // Constructor
    // the base URI is the prefix of the token and contract URI
    // example: ipfs://QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u/
    // please notice the trailing slash is required
    constructor(string memory baseURI) ERC721("ZkMochi", "ZKMCI") {
        // Setup base URI from constructor argument
        _baseUri = baseURI;

        // Setup royalties
        // A numerator of 500 means 5% of the sale price should be sent to the royality receiver
        // The receiver in this setup is the contract itself, but this can be adjusted to your needs
        address royaltyReceiver = address(this);
        uint96 royaltyFeeNumerator = 1000;
        _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumerator); // 10%
    }

    /* MUTATIONS */

    // setBaseURI() allows every address with the URI_SETTER_ROLE to change the base URI
    // usage: setBaseURI("ipfs://QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u/")
    function setBaseURI(string memory baseUri) public  onlyOwner {
        _baseUri = baseUri;
    }

    // mint() allows every address with the MINTER_ROLE to mint a batch of token to a given address
    // usage: mint(0x12345678123456781234567812345678, 10)
    function mint(address to, uint8 batchSize) public onlyOwner {
        unchecked {
            for (uint8 i = 0; i < batchSize; i++) {
                _tokenIds += 1;
                _mint(to, _tokenIds);
            }
        }
        
    }

    // withdrawTo() allows every address with the ADMIN_ROLE to withdraw the contract balance to a given address
    // usage: withdrawTo(0x12345678123456781234567812345678)
    function withdrawTo(address payable receiver) public onlyOwner {
        (bool success, ) = receiver.call{value: address(this).balance}("");
        require(success, "Failed to send token");
    }

    // burn() allows the owner of a token to burn it
    // usage: burn(123)
    function burn(uint256 tokenId) public {
        require(_ownerOf(tokenId) == msg.sender, "Caller is not the owner");
        _burn(tokenId);
    }

    /* VIEWS */

    // tokenURI() is a view function that returns the URI of a given token
    // usage: tokenURI(123) -> "ipfs://QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u/123.json
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return string(abi.encodePacked(_baseUri, tokenId.toString(), URI_EXTENSION));
    }

    // contractURI() is a view function that returns the URI of the contract
    // usage: contractURI() -> "ipfs://QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u/contract.json
    function contractURI() public view returns (string memory) {
        return string(abi.encodePacked(_baseUri, "contract", URI_EXTENSION));
    }

    /* INTERNALS */

    // _burn() is an internal function that is called by burn()
    // It is required to override the _burn() function from the base contracts
    function _burn(uint256 tokenId) internal override(ERC721, ERC721Royalty) {
        super._burn(tokenId);
    }

    // supportsInterface() is an internal function that is required because we are using multiple inheritance
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Royalty) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // _beforeTokenTransfer() is an internal function that is called by _transfer() and _mint()
    // It is required to override the _beforeTokenTransfer() function from the base contracts
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override(ERC721) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}