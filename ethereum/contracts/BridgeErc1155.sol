// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract BridgeErc1155 is ERC1155 {
    address public gatewayAddress;

    constructor(address _gatewayAddress) ERC1155("Bridge ERC1155") {
        gatewayAddress = _gatewayAddress;
    }

    function mintNFT(
        address _to,
        uint256[] memory _tokensId,
        uint256[] memory _amounts
    ) external {
        require(msg.sender == gatewayAddress, "You are not Gateway Contract");
        _mintBatch(_to, _tokensId, _amounts, "");
        // uint256 currentTotalSupply = totalSupply();
        // for (uint256 tokenIdx = 0; tokenIdx < _amount; ++tokenIdx) {
        //     _mint(_to, currentTotalSupply + tokenIdx);
        // }
    }
}
