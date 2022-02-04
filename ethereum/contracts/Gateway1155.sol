// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BridgeErc1155.sol";
import "./FakeErc1155.sol";
import "./IStarknetCore.sol";
import "./Factory.sol";

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

    // struct NFTIdAmounts {
    //     uint256[] _tokensId;
    //     uint256[] _amounts;
    // }
    mapping(address => bool) private _isDeployed;
    // mapping(address => address) private _listeBridgeContract;
    // mapping(address => uint256[]) private _listeIDByOwner;
    mapping(address => mapping(uint256 => uint256))
        private _listeTokensIDAmount;

    // mapping(address => mapping(uint256 => bool)) private _idExist;

    event Deployed(address addr, uint256 salt);

    modifier checkIdAndAmount(
        uint256[] memory _tokensId,
        uint256[] memory _amounts
    ) {
        require(
            _tokensId.length == _amounts.length,
            "The Size of array tokenID and array amounts should be the same"
        );
        for (uint256 i = 0; i < _tokensId.length; i++) {
            uint256 id = _tokensId[i];
            uint256 amounts = _amounts[i];
            require(
                _listeTokensIDAmount[msg.sender][id] > 0,
                "You can not mint if you don't have amount for a given tokenID"
            );
            require(
                _listeTokensIDAmount[msg.sender][id] >= amounts,
                "token Id does not exist or wrong amount"
            );
            i++;
        }
        _;
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
        ERC1155 _l1TokenContract,
        uint256 _l2TokenContract,
        uint256[] memory _tokensId,
        uint256[] memory _amounts,
        uint256 _account
    ) external {
        require(
            _tokensId.length == _amounts.length,
            "The Size of array tokenID and array amounts should be the same"
        );

        uint256 size = 5 + (_tokensId.length * 2);
        uint256 index = 0;
        uint256 i = 4;
        uint256[] memory payload = new uint256[](size);

        payload[0] = _account;
        payload[1] = addressToUint(address(_l1TokenContract));
        payload[2] = _l2TokenContract;
        payload[3] = _tokensId.length;
        while (index < _tokensId.length) {
            payload[i] = _tokensId[index];
            index++;
            i++;
        }
        index = 0;
        payload[i] = _amounts.length;
        while (index < _amounts.length) {
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
        ERC1155 _l1TokenContract,
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

    // function debug_bridgeFromStarknetAvailable(
    //     ERC1155 _l1TokenContract,
    //     uint256 _l2TokenContract,
    //     uint256[] memory _tokensId,
    //     uint256[] memory _amounts
    // ) external view returns (bytes32) {
    //     uint256 size = 4 + (_tokensId.length * 2);
    //     uint256 index = 0;
    //     uint256[] memory payload = new uint256[](size);
    //     // build withdraw message payload
    //     payload[0] = BRIDGE_MODE_WITHDRAW;
    //     payload[1] = addressToUint(msg.sender);
    //     payload[2] = addressToUint(address(_l1TokenContract));
    //     payload[3] = _l2TokenContract;

    //     for (uint256 i = 4; i < size; i++) {
    //         require(
    //             index < _tokensId.length,
    //             "You can not access to that element"
    //         );
    //         payload[i] = _tokensId[index];
    //         i++;
    //         payload[i] = _amounts[index];
    //         index++;
    //     }

    //     bytes32 msgHash = keccak256(
    //         abi.encodePacked(
    //             endpointGateway,
    //             addressToUint(address(this)),
    //             payload.length,
    //             payload
    //         )
    //     );

    //     return msgHash;
    // }

    // Bridging back from Starknet
    function bridgeFromStarknet(
        FakeErc1155 _l1TokenContract,
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

        // bytes memory bytecode = this.getBytecode();
        // address newContractAdd = this.getAddress(bytecode, 0x123456788);
        // if (_listeBridgeContract[msg.sender] != newContractAdd) {
        //     address deployBridgeAdd = deploy(bytecode, 0x123456788);
        //     require(
        //         deployBridgeAdd == newContractAdd,
        //         "Address deployed is not the same than the predicted one"
        //     );
        //     _listeBridgeContract[msg.sender] = newContractAdd;
        // }
        for (uint256 i = 0; i < _tokensId.length; i++) {
            _listeTokensIDAmount[msg.sender][_tokensId[i]] += _amounts[i];
            // if (!_idExist[msg.sender][_tokensId[i]]) {
            //     _listeIDByOwner[msg.sender].push(_tokensId[i]);
            // }
            i++;
        }
    }

    function mintNFTFromStarknet(
        uint256[] memory _tokensId,
        uint256[] memory _amounts
    ) external checkIdAndAmount(_tokensId, _amounts) {
        bytes memory bytecode = this.getBytecode();
        address newContractAdd = this.getAddress(bytecode, 0x123456788);
        if (!_isDeployed(newContractAdd)) {
            BridgeErc1155 bridge = new BridgeErc1155{salt: 0x123456788}(
                address(this)
            );
            require(
                address(bridge) == newContractAdd,
                "Precompute address and deployed address are not the same"
            );
            _isDeployed[address(bridge)] = true;
        } else {
            BridgeErc1155 bridge = BridgeErc1155(newContractAdd);
        }
        // require(
        //     _listeBridgeContract[msg.sender] != address(0),
        //     "Bridge contract address can not be zero"
        // );
        // address bridgeAddress = _listeBridgeContract[msg.sender];
        // BridgeErc1155 bridge = BridgeErc1155(bridgeAddress);
        bridge.mintNFT(msg.sender, _tokensId, _amounts);
        for (uint256 i = 0; i < _tokensId.length; i++) {
            _listeTokensIDAmount[msg.sender][_tokensId[i]] -= _amounts[i];
            // _listeIDByOwner[msg.sender].pop(_tokensId[i]);
            i++;
        }
    }

    // function getIdByOwner() external view returns (uint256[] memory) {
    //     return _listeIDByOwner[msg.sender];
    // }

    // 1. Get bytecode of contract to be deployed
    function getBytecode() external view returns (bytes memory) {
        bytes memory bytecode = type(BridgeErc1155).creationCode;

        return abi.encodePacked(bytecode, abi.encode(address(this)));
    }

    // 2. Compute the address of the contract to be deployed
    function getAddress(bytes memory bytecode, uint256 _salt)
        external
        view
        returns (address)
    {
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                _salt,
                keccak256(bytecode)
            )
        );

        return address(uint160(uint256(hash)));
    }

    // 3. Deploy the contract
    function deploy(bytes memory bytecode, uint256 _salt)
        public
        payable
        returns (address)
    {
        address addr;

        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), _salt)

            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }

        emit Deployed(addr, _salt);
        return addr;
    }
}
