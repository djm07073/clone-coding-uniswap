import React, { useEffect, useState } from "react";
import { TokenDataList } from "../data/tokens";
import { useNetwork } from "wagmi";
import { TokenData } from "../interfaces/data/token-data.interface";

export function TokenSelect({
  setSelectedToken,
  selectedToken,
}: {
  selectedToken: TokenData | undefined;
  setSelectedToken: (token: TokenData) => void;
}) {
  const [tokenList, setTokenList] = useState<TokenData[]>([]);
  const { chain: currentChain } = useNetwork();
  const handleTokenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    tokenList.map((token) => {
      if (token.symbol === event.target.value) {
        setSelectedToken(token);
      }
    });
  };
  useEffect(() => {
    if (currentChain) {
      setTokenList(TokenDataList[currentChain.id]);
    }
  });
  return (
    <div>
      <select value={selectedToken?.symbol || ""} onChange={handleTokenChange}>
        <option value="">Select a token</option>
        {tokenList.map((token, tokenIndex) => (
          <option key={tokenIndex} value={token.symbol}>
            {token.symbol}
          </option>
        ))}
      </select>
    </div>
  );
}
