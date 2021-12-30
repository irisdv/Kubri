import React from "react";
import { useStarknet } from "../../providers/StarknetProvider";

interface ConnectedOnlyProps {
  children: React.ReactNode;
}

export function ConnectedOnly({ children }: ConnectedOnlyProps): JSX.Element {
  const { account, connectBrowserWallet } = useStarknet();

  console.log('account component', account);
  console.log('children', children);

  if (!account) {
    return (
        <div style={{padding : '10px', justifyContent: 'center'}}>
          <button 
            className="btn btn-primary" 
            onClick={() => connectBrowserWallet()}
          >Connect ArgentX Wallet</button>
        </div>
    );
  }
  return <React.Fragment>{children}</React.Fragment>;
}
