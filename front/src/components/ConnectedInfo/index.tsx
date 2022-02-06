import React from "react";
import { useStarknet } from "../../providers/StarknetProvider";

export function ConnectedInfo() {
    const { account } = useStarknet();
    const start = (account as string).substring(0, 6);
    const end = (account as string).substring(61, 65);

    return (
        <div className="">
            <button className="btn btn-secondary text-xs lowercase mx-1">
                {start}...{end}
                <br/>Starknet testnet
            </button> 
        </div>
    );
}