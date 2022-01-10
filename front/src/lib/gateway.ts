import React from "react";
import { Contract, Abi } from "starknet";
import { useStarknet } from "../providers/StarknetProvider";

import GATEWAY from "./abi/gateway1155_abi.json";

const GATEWAY_ADDRESS = "0x02874a331304c40ec096614ba4162c132218adb88f896aa2d3ab9228f996e432";

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
