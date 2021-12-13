import React, { useEffect, useState } from "react";
const encUtils = require('enc-utils');
const sha3 = require('js-sha3');
const BN = require('bn.js');
const assert = require('assert');


export function MintingBlob() {

  const assetDict = {
    type: 'MINTABLE_ERC721',
    data: { quantum: '1', tokenAddress: '0xb5AAc9C30121496b89425f92D1b45336E4704F8e',
    blob: "1:0xb5AAc9C30121496b89425f92D1b45336E4704F8e"
    },
  }
  const [finalAssetId, setFinalAssetId] = useState('')
  const [assetType, setAssetType] = useState('')
  // Generate BN of 1
  const oneBn = new BN('1', 16);
  // Used to mask the 251 least signifcant bits given by Keccack256 to produce the final asset ID.
  const mask = new BN('3ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16);

  // Used to mask the 240 least signifcant bits given by Keccack256 to produce the final asset ID
  // (for mintable assets).
  const mask240 = new BN('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16);
  const maskMintabilityBit =
    new BN('400000000000000000000000000000000000000000000000000000000000000', 16);

  function getAssetType(assetDict : any) {

    const assetSelector = encUtils.sanitizeHex(sha3.keccak_256('MintableERC721Token(address,uint256)').slice(0, 8));
    console.log('MINTABLE_ERC721_SELECTOR', assetSelector);

    let expectedLen = encUtils.removeHexPrefix(assetSelector).length;
    // console.log('expectedLen', expectedLen);

    let assetInfo = new BN(encUtils.removeHexPrefix(assetSelector), 16);
    // console.log('assetInfo', assetInfo);

    // if tokenAddress is defined 
    const tokenAddress = new BN(encUtils.removeHexPrefix(assetDict.data.tokenAddress), 16);
    // console.log('tokenAddress', tokenAddress);

    assetInfo = assetInfo.ushln(256).add(tokenAddress);
    // console.log('assetInfo after tokenAddress', assetInfo);

    expectedLen += 64;
    // console.log('expectedLen', expectedLen);

    const quantInfo = assetDict.data.quantum;
    const quantum = (quantInfo === undefined) ? oneBn : new BN(quantInfo, 10);
    console.log('quantum', quantum);

    assetInfo = assetInfo.ushln(256).add(quantum);
    expectedLen += 64;
    // console.log('assetInfo after quantum', assetInfo);

    let assetType = sha3.keccak_256(
      encUtils.hexToBuffer(addLeadingZeroes(assetInfo.toJSON(), expectedLen))
    );
    console.log('assetType', assetType);

    assetType = new BN(assetType, 16);
    // console.log('assetType après BN 16', assetType);
    assetType = assetType.and(mask);
    // console.log('assetType après mask', assetType);

    return '0x' + assetType.toJSON();
  }

  function addLeadingZeroes(hexStr : any, expectedLen : any) {
    let res = hexStr;
    assert(res.length <= expectedLen);
    while (res.length < expectedLen) {
        res = '0' + res;
    }
    return res;
  }

  function blobToBlobHash(blob : any) {
    return '0x' + sha3.keccak_256(blob);
  }

  function getAssetId(assetDict : any) {
    const assetType = new BN(encUtils.removeHexPrefix(getAssetType(assetDict)), 16);
    // console.log('assetType', assetType);
    setAssetType(getAssetType(assetDict));

    // For ETH and ERC20, the asset ID is simply the asset type.
    let assetId = assetType;

    let assetInfo = new BN(encUtils.utf8ToBuffer('MINTABLE:'), 16);

    const expectedLen = 18 + 64 + 64;
    assetInfo = assetInfo.ushln(256).add(assetType);
    const blobHash = blobToBlobHash(assetDict.data.blob);

    console.log('blobHash', blobHash);

    assetInfo = assetInfo.ushln(256).add(new BN(encUtils.removeHexPrefix(blobHash), 16));
    assetId = sha3.keccak_256(
      encUtils.hexToBuffer(addLeadingZeroes(assetInfo.toJSON(), expectedLen))
    );
    assetId = new BN(assetId, 16);
    assetId = assetId.and(mask240);
    assetId = assetId.or(maskMintabilityBit);

    return '0x' + assetId.toJSON();
  }

  useEffect(() => {
    
    const test = getAssetId(assetDict);
    setFinalAssetId(test);

  }, [])

  // const assetType = 

  // let assetInfo = new BN(encUtils.utf8ToBuffer('MINTABLE:'), 16);
  // console.log('asset_info 1', assetInfo);
  // const expectedLen = 18 + 64 + 64;
  // assetInfo = assetInfo.ushln(256).add(assetType);


  return (
    <div>
      <p>Asset Id == {finalAssetId}</p>
      <p>Minting blob = {assetDict.data.blob}</p>
      <p>Assettype = {assetType}</p>
    </div>
  );
}
