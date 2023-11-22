import { useAccount, useBalance, useNetwork, useSwitchNetwork } from "wagmi";
import { TokenIcon } from "./TokenIcon";
import { TokenDataList } from "../data/tokens";
import { useEffect, useState } from "react";
import { TokenData } from "../interfaces/data/token-data.interface";
import { ERC20__factory, Multicall2, Multicall2__factory } from "../typechain";
import { MULTICALL } from "../config/address";
import { provider } from "../utils/provider";
import { ZeroAddress, formatUnits } from "ethers";
//* 추상화 한번 더 했습니다!
export const getTokenBalance = async (
  tokens: string[],
  user: `0x${string}`
): Promise<{ blockNumber: bigint; returnData: string[] }> => {
  const multicall = Multicall2__factory.connect(MULTICALL, provider);
  const data: Multicall2.CallStruct[] = [];
  const tokenItf = ERC20__factory.createInterface();
  for (const token of tokens) { 
    if (token !== ZeroAddress) {
      data.push({
        target: token,
        callData: tokenItf.encodeFunctionData("balanceOf", [user]),
      });
    }
  }
  return multicall.aggregate(data);
};

export default function Portfolio({lpDone,swapDone,withdrawDone}: {lpDone: boolean, swapDone: boolean, withdrawDone: boolean }) {
  const { address: user } = useAccount();
  const { data: balance } = useBalance({ address: user, chainId: 137 });
  const { chain: currentChain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const [tokenList, setTokenList] = useState<TokenData[]>([]);
  const [tokenBalance, setTokenBalance] = useState<string[]>([]);
  const getBalancesList = async () => {
    if (currentChain && user) {
      const tokenBalances = (
        await getTokenBalance(
          TokenDataList[currentChain.id].map((token) => token.address),
          user
        )
      ).returnData;
      setTokenList(TokenDataList[currentChain.id]);

      setTokenBalance(tokenBalances);
    }
  };
  useEffect(() => {
    switchNetwork?.(137);
    getBalancesList();
  }, [user, currentChain,lpDone,swapDone,withdrawDone]);

  return user ? (
    <div>
      {tokenList.map((token, i) => {
        if (balance && i === 0) {
          // native token
          return (
            <div key={i} className="flex flex-row">
              <TokenIcon token={token} size="md" />
              <div>{formatUnits(balance!.value, 18)}</div>
            </div>
          );
        } else if (BigInt(tokenBalance[i - 1]) > 0n) {
          return (
            // make border box for portfolio
            <div key={i} className="flex flex-row">
              <TokenIcon token={token} size="md" />
              <div>{formatUnits(tokenBalance[i - 1], token.decimals)}</div>
            </div>
          );
        }
      })}
    </div>
  ) : (
    <div> 지갑 연결해라 🤬</div>
  );
}
