import React, { useEffect, useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { TokenData } from '../interfaces/data/token-data.interface';
import { TokenDataList } from '../data/tokens';
import { ZeroAddress, formatUnits } from 'ethers';
import { Multicall2, Multicall2__factory, UniswapV2Factory__factory } from '../typechain';
import { FACTORY, MULTICALL } from '../config/address';
import { getTokenBalance } from './Portfolio';
import { TokenIcon } from './TokenIcon';
import { provider } from '../utils/provider';
import { slice } from 'viem';

export default function LPTokenBalanace() {

    const { chain: currentChain } = useNetwork();
    const { address: user } = useAccount();
    const [pairList, setPairList] = useState<TokenData[][]>([]); //* lp token으로 쌍으로 저장함.
    const [lpTokenBalance, setLPTokenBalance] = useState<bigint[]>([]);

    const getLPTokenData = (): undefined | TokenData[][] => {
      const lpDatas =
        currentChain &&
        TokenDataList[currentChain.id] &&
        TokenDataList[currentChain.id].flatMap((token, next) => {
          return TokenDataList[currentChain.id]
            .slice(next + 1)
            .map((token2) => [token, token2])
            .filter(
              (pair) =>
                pair[0].address !== ZeroAddress &&
                pair[1].address !== ZeroAddress
          );
        });
       
        lpDatas && setPairList(lpDatas);

      return lpDatas;
    };
    const getLPs = async (pairDatas: TokenData[][]) => {
      const multicall = Multicall2__factory.connect(MULTICALL, provider);
      const factoryItf = UniswapV2Factory__factory.createInterface();
      const data: Multicall2.CallStruct[] = [];
        for (const pair of pairDatas) {
            data.push({
              target: FACTORY,
              callData: factoryItf.encodeFunctionData("getPair", [
                pair[0].address,
                pair[1].address,
              ]),
            });
        }
       
        return (await multicall
          .aggregate(data)
          .then((res) => res[1])).map((s)=>slice(s as `0x${string}`, 12, 66)); // 결과가 bytes로 나와서 address에 맞게 하려면 12번째부터 66번째까지 자름.
    };

    const getLPBalancesList = async (pairDatas: TokenData[][]) => {
        const lpAddrs = await getLPs(pairDatas);
        const balances = user && await getTokenBalance(lpAddrs, user).then((res) => res.returnData);
        const lpTokenBalance = balances && balances.map((s) => BigInt(s)); // getTokenBalance 함수는 Portfolio.tsx에서 가져옴
        
        lpTokenBalance && setLPTokenBalance(lpTokenBalance);
    };
    useEffect(() => {
        //* get the list of LP tokens
        const lpList = getLPTokenData();
        lpList && getLPBalancesList(lpList);
    },[user, currentChain]);

    return(
      <div>
        {user ? (
          lpTokenBalance &&
                pairList.map((pair, i) => (
                (lpTokenBalance[i] > 0n) ? 
                <div key={i} className="flex flex-row">
                  LP
                  <TokenIcon token={pair[0]} size="md" />
                  <TokenIcon token={pair[1]} size="md" />
                  <div>{formatUnits(lpTokenBalance[i], 18)}</div>
                </div>
                : <div></div>
          ))
        ) : (
          <div>Connect your wallet</div>
        )}
      </div>
    );
}
    


