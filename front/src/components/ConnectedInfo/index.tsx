import React from "react";
import { useStarknet } from "../../providers/StarknetProvider";

export function ConnectedInfo() {
    const { account, enable } = useStarknet();
    const truncated = (account as string).substring(0, 8);

    return (
        <div className="">
            <button className="btn btn-accent">
                {truncated}
                <div className="badge ml-2 badge-outline">Starknet Testnet</div>
            </button> 
        </div>
    );
}