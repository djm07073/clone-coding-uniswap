import { ethers } from "ethers";

export const provider = new ethers.AlchemyProvider(
  137,
  import.meta.env.VITE_ALCHEMY_KEY
);
