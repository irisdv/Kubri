import { defaultProvider, ProviderInterface } from "starknet";

export interface StarknetState {
  starknet?: any;
  account?: string;
  library: ProviderInterface;
  active: boolean;
  gateway?: string;
  enable: () => void;
	disable: () => void;
}

export const STARKNET_STATE_INITIAL_STATE: StarknetState = {
  starknet: null,
  account: '',
  library: defaultProvider,
  active: false,
	gateway: '',
	enable: () => { },
	disable: () => { }
};
