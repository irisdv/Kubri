export interface StarknetERC1155State {
	address: string;
	valid: boolean;
	balanceOf1: string;
	balanceOf2: string;
	approvalTx: string;
	approvedGateway: boolean;
	bridgingTx: string;
	bridgeToL1: (t: [], u: [], v: string) => void;
	approveUser: (t: string) => void;
}

export const STARKNET_ERC1155_INITIAL_STATE: StarknetERC1155State = {
	address: '',
	valid: false,
	balanceOf1: '',
	balanceOf2: '',
	approvalTx : '',
	approvedGateway: false,
	bridgingTx: '',
	bridgeToL1: () => { },
	approveUser: () => {}
}