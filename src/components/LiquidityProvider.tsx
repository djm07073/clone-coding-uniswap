import { useEffect, useState } from "react";
import { TokenSelect } from "./TokenSelect";
import { TokenData } from "../interfaces/data/token-data.interface";
import { formatUnits, parseUnits } from "viem";
import { ERC20__factory, UniswapV2Router02__factory } from "../typechain";
import { FACTORY, ROUTER02 } from "../config/address";
import { provider } from "../utils/provider";
import { UniswapV2Factory__factory } from "../typechain/factories/UniswapV2Factory__factory";
import { UniswapV2Pair__factory } from "../typechain/factories/UniswapV2Pair__factory";
import { MaxUint256, ZeroAddress } from "ethers";
import { TokenDataList } from "../data/tokens";

export default function LiquidityProvider() {
    const [amount0Value, setAmount0Value] = useState("");
    const [amount1Value, setAmount1Value] = useState("");
    const [approved, setApproved] = useState<boolean>(false);

    const [pool, setPool] = useState<string>("");
    const [token0, setToken0] = useState<TokenData>();
    const [token1, setToken1] = useState<TokenData>();
    const handleAmount0 = async (e: React.ChangeEvent<HTMLInputElement>) => { 
      const amount0 = e.target.value;
      setAmount0Value(amount0);
      if (pool && Number(amount0) > 0) {
        const amount1 = await getAmount1FromAmount0(
         pool,
         parseUnits(amount0, token0!.decimals)
        )
        setAmount1Value(formatUnits(amount1, token1!.decimals));
      }  
    };
    const handleAmount1 = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const amount1 = e.target.value;
      setAmount1Value(amount1);
      if (pool && Number(amount1) > 0) {
        const amount0 = await getAmount0FromAmount1(
          pool,
          parseUnits(amount1, token1!.decimals)
        );
        setAmount0Value(formatUnits(amount0, token0!.decimals));
      }
    };
    
    const getAmount0FromAmount1 = async (poolAddr:string, amount1: bigint): Promise<bigint> => { 
      const reserves = await UniswapV2Pair__factory
        .connect(poolAddr, provider)
        .getReserves();
      return UniswapV2Router02__factory.connect(ROUTER02, provider).quote(amount1, reserves.reserve1, reserves.reserve0);
      
    };
    const getAmount1FromAmount0 = async (
      poolAddr: string,
      amount0: bigint
    ): Promise<bigint> => {
      
      
      const reserves = await UniswapV2Pair__factory.connect(
        poolAddr,
        provider
      ).getReserves();
      return UniswapV2Router02__factory.connect(ROUTER02, provider).quote(
        amount0,
        reserves.reserve0,
        reserves.reserve1
      );
    };
  const addLiquidity = async () => {
      if (!token0 || !token1) return;
      const signer = await provider.getSigner();
      const router = UniswapV2Router02__factory.connect(ROUTER02, signer);
      if (token0?.address === ZeroAddress) await router.addLiquidityETH(token1?.address, parseUnits(amount1Value, token1!.decimals), 0, 0, signer.getAddress(), MaxUint256, {value: parseUnits(amount0Value, token0!.decimals)});
      if (token1?.address === ZeroAddress) await router.addLiquidityETH(token0.address, parseUnits(amount0Value, token0!.decimals), 0, 0, signer.getAddress(), MaxUint256, {value: parseUnits(amount1Value, token1!.decimals)});
      if (token0?.address !== ZeroAddress && token1?.address !== ZeroAddress) await router.addLiquidity(token0.address, token1.address, parseUnits(amount0Value, token0!.decimals), parseUnits(amount1Value, token1!.decimals), 0, 0, signer.getAddress(), MaxUint256);
    };
  const approve = async () => { 
    if (!token0 || !token1) return;  
    const signer = await provider.getSigner();
    const token0Contract = ERC20__factory.connect(token0!.address, signer);
    const token1Contract = ERC20__factory.connect(token1!.address, signer);
    if (token0?.address !== ZeroAddress) await token0Contract.approve(ROUTER02, parseUnits(amount0Value, token0!.decimals));
    if (token1?.address !== ZeroAddress) await token1Contract.approve(ROUTER02, parseUnits(amount1Value, token1!.decimals));
    setApproved(true);
  };
  const getPool = async (
    token0: TokenData,
    token1: TokenData
  ): Promise<string> => {
    const factory = UniswapV2Factory__factory.connect(FACTORY, provider);
    if (token0.address == ZeroAddress) return factory.getPair(TokenDataList[137][1].address, token1.address);
    if (token1.address == ZeroAddress) return factory.getPair(token0.address, TokenDataList[137][1].address);
    return factory.getPair(token0.address, token1.address);
  };
  useEffect(() => { 
    if (token0?.address && token1?.address) {

      getPool(token0, token1).then((pool) => { console.log(pool); setPool(pool); });
    }
  },[token0, token1])
    
    return (
      <div className="flex flex-col items-center">
        <div className="flex flex-row justify-center m-4">
          <input
            type="number"
            className="border border-gray-300 rounded-lg p-2"
            placeholder="0"
            onChange={handleAmount0}
            value={amount0Value}
          />
          <TokenSelect
            setSelectedToken={setToken0}
            selectedToken={token0}
            blockSelectedToken={token1}
          />
        </div>
        <div className="flex flex-row justify-center m-4">
          <input
            type="number"
            className="border border-gray-300 rounded-lg p-2"
            placeholder="0"
            onChange={handleAmount1}
            value={amount1Value}
          />
          <TokenSelect
            setSelectedToken={setToken1}
            selectedToken={token1}
            blockSelectedToken={token0}
          />
        </div>
        <div>
          {approved ? (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-40 rounded"
              onClick={approve}
            ></button>
          ) : (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-40 rounded"
              onClick={addLiquidity}
            >
              Add Liquidity
            </button>
          )}
        </div>
      </div>
    );
}

