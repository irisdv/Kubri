// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./IStarknetCore.sol";

contract Gateway1155 {
    address public initialEndpointGatewaySetter;
    uint256 public endpointGateway;
    IStarknetCore public starknetCore;
    uint256 constant ENDPOINT_GATEWAY_SELECTOR =
        1738423374452994793145864788013146788518531877200292826651981332061687045062;
    uint256 constant BRIDGE_MODE_DEPOSIT = 0;
    uint256 constant BRIDGE_MODE_WITHDRAW = 1;

    // Bootstrap
    constructor(address _starknetCore) {
        require(
            _starknetCore != address(0),
            "Gateway/invalid-starknet-core-address"
        );

        starknetCore = IStarknetCore(_starknetCore);
        initialEndpointGatewaySetter = msg.sender;
    }

    function setEndpointGateway(uint256 _endpointGateway) external {
        require(
            msg.sender == initialEndpointGatewaySetter,
            "Gateway/unauthorized"
        );
        require(endpointGateway == 0, "Gateway/endpoint-gateway-already-set");
        endpointGateway = _endpointGateway;
    }

    // Utils
    function addressToUint(address value)
        internal
        pure
        returns (uint256 convertedValue)
    {
        convertedValue = uint256(uint160(address(value)));
    }

    // Bridging to Starknet
    function bridgeToStarknet(
        IERC1155 _l1TokenContract,
        uint256 _l2TokenContract,
        uint256[] memory _tokensId,
        uint256[] memory _amounts,
        uint256 _account
    ) external {
        require(
            _tokensId.length == _amounts.length,
            "The Size of array tokenID and array amounts should be the same"
        );

        // optimistic transfer, should revert if no approved or not owner
        // _l1TokenContract.safeBatchTransferFrom(
        //     msg.sender,
        //     address(this),
        //     _tokensId,
        //     _amounts,
        //     []
        // );

        uint256 size = 4 + (_tokensId.length * 2);
        uint256 index = 0;
        uint256[] memory payload = new uint256[](size);

        // build withdraw message payload
        payload[0] = BRIDGE_MODE_WITHDRAW;
        payload[1] = addressToUint(msg.sender);
        payload[2] = addressToUint(address(_l1TokenContract));
        payload[3] = _l2TokenContract;

        for (uint256 i = 4; i < size; i++) {
            require(
                index < _tokensId.length,
                "You can not access to that element"
            );
            payload[i] = _tokensId[index];
            i++;
            payload[i] = _amounts[index];
            index++;
        }

        // send message
        starknetCore.sendMessageToL2(
            endpointGateway,
            ENDPOINT_GATEWAY_SELECTOR,
            payload
        );
    }

    function bridgeFromStarknetAvailable(
        IERC1155 _l1TokenContract,
        uint256 _l2TokenContract,
        uint256[] memory _tokensId,
        uint256[] memory _amounts
    ) external view returns (bool) {
        uint256 size = 4 + (_tokensId.length * 2);
        uint256 index = 0;
        uint256[] memory payload = new uint256[](size);
        // build withdraw message payload
        payload[0] = BRIDGE_MODE_WITHDRAW;
        payload[1] = addressToUint(msg.sender);
        payload[2] = addressToUint(address(_l1TokenContract));
        payload[3] = _l2TokenContract;

        for (uint256 i = 4; i < size; i++) {
            require(
                index < _tokensId.length,
                "You can not access to that element"
            );
            payload[i] = _tokensId[index];
            i++;
            payload[i] = _amounts[index];
            index++;
        }

        bytes32 msgHash = keccak256(
            abi.encodePacked(
                endpointGateway,
                addressToUint(address(this)),
                payload.length,
                payload
            )
        );

        return starknetCore.l2ToL1Messages(msgHash) > 0;
    }

    function debug_bridgeFromStarknetAvailable(
        IERC1155 _l1TokenContract,
        uint256 _l2TokenContract,
        uint256[] memory _tokensId,
        uint256[] memory _amounts
    ) external view returns (bytes32) {
        uint256 size = 4 + (_tokensId.length * 2);
        uint256 index = 0;
        uint256[] memory payload = new uint256[](size);
        // build withdraw message payload
        payload[0] = BRIDGE_MODE_WITHDRAW;
        payload[1] = addressToUint(msg.sender);
        payload[2] = addressToUint(address(_l1TokenContract));
        payload[3] = _l2TokenContract;

        for (uint256 i = 4; i < size; i++) {
            require(
                index < _tokensId.length,
                "You can not access to that element"
            );
            payload[i] = _tokensId[index];
            i++;
            payload[i] = _amounts[index];
            index++;
        }

        bytes32 msgHash = keccak256(
            abi.encodePacked(
                endpointGateway,
                addressToUint(address(this)),
                payload.length,
                payload
            )
        );

        return msgHash;
    }

    // Bridging back from Starknet
    function bridgeFromStarknet(
        IERC1155 _l1TokenContract,
        uint256 _l2TokenContract,
        uint256[] memory _tokensId,
        uint256[] memory _amounts
    ) external {
        require(
            _tokensId.length == _amounts.length,
            "The Size of array tokenID and array amounts should be the same"
        );

        uint256 size = 4 + (_tokensId.length * 2);
        uint256 index = 0;
        uint256[] memory payload = new uint256[](size);
        // build withdraw message payload
        payload[0] = BRIDGE_MODE_WITHDRAW;
        payload[1] = addressToUint(msg.sender);
        payload[2] = addressToUint(address(_l1TokenContract));
        payload[3] = _l2TokenContract;

        for (uint256 i = 4; i < size; i++) {
            require(
                index < _tokensId.length,
                "You can not access to that element"
            );
            payload[i] = _tokensId[index];
            i++;
            payload[i] = _amounts[index];
            index++;
        }

        // consum withdraw message
        starknetCore.consumeMessageFromL2(endpointGateway, payload);

        // optimistic transfer, should revert if gateway is not token owner
        // _l1TokenContract.safeBatchTransferFrom(
        //     address(this),
        //     msg.sender,
        //     _tokensId,
        //     _amounts
        // );
        // _l1TokenContract.satransferFrom(address(this), msg.sender, _tokenId);
    }

    // Bridging native token from Starknet
    // function withdrawAndMint(
    //     // IERC721 _l1TokenContract, --> car il sera extract du AssetType
    //     uint256 _l2TokenContract,
    //     uint256 assetType,
    //     bytes calldata mintingBlob
    // ) external {
    //     uint256[] memory payload = new uint256[](5);

    //     bytes memory assetInfo = getAssetInfo(assetType);

    //     // check que l'AssetType est bien le bon ?

    //     // extract _l1TokenContract address from AssetType
    //     // get _tokenId from mintingBlob

    //     // build withdraw message payload
    //     payload[0] = BRIDGE_MODE_WITHDRAW;
    //     payload[1] = addressToUint(msg.sender);
    //     payload[2] = addressToUint(address(_l1TokenContract));
    //     payload[3] = _l2TokenContract;
    //     payload[4] = _tokenId;

    //     // Since any L2 contract can send messages to any L1 contract it is recommended
    //     // that the L1 contract check the “from” address before processing the transaction.

    //     // consum withdraw message
    //     starknetCore.consumeMessageFromL2(endpointGateway, payload);

    //     // optimistic transfer, should revert if gateway is not token owner
    //     // _l1TokenContract.transferFrom(address(this), msg.sender, _tokenId);

    //     // Mint token avec :
    //     // amount (récupéré de getQuantitizedAmount),
    //     // owner = msg.sender
    //     // mintingBlob
    // }

    // function calculateMintableAssetId(
    //     uint256 assetType,
    //     bytes memory mintingBlob
    // ) internal pure returns (uint256 assetId) {
    //     uint256 blobHash = uint256(keccak256(mintingBlob));
    //     assetId =
    //         (uint256(
    //             keccak256(
    //                 abi.encodePacked(MINTABLE_PREFIX, assetType, blobHash)
    //             )
    //         ) & MASK_240) |
    //         MINTABLE_ASSET_ID_FLAG;
    // }

    // function getAssetInfo(uint256 assetType)
    //     public
    //     view
    //     returns (bytes memory assetInfo)
    // {
    //     // Verify that the registration is set and valid.
    //     require(registeredAssetType[assetType], "ASSET_TYPE_NOT_REGISTERED");

    //     // Retrieve registration.
    //     assetInfo = assetTypeToAssetInfo[assetType];
    // }

    // function isEther(uint256 assetType) internal view returns (bool) {
    //     return extractTokenSelector(getAssetInfo(assetType)) == ETH_SELECTOR;
    // }

    // function isMintableAssetType(uint256 assetType)
    //     internal
    //     view
    //     returns (bool)
    // {
    //     bytes4 tokenSelector = extractTokenSelector(getAssetInfo(assetType));
    //     return
    //         tokenSelector == MINTABLE_ERC20_SELECTOR ||
    //         tokenSelector == MINTABLE_ERC721_SELECTOR;
    // }

    // function extractTokenSelector(bytes memory assetInfo)
    //     internal
    //     pure
    //     returns (bytes4 selector)
    // {
    //     // solium-disable-next-line security/no-inline-assembly
    //     assembly {
    //         selector := and(
    //             0xffffffff00000000000000000000000000000000000000000000000000000000,
    //             mload(add(assetInfo, SELECTOR_OFFSET))
    //         )
    //     }
    // }
}

/*
https://github.com/starkware-libs/starkex-resources/blob/44a15c7d1bdafda15766ea0fc2e0866e970e39c1/crypto/starkware/crypto/signature/asset.js#L171

AssetType == 
        - quantum (coeff de multiplication de L2 vers L1) -->  uint256 constant MAX_QUANTUM = 2**128 - 1;
        - AssetInfo == bytes4(keccak256("MintableERC721Token(address,uint256)"));`
            De AssetInfo je peux avoir le TokenSelector "MINTABLE_ERC721_SELECTOR"

| ``uint256 assetType = uint256(keccak256(abi.encodePacked(assetInfo, quantum))) &``
| ``0x03FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;``


TokenSelector = bytes4(keccak256("MintableERC721Token(address,uint256)"))
| `ETH_SELECTOR = bytes4(keccak256("ETH()"));`
   | `ERC20_SELECTOR = bytes4(keccak256("ERC20Token(address)"));`
   | `ERC721_SELECTOR = bytes4(keccak256("ERC721Token(address,uint256)"));`
   | `MINTABLE_ERC20_SELECTOR = bytes4(keccak256("MintableERC20Token(address)"));`
   | `MINTABLE_ERC721_SELECTOR = bytes4(keccak256("MintableERC721Token(address,uint256)"));`


TokenSelector == bytes4(keccak256('MintableERC721Token(address,uint256)')) --> 0xb8b86672
AssetInfo(address) == TokenSelector + bytes.fromhex(address[2:]).rjust(32, b'\0') --> où address est le contract address du token ERC721?
AssetType = keccak256(asset_info, 1)

AssetId(token_id, address) = keccak256('NFT:', assetType, token_id)

AssetId(minting_blob, address) = keccak256('MINTABLE:', assetType, blob_hash)

Mais à quoi ressemble le minting_blob
*/
