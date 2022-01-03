import React from "react";
import { Contract, Abi } from "starknet";
import { useStarknet } from "../providers/StarknetProvider";

import GATEWAY from "./abi/gateway1155_abi.json";

const GATEWAY_ADDRESS = "0x01eea0af8befbb6694dac356086fe451c136345dacf0d8e1da315abdb913ede8";

/**
 * Load the counter contract.
 *
 * This example uses a hook because the contract address could depend on the
 * chain or come from an external api.
 * @returns The `counter` contract or undefined.
 */
export function useGatewayContract(): Contract | undefined {
  const { library } = useStarknet();
  const [contract, setContract] = React.useState<Contract | undefined>(
    undefined
  );

  React.useEffect(() => {
    setContract(new Contract(GATEWAY as Abi[], GATEWAY_ADDRESS, library));
  }, [library]);

  return contract;
}
