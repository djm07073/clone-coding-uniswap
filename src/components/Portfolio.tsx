import { useAccount, useNetwork } from "wagmi";
import { TokenIcon } from "./TokenIcon";
import { TokenDataList } from "../data/tokens";
import { useEffect, useState } from "react";
import { TokenData } from "../interfaces/data/token-data.interface";
import { ERC20__factory, Multicall2, Multicall2__factory } from "../typechain";
import { MULTICALL } from "../config/address";
import { provider } from "../utils/provider";
import { ZeroAddress, formatUnits } from "ethers";
const getTokenBalance = async (
  tokens: TokenData[],
  user: `0x${string}`
): Promise<{ blockNumber: bigint; returnData: string[] }> => {
  const multicall = Multicall2__factory.connect(MULTICALL, provider);
  const tokenItf = ERC20__factory.createInterface();
  const data: Multicall2.CallStruct[] = [];
  tokens.map((token) => {
    if (token.address !== ZeroAddress) {
      data.push({
        target: token.address,
        callData: tokenItf.encodeFunctionData("balanceOf", [user]),
      });
    }
  });
  return multicall.aggregate(data);
};
export default function Portfolio() {
  const { address: user } = useAccount();
  const { chain: currentChain } = useNetwork();
  const [tokenList, setTokenList] = useState<TokenData[]>([]);
  const [tokenBalance, setTokenBalance] = useState<string[]>([]);
  const getBalancesList = async () => {
    if (currentChain && user) {
      const tokenBalances = (
        await getTokenBalance(TokenDataList[currentChain.id], user)
      ).returnData;
      setTokenList(TokenDataList[currentChain.id]);
      setTokenBalance(tokenBalances);
    }
  };
  useEffect(() => {
    getBalancesList();
  }, [currentChain, user]);

  return user ? (
    <div>
      {tokenList.map((token, i) => {
        if (BigInt(tokenBalance[i]) > 0n) {
          return (
            // make border box for portfolio
            <div key={i} className="flex flex-row">
              <TokenIcon token={token} size="md" />
              <div>{formatUnits(tokenBalance[i], token.decimals)}</div>
            </div>
          );
        }
      })}
    </div>
  ) : (
    <div> 지갑 연결해라 🤬</div>
  );
}
