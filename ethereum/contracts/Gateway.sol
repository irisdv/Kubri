// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import "./IStarknetCore.sol";

// import "hardhat/console.sol";

// contract Gateway {
//     address public initialEndpointGatewaySetter;
//     uint256 public endpointGateway;
//     IStarknetCore public starknetCore;
//     uint256 constant ENDPOINT_GATEWAY_SELECTOR =
//         1286001399277922380574585728897457191013227870708776353075450682753252956216;
//     uint256 constant BRIDGE_MODE_DEPOSIT = 0;
//     uint256 constant BRIDGE_MODE_WITHDRAW = 1;

//     string internal constant MINTABLE_PREFIX = "MINTABLE:";
//     uint256 internal constant MINTABLE_ASSET_ID_FLAG = 1<<250;
//     uint256 internal constant MASK_240 =
//     0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

//     // Bootstrap
//     constructor(address _starknetCore) {
//         require(
//             _starknetCore != address(0),
//             "Gateway/invalid-starknet-core-address"
//         );

//         starknetCore = IStarknetCore(_starknetCore);
//         initialEndpointGatewaySetter = msg.sender;
//     }

//     function setEndpointGateway(uint256 _endpointGateway) external {
//         require(
//             msg.sender == initialEndpointGatewaySetter,
//             "Gateway/unauthorized"
//         );
//         require(endpointGateway == 0, "Gateway/endpoint-gateway-already-set");
//         endpointGateway = _endpointGateway;

//         console.log('End point gateway setted to %s', _endpointGateway);
//     }

//     // Utils
//     function addressToUint(address value)
//         internal
//         pure
//         returns (uint256 convertedValue)
//     {
//         convertedValue = uint256(uint160(address(value)));
//     }

//     // Bridging to Starknet
//     function bridgeToStarknet(
//         IERC721 _l1TokenContract,
//         uint256 _l2TokenContract,
//         uint256 _tokenId,
//         uint256 _account
//     ) external {
//         uint256[] memory payload = new uint256[](4);

//         console.log('address of msg Sender is %s', msg.sender);
//         console.log('address of address(this) is %s', address(this));
//         // optimistic transfer, should revert if no approved or not owner
//         _l1TokenContract.transferFrom(msg.sender, address(this), _tokenId);

//         // build deposit message payload
//         payload[0] = _account;
//         payload[1] = addressToUint(address(_l1TokenContract));
//         payload[2] = _l2TokenContract;
//         payload[3] = _tokenId;

//         console.log('endpointGateway is %s', endpointGateway);

//         // send message
//         starknetCore.sendMessageToL2(
//             endpointGateway,
//             ENDPOINT_GATEWAY_SELECTOR,
//             payload
//         );
//     }

//     // Bridging back from Starknet
//     function bridgeFromStarknet(
//         IERC721 _l1TokenContract,
//         uint256 _l2TokenContract,
//         uint256 _tokenId
//     ) external {
//         uint256[] memory payload = new uint256[](5);

//         // build withdraw message payload
//         payload[0] = BRIDGE_MODE_WITHDRAW;
//         payload[1] = addressToUint(msg.sender);
//         payload[2] = addressToUint(address(_l1TokenContract));
//         payload[3] = _l2TokenContract;
//         payload[4] = _tokenId;

//         // consum withdraw message
//         starknetCore.consumeMessageFromL2(endpointGateway, payload);

//         // optimistic transfer, should revert if gateway is not token owner
//         _l1TokenContract.transferFrom(address(this), msg.sender, _tokenId);
//     }

//     // Bridging native token from Starknet
//     function withdrawAndMint(
//         // IERC721 _l1TokenContract, --> car il sera extract du AssetType
//         uint256 _l2TokenContract,
//         uint256 assetType,
//         bytes calldata mintingBlob
//     ) external {
//         uint256[] memory payload = new uint256[](5);

//         uint256 assetId = calculateMintableAssetId(assetType, mintingBlob);
//         console.log('assetId is %s', assetId);

//         // check que l'AssetType est bien le bon ?

//         // extract _l1TokenContract address from AssetType
//         // get _tokenId from mintingBlob

//         // build withdraw message payload
//         payload[0] = BRIDGE_MODE_WITHDRAW;
//         payload[1] = addressToUint(msg.sender);
//         payload[2] = addressToUint(address(_l1TokenContract));
//         payload[3] = _l2TokenContract;
//         payload[4] = _tokenId;

//         // Since any L2 contract can send messages to any L1 contract it is recommended
//         // that the L1 contract check the “from” address before processing the transaction.

//         // consum withdraw message
//         starknetCore.consumeMessageFromL2(endpointGateway, payload);

//         // optimistic transfer, should revert if gateway is not token owner
//         _l1TokenContract.transferFrom(address(this), msg.sender, _tokenId);

//         // Mint token avec :
//                 // amount (récupéré de getQuantitizedAmount),
//                 // owner = msg.sender
//                 // mintingBlob
//     }

//     function calculateMintableAssetId(uint256 assetType, bytes memory mintingBlob)
//         internal
//         pure
//         returns(uint256 assetId) {
//         uint256 blobHash = uint256(keccak256(mintingBlob));
//         assetId = (uint256(keccak256(abi.encodePacked(MINTABLE_PREFIX ,assetType, blobHash)))
//             & MASK_240) | MINTABLE_ASSET_ID_FLAG;
//     }

//     // function isMintableAssetType(uint256 assetType) internal view returns (bool) {
//     //     bytes4 tokenSelector = extractTokenSelector(getAssetInfo(assetType));
//     //     return
//     //         tokenSelector == MINTABLE_ERC20_SELECTOR ||
//     //         tokenSelector == MINTABLE_ERC721_SELECTOR;
//     // }

//     // function extractTokenSelector(bytes memory assetInfo) internal pure
//     //     returns (bytes4 selector) {
//     //     // solium-disable-next-line security/no-inline-assembly
//     //     assembly {
//     //         selector := and(
//     //             0xffffffff00000000000000000000000000000000000000000000000000000000,
//     //             mload(add(assetInfo, SELECTOR_OFFSET))
//     //         )
//     //     }
//     // }
// }
