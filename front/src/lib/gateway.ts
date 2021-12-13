import React from "react";
import { Contract, Abi } from "starknet";
import { useStarknet } from "../providers/StarknetProvider";

import GATEWAY from "./abi/gateway.json";

const GATEWAY_ADDRESS =
  "0x06fee411e29ff2ac941a40aa6b627b5e28ef12fd7df8d0b069db6a67fbe89583";

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
