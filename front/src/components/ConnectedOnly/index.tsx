import React from "react";
import { useStarknet } from "../../providers/StarknetProvider";

import { Button, Row } from 'antd';

interface ConnectedOnlyProps {
  children: React.ReactNode;
}

export function ConnectedOnly({ children }: ConnectedOnlyProps): JSX.Element {
  const { account, connectBrowserWallet } = useStarknet();

  if (!account) {
    return (
        <Row style={{padding : '10px', justifyContent: 'center'}}>
          <Button 
            type="primary" 
            style={{backgroundColor: '#002766', borderColor: '#002766' }} 
            onClick={() => connectBrowserWallet()}
          >Connect ArgentX Wallet</Button>
        </Row>
    );
  }
  return <React.Fragment>{children}</React.Fragment>;
}
