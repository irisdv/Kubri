import React from "react";
import { useStarknet } from "../../providers/StarknetProvider";

interface ConnectedOnlyProps {
  children: React.ReactNode;
}

export function ConnectedOnly({ children }: ConnectedOnlyProps): JSX.Element {
  const { account, enable } = useStarknet();

  // console.log('account component in ConnectedOnly', account);

  if (!account) {
    return (
        <div style={{padding : '10px', justifyContent: 'center'}}>
          <button 
            className="btn btn-accent" 
            onClick={() => enable()}
          >Connect ArgentX Wallet</button>
        </div>
    );
  }
  return <React.Fragment>{children}</React.Fragment>;
}
