// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BridgeErc1155 is ERC1155 {
    address public gatewayAddress;

    constructor(address _gatewayAddress)
        ERC1155(
            "https://ipfs.io/ipfs/QmYqYBbou6fcqiUJTksevTewi7sysJzEs9BzcVkzmFi2sm/{id}.json"
        )
    {
        gatewayAddress = _gatewayAddress;
    }

    function mintNFT(
        address _to,
        uint256[] memory _tokensId,
        uint256[] memory _amounts
    ) external {
        require(msg.sender == gatewayAddress, "You are not Gateway Contract");
        _mintBatch(_to, _tokensId, _amounts, "");
    }

    function burnNFT(
        address _to,
        uint256[] memory _tokensId,
        uint256[] memory _amounts
    ) external {
        require(msg.sender == gatewayAddress, "You are not Gateway Contract");
        _burnBatch(_to, _tokensId, _amounts);
    }

    function uri(uint256 _id) public pure override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "ipfs://QmYqYBbou6fcqiUJTksevTewi7sysJzEs9BzcVkzmFi2sm/",
                    Strings.toString(_id),
                    ".json"
                )
            );
    }
}
