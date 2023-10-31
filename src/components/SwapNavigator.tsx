import { ChangeEvent, useState } from "react";
import { ROUTER02 } from "../config/address";
import { UniswapV2Router02__factory } from "../typechain";
import { BsFillArrowDownCircleFill } from "react-icons/bs";
import { TokenSelect } from "./TokenSelect";
import { provider } from "../utils/provider";
import { TokenData } from "../interfaces/data/token-data.interface";
import { formatUnits,parseUnits } from "viem";
import { ZeroAddress } from "ethers";
import { TokenDataList } from "../data/tokens";
import {  useWalletClient } from "wagmi";
import { JsonRpcSigner } from "ethers";
import { BrowserProvider } from "ethers";


export default function SwapNavigator() {

  const { data:client } = useWalletClient();
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [selectedInputToken, setSelectedInputToken] = useState<TokenData>();
  const [selectedOutputToken, setSelectedOutputToken] = useState<TokenData>();
  const [isInputNative, setIsInputNative] = useState<boolean>(false);
  const [isOutputNative, setIsOutputNative] = useState<boolean>(false);
  const [path, setPath] = useState<`0x${string}`[]>();


  
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
    
    const signer = client &&  new JsonRpcSigner(
      new BrowserProvider(client.transport, {
        chainId: client.chain.id,
        name: client.chain.name,
        ensAddress: client.chain.contracts?.ensRegistry?.address,
      }),
      client.account.address
    );
    const router = UniswapV2Router02__factory.connect(ROUTER02, signer);
    //TODO: MISSION 5 


    
  }
  const handleApprove = async () => { 
    //TODO: MISSION 5
  };
  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    selectedInputToken?.address && setInputValue(event.target.value);

    if (selectedOutputToken?.address && event.target.value !== "0") {
      if (Number(event.target.value) !== 0) {
        if (selectedInputToken!.address === ZeroAddress) setIsInputNative(true);
        if(selectedOutputToken!.address === ZeroAddress) setIsOutputNative(false)
        const srcToken =
          selectedInputToken!.address === ZeroAddress
            ? (TokenDataList[137][1].address as `0x${string}`)
            : (selectedInputToken!.address as `0x${string}`);
        const dstToken =
          selectedOutputToken!.address === ZeroAddress
            ? (TokenDataList[137][1].address as `0x${string}`)
            : (selectedOutputToken!.address as `0x${string}`);
        
        setPath([srcToken,dstToken]);
        const amountOut = await getAmountOut(
          [srcToken,dstToken],
          parseUnits(event.target.value, selectedInputToken!.decimals)
        );

        setOutputValue(formatUnits(amountOut, selectedOutputToken!.decimals));
      } else {
        setOutputValue("0");
      }
    }
  };
  const handleOutputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    selectedInputToken?.address && setOutputValue(event.target.value);
    if (selectedInputToken?.address) {
      if (Number(event.target.value) !== 0) {
        const amountIn = await getAmountIn(
          [
            selectedInputToken!.address as `0x${string}`,
            selectedOutputToken!.address as `0x${string}`,
          ],
          parseUnits(event.target.value, selectedOutputToken!.decimals)
        );
        setInputValue(formatUnits(amountIn, selectedInputToken!.decimals));
      } else {
        setInputValue("0");
      }
    }
  };
  const toggleTokens = async () => {
    const t1 = selectedInputToken;
    const t2 = inputValue;
    setSelectedInputToken(selectedOutputToken);
    setSelectedOutputToken(t1);
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
          setSelectedToken={setSelectedInputToken}
          selectedToken={selectedInputToken}
          blockSelectedToken={selectedOutputToken}
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
          setSelectedToken={setSelectedOutputToken}
          selectedToken={selectedOutputToken}
          blockSelectedToken={selectedInputToken}
        />
      </div>

      <div>
        { isInputNative || isOutputNative }? <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-36 rounded"
          onClick={handleApprove}
        >
          Approve
        </button>
        :
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-36 rounded"
          onClick={handleSwap}
        >
          Swap
        </button>
      </div>
    </div>
  );
}
