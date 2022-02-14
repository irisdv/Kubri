export const Gateway1155Abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_starknetCore",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "addr",
                "type": "address"
            }
        ],
        "name": "Deployed",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "contract ERC1155",
                "name": "_l1TokenContract",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_l2TokenContract",
                "type": "uint256"
            },
            {
                "internalType": "uint256[]",
                "name": "_tokensId",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_amounts",
                "type": "uint256[]"
            }
        ],
        "name": "bridgeFromStarknet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ERC1155",
                "name": "_l1TokenContract",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_l2TokenContract",
                "type": "uint256"
            },
            {
                "internalType": "uint256[]",
                "name": "_tokensId",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_amounts",
                "type": "uint256[]"
            }
        ],
        "name": "bridgeFromStarknetAvailable",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ERC1155",
                "name": "_l1TokenContract",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_l2TokenContract",
                "type": "uint256"
            },
            {
                "internalType": "uint256[]",
                "name": "_tokensId",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_amounts",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256",
                "name": "_account",
                "type": "uint256"
            }
        ],
        "name": "bridgeToStarknet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "bytecode",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "_salt",
                "type": "uint256"
            }
        ],
        "name": "deploy",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "endpointGateway",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "bytecode",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "_salt",
                "type": "uint256"
            }
        ],
        "name": "getAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getBytecode",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "initialEndpointGatewaySetter",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "_tokensId",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_amounts",
                "type": "uint256[]"
            }
        ],
        "name": "mintNFTFromStarknet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_endpointGateway",
                "type": "uint256"
            }
        ],
        "name": "setEndpointGateway",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "starknetCore",
        "outputs": [
            {
                "internalType": "contract IStarknetCore",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]