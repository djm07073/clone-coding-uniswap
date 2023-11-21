import React, { useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { TokenData } from '../interfaces/data/token-data.interface';
import { TokenDataList } from '../data/tokens';
import { ZeroAddress } from 'ethers';
import { Multicall2, Multicall2__factory, UniswapV2Factory__factory } from '../typechain';
import { FACTORY, MULTICALL } from '../config/address';

export default function LPTokenBalanace() {

    const { chain: currentChain } = useNetwork();
    const { address: user } = useAccount();
    const [lpTokenList, setLPTokenList] = useState<TokenData[][]>([]); //* lp token으로 쌍으로 저장함.
    const [lpTokenBalance, setLPTokenBalance] = useState<string[]>([]);

    const getLPTokenData = (): undefined | TokenData[][] => {
      const lpData =
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
      lpData && setLPTokenList(lpData);
      return lpData;
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
      return multicall.aggregate(data).then((res) => res[1]);
    };

    const getLPBalancesList = async (pairDatas: TokenData[][]) => {
      const lpAddrs = await getLPs(pairDatas);
      const lpTokenBalance =
        user &&
          (await getTokenBalance(lpAddrs, user).then((res) => res.returnData));
      lpTokenBalance && setLPTokenBalance(lpTokenBalance);
    };
    //TODO: get the balance of the LP token from the user's wallet
    useEffect(() => {
      //* get the list of LP tokens
      const lpTokens = getLPTokenData();
      //* get the balance of the LP tokens
      lpTokens && getLPBalancesList(lpTokens);
    }, [user, currentChain]);
    return (
      <div>
        {lpTokenList &&
          lpTokenList.map((pair, i) => (
            <div key={i} className="flex flex-row">
              LP
              <TokenIcon token={pair[0]} size="md" />
              <TokenIcon token={pair[1]} size="md" />
              <div>{formatUnits(lpTokenBalance[i], 18)}</div>
            </div>
          ))}
      </div>
    );
}

