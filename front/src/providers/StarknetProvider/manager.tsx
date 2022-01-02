import React from "react";
import { getStarknet } from "@argent/get-starknet";
import { StarknetState } from "./model";
import { defaultProvider, ProviderInterface } from "starknet";

interface StarknetManagerState {
  account?: string;
  library: ProviderInterface;
}

interface SetAccount {
  type: "set_account";
  account: string;
}

interface SetProvider {
  type: "set_provider";
  provider: ProviderInterface;
}

type Action = SetAccount | SetProvider;

function reducer(
  state: StarknetManagerState,
  action: Action
): StarknetManagerState {
  console.log('Action', action);
  console.log('action type', action.type)
  switch (action.type) {
    case "set_account": {
      return { ...state, account: action.account };
    }
    case "set_provider": {
      return { ...state, library: action.provider };
    }
    default: {
      return state;
    }
  }
}

export function useStarknetManager(): StarknetState {
  const starknet = getStarknet({ showModal: false });
  console.log('starknet', starknet);
  console.log('reducer', reducer);
  const [state, dispatch] = React.useReducer(reducer, {
    library: defaultProvider,
  });

  const { account, library } = state;

  console.log('library', library);
  console.log('state', state);

  const connectBrowserWallet = React.useCallback(async () => {
    console.log('starknet ds connectBrowserWallet', starknet);
    const [account] = await starknet.enable();
    console.log('account', account);
    dispatch({ type: "set_account", account });
    if (starknet.signer) {
      dispatch({ type: "set_provider", provider: starknet.signer });
    }
  }, [starknet]);

  return { account, connectBrowserWallet, library };
}
