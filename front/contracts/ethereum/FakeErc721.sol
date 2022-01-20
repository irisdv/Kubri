// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract FakeErc1155 is ERC1155 {
    constructor() ERC1155("Fake ERC1155") {}

    function mintBatch(
        address _to,
        uint256[] memory _tokensId,
        uint256[] memory _amounts
    ) external {
        _mintBatch(_to, _tokensId, _amounts, "");
        // uint256 currentTotalSupply = totalSupply();
        // for (uint256 tokenIdx = 0; tokenIdx < _amount; ++tokenIdx) {
        //     _mint(_to, currentTotalSupply + tokenIdx);
        // }
    }
}
