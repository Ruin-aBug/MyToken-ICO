/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ICryptoDevs,
  ICryptoDevsInterface,
} from "../../../contracts/interfaces/ICryptoDevs";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class ICryptoDevs__factory {
  static readonly abi = _abi;
  static createInterface(): ICryptoDevsInterface {
    return new utils.Interface(_abi) as ICryptoDevsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ICryptoDevs {
    return new Contract(address, _abi, signerOrProvider) as ICryptoDevs;
  }
}
