import React from "react";
import { getStarknet } from "@argent/get-starknet";
import StarknetGatewayAddress from '../../lib/abi/gateway1155.summary.json';
import { StarknetState } from "./model";
import { defaultProvider, ProviderInterface } from "starknet";

interface StarknetManagerState {
  starknet: any;
  account?: string;
  library: ProviderInterface;
  active: boolean;
  gateway?: string;
}

interface SetAccount {
  type: "set_account";
  account: string;
}

interface SetProvider {
  type: "set_provider";
  provider: ProviderInterface;
}

interface SetActive {
  type: "set_active";
  active: boolean;
}

interface SetStarknet {
  type: "set_starknet";
  starknet: any;
}

interface SetGateway {
  type: "set_gateway";
  gateway: any;
}

type Action = SetAccount | SetProvider | SetActive | SetStarknet | SetGateway;

function reducer(
  state: StarknetManagerState,
  action: Action
): StarknetManagerState {
  switch (action.type) {
    case "set_account": {
      return { ...state, account: action.account };
    }
    case "set_provider": {
      return { ...state, library: action.provider };
    }
    case "set_active": {
      return { ...state, active: action.active };
    }
    case "set_starknet": {
      return { ...state, starknet: action.starknet };
    }
    case "set_gateway": {
      return { ...state, gateway: action.gateway };
    }
    default: {
      return state;
    }
  }
}

function useLocalStorage(key: string, initialValue: any): [any, (v: any) => void] {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      // Get from local storage by key
			const item = window.localStorage.getItem(key);
			// Parse stored json or if none return initialValue
			return item ? JSON.parse(item) : initialValue;

    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value : any) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue];
}

const unOddHex = (v: string) => v.length % 2 === 1 ? `0x0${v.slice(2)}` : v;

export function useStarknetManager(): StarknetState {

  const [enabled, setEnabled] = useLocalStorage('argent-x-enabled', false);
  const [boot, setBoot] = React.useState(false);

  const [state, dispatch] = React.useReducer(reducer, {
    account: '',
    library: defaultProvider,
    active: false,
    gateway: '',
    starknet: null
  });

  const { account, library, active, gateway } = state;
  const starknet = getStarknet({ showModal: false });

  const enable = React.useCallback(async () => {

    if (starknet) {
      dispatch({ type: "set_starknet", starknet: starknet });
    }

    const [account] = await starknet.enable();

    dispatch({ type: "set_account", account });
    if (starknet.signer) {
      dispatch({ type: "set_provider", provider: starknet.signer });
    }
    dispatch({ type: "set_active", active: true });
    dispatch({ type: "set_gateway", gateway: unOddHex(StarknetGatewayAddress.address) });

  }, [setEnabled]);

  React.useEffect(() => {
    if (!boot && enabled) {
      console.log('pas boot & enabled');
      setBoot(true);
      setTimeout(() => {
        enable();
      }, 250)
    }
  }, [enabled, boot, enable])

  const disable = React.useCallback(() => {
    dispatch({ type: "set_starknet", starknet: null });
    dispatch({ type: "set_account", account: '' });
    if (starknet.signer) {
      dispatch({ type: "set_provider", provider: starknet.signer });
    }
    dispatch({ type: "set_active", active: false })
    dispatch({ type: "set_gateway", gateway: ''});
    setEnabled(false)
  }, [setEnabled])

  return { starknet, account, library, active, gateway, enable, disable };
}
