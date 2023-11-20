/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "./common";

export declare namespace Multicall2 {
  export type CallStruct = { target: AddressLike; callData: BytesLike };

  export type CallStructOutput = [target: string, callData: string] & {
    target: string;
    callData: string;
  };
}

export interface Multicall2Interface extends Interface {
  getFunction(nameOrSignature: "aggregate"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "aggregate",
    values: [Multicall2.CallStruct[]]
  ): string;

  decodeFunctionResult(functionFragment: "aggregate", data: BytesLike): Result;
}

export interface Multicall2 extends BaseContract {
  connect(runner?: ContractRunner | null): Multicall2;
  waitForDeployment(): Promise<this>;

  interface: Multicall2Interface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  aggregate: TypedContractMethod<
    [calls: Multicall2.CallStruct[]],
    [[bigint, string[]] & { blockNumber: bigint; returnData: string[] }],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "aggregate"
  ): TypedContractMethod<
    [calls: Multicall2.CallStruct[]],
    [[bigint, string[]] & { blockNumber: bigint; returnData: string[] }],
    "view"
  >;

  filters: {};
}
