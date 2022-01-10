import React from "react";
import { Contract, Abi } from "starknet";
import { useStarknet } from "../providers/StarknetProvider";

import BRIDGED1155 from "./abi/bridged1155_abi.json";

const ERC1155_ADDRESS = "0x027e5fa1a9bb9b79494b1ad54f8cbb83418923e004483e54e0735573f9542020";
//   "0x0184b283baedf52cc72d46621d92b465087a208fa4ebff2178f5c8b2fb7765f4";

/**
 * Load the counter contract.
 *
 * This example uses a hook because the contract address could depend on the
 * chain or come from an external api.
 * @returns The `counter` contract or undefined.
 */
export function useBridged1155Contract(): Contract | undefined {
    const { library } = useStarknet();
    const [contract, setContract] = React.useState<Contract | undefined>(
        undefined
    );

    React.useEffect(() => {
        setContract(new Contract(BRIDGED1155 as Abi[], ERC1155_ADDRESS, library));
    }, [library]);

    return contract;
}