import { ChangeEvent, useState } from "react";
import { ROUTER02 } from "../config/address";
import { ERC20__factory, UniswapV2Router02__factory } from "../typechain";
import { BsFillArrowDownCircleFill } from "react-icons/bs";
import { TokenSelect } from "./TokenSelect";
import { provider } from "../utils/provider";
import { TokenData } from "../interfaces/data/token-data.interface";
import { formatUnits,parseEther,parseUnits } from "viem";
import { MaxUint256, ZeroAddress } from "ethers";
import { TokenDataList } from "../data/tokens";
import {  useWalletClient } from "wagmi";
import { JsonRpcSigner } from "ethers";
import { BrowserProvider } from "ethers";


export default function SwapNavigator(
  {swapDone,setSwapDone}: {swapDone: boolean, setSwapDone: React.Dispatch<React.SetStateAction<boolean>>}
) {

  const { data:client } = useWalletClient();
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [inputToken, setInputToken] = useState<TokenData>();
  const [outputToken, setOutputToken] = useState<TokenData>();
  const [path, setPath] = useState<`0x${string}`[]>();
  const [approveDone, setApproveDone] = useState(true);

  const signer = client &&  new JsonRpcSigner(
      new BrowserProvider(client.transport, {
        chainId: client.chain.id,
        name: client.chain.name,
        ensAddress: client.chain.contracts?.ensRegistry?.address,
      }),
      client.account.address
    );
  
  const getAmountOut = async (
    path: `0x${string}`[],
    amountIn: bigint
  ): Promise<bigint> => {
    const router = UniswapV2Router02__factory.connect(ROUTER02, provider);
    const result: bigint[] = await router.getAmountsOut(amountIn, path);
    return result[result.length - 1];
  };
  const getAmountIn = async (
    path: `0x${string}`[],
    amountOut: bigint
  ): Promise<bigint> => {
    const router = UniswapV2Router02__factory.connect(ROUTER02, provider);
    
    const result: bigint[] = await router.getAmountsIn(amountOut, path);
    return result[0];
  };
  const handleSwap = async () => { 
    
    
    const router = UniswapV2Router02__factory.connect(ROUTER02, signer);
    if (inputToken?.address === ZeroAddress) {
      await router.swapExactETHForTokens(0, path!, client!.account.address, MaxUint256,{value:parseEther(inputValue)}).then((tx) => tx.wait());
    } else if(outputToken?.address === ZeroAddress){
      await router
        .swapExactTokensForETH(parseUnits(inputValue,inputToken!.decimals),0, path!, client!.account.address, MaxUint256)
        .then((tx) => tx.wait());
      setSwapDone(true);
      
    } else {
      await router
        .swapExactTokensForTokens(parseUnits(inputValue,inputToken!.decimals),0, path!, client!.account.address, MaxUint256)
        .then((tx) => tx.wait());
      setSwapDone(true);
    }
    
  }
  const handleApprove = async () => { 
    
    const token = ERC20__factory.connect(inputToken!.address, signer);
    await token.approve(ROUTER02, parseUnits(inputValue, inputToken!.decimals)).then((tx) => tx.wait());
    setApproveDone(true);
    
  };
  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    inputToken?.address && setInputValue(event.target.value);

    if (outputToken?.address && event.target.value !== "0") {
      if (Number(event.target.value) !== 0) {
        setInputToken(inputToken);
        setOutputToken(outputToken);
        const srcToken =
          inputToken!.address === ZeroAddress
            ? (TokenDataList[137][1].address as `0x${string}`)
            : (inputToken!.address as `0x${string}`);
        const dstToken =
          outputToken!.address === ZeroAddress
            ? (TokenDataList[137][1].address as `0x${string}`)
            : (outputToken!.address as `0x${string}`);
        
        setPath([srcToken,dstToken]);
        const amountOut = await getAmountOut(
          [srcToken,dstToken],
          parseUnits(event.target.value, inputToken!.decimals)
        );

        setOutputValue(formatUnits(amountOut, outputToken!.decimals));
      } else {
        setOutputValue("0");
      }
    }
  };
  const handleOutputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    inputToken?.address && setOutputValue(event.target.value);
    if (inputToken?.address) {
      if (Number(event.target.value) !== 0) {
        const amountIn = await getAmountIn(
          [
            inputToken!.address as `0x${string}`,
            outputToken!.address as `0x${string}`,
          ],
          parseUnits(event.target.value, outputToken!.decimals)
        );
        setInputValue(formatUnits(amountIn, inputToken!.decimals));
      } else {
        setInputValue("0");
      }
    }
  };
  const toggleTokens = async () => {
    const t1 = inputToken;
    const t2 = inputValue;
    setInputToken(outputToken);
    setOutputToken(t1);
    setInputValue(outputValue);
    setOutputValue(t2);
  };
  return (
    <div className="flex flex-col items-center mt-4">
      <div className="flex flex-row justify-center m-4">
        <input
          type="text"
          className="border border-gray-300 rounded-lg p-2"
          placeholder="0"
          value={inputValue}
          onChange={handleInputChange}
        />
        <TokenSelect
          setSelectedToken={setInputToken}
          selectedToken={inputToken}
          blockSelectedToken={outputToken}
        />
      </div>

      <BsFillArrowDownCircleFill onClick={toggleTokens} />
      <div className="flex flex-row justify-center m-4">
        <input
          type="text"
          className="border border-gray-300 rounded-lg p-2"
          placeholder="0"
          value={outputValue}
          onChange={handleOutputChange}
        />
        <TokenSelect
          setSelectedToken={setOutputToken}
          selectedToken={outputToken}
          blockSelectedToken={inputToken}
        />
      </div>

      <div>
        {inputToken && inputToken.address !== ZeroAddress ? (
          !approveDone ? (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-36 rounded"
              onClick={handleApprove}
            >
              Approve
            </button>
          ) : (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-36 rounded"
              onClick={handleSwap}
            >
              Swap
            </button>
          )
        ) : !swapDone ? (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-36 rounded"
            onClick={handleSwap}
          >
            Swap
          </button>
        ) : (
          <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-36 rounded">
            Done! 🎉
          </div>
        )}
      </div>
    </div>
  );
}
