import { BigNumber } from 'ethers';
import { TransactionStatus } from '@usedapp/core';

export interface EthereumERC1155State {
    metamaskAccount: string;
    l1_address: string;
    l1_token_address: string;
    l2_address: string;
    l2_token_address: string;
    txHash: string;
    bridgeFromL2: (t: [], u: []) => void;
    bridgeState: TransactionStatus;
    mintFromL2: (t: [], u: []) => void;
    mintState: TransactionStatus;
}

// export const EthereumERC1155Context = React.createContext<EthereumERC1155ContextInterface>({
export const ETHEREUM_ERC1155_INITIAL_STATE: EthereumERC1155State = {
    metamaskAccount: '',
    l1_address: '',
    l1_token_address: '',
    l2_address: '',
    l2_token_address: '',
    txHash: '',
    bridgeFromL2: () => { },
    // @ts-ignore
    bridgeState: null,
    mintFromL2: () => { },
    // @ts-ignore
    mintState: null
}