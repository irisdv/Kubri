import React from "react";
// import { Contract } from "starknet";
// import { useStarknetInvoke } from "../../lib/hooks";
// import { useStarknet } from "../../providers/StarknetProvider";
// import { useTransaction } from "../../providers/TransactionsProvider";

// import { Button, Row } from 'antd';

// export function BridgeToL1({ contract, tokenId }: { contract?: Contract, tokenId?: any }) {
//   const { account } = useStarknet();

//   const l1TokenAddress = process.env.REACT_APP_L1_ERC721
//   const l2TokenAddress = process.env.REACT_APP_L2_ERC721
//   const l1Owner = process.env.REACT_APP_L1_OWNER

//   const {
//     invoke: bridge_to_mainnet,
//     hash,
//     submitting
//   } = useStarknetInvoke(contract, "bridge_to_mainnet");
//   const transactionStatus = useTransaction(hash);

//   if (!account) return null;
//   if (!tokenId) return null;

//   return (
//     <Row style={{padding : '10px', justifyContent: 'center'}}>
//         <Button 
//           type="primary" 
//           onClick={() => bridge_to_mainnet && bridge_to_mainnet({l1TokenAddress, l2TokenAddress, tokenId, l1Owner})}
//           style={{backgroundColor: '#002766', borderColor: '#002766' }}
//         >Bridge NFT to L1</Button>
//     </Row>
//   );
// }
