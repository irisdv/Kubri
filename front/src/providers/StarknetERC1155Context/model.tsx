import { BigNumber } from 'ethers';

export interface StarknetERC1155State {
	address: string;
	l1_address: string;
	valid: boolean;
	tokenURI: string;
	ownedTokens: string[];
	ownedNFT: {}[]
	nextTokenID: string;
	approvalTx: string;
	approvedGateway: boolean;
	bridgingTx: string;
	// total_supply: BigNumber;
	mint1155NFT: (t: [], u: [], v: string) => void;
	bridgeToL1: (t: [], u: []) => void;
	approveUser: () => void;
}

// export const StarknetERC1155Context = React.createContext<StarknetERC1155ContextInterface>({
export const STARKNET_ERC1155_INITIAL_STATE: StarknetERC1155State = {
	address: '',
	l1_address: '',
	valid: false,
	tokenURI: '',
	ownedTokens: [],
	ownedNFT: [{}],
	nextTokenID: '0',
	approvalTx : '',
	approvedGateway: false,
	bridgingTx: '',
	// total_supply: BigNumber.from(0),
	mint1155NFT: () => { },
	bridgeToL1: () => { },
	approveUser: () => {}
}
// )