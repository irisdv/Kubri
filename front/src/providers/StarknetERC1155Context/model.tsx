import { BigNumber } from 'ethers';

export interface StarknetERC1155State {
	address: string;
	l1_address: string;
	valid: boolean;
	tokenURI: string;
	ownedTokens: string[];
	nextTokenID: BigNumber;
	// total_supply: BigNumber;
	bridgeToL1: (t: [], u: []) => void;
	mint1155NFT: (a: string, t: [], u: [], v: string) => void;
}

// export const StarknetERC1155Context = React.createContext<StarknetERC1155ContextInterface>({
export const STARKNET_ERC1155_INITIAL_STATE: StarknetERC1155State = {
	address: '',
	l1_address: '',
	valid: false,
	tokenURI: '',
	ownedTokens: [],
	nextTokenID: BigNumber.from(0),
	// total_supply: BigNumber.from(0),
	bridgeToL1: () => { },
	mint1155NFT: () => { }
}
// )