// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract BaseVibe is ERC721Enumerable {
    uint256 private _nextTokenId;

    constructor() ERC721("BaseVibes", "VIBE") {}

    function mintVibe(address[] memory participants, string memory tokenURI) public {
        for (uint i = 0; i < participants.length; i++) {
            uint256 newItemId = _nextTokenId++;
            _safeMint(participants[i], newItemId);
            _setTokenURI(newItemId, tokenURI);
        }
    }
}
