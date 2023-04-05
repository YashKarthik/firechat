import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'
import { ethers } from 'ethers';
import FIRECHAT_ABI from "../abis/Firechat.json";

async function createNewChat(user1: string, user2: string) {

  const config = await prepareWriteContract({
    address: process.env.FIRECHAT_CONTRACT_ADDRESS as `0x${string}`|| ethers.constants.AddressZero,
    abi: FIRECHAT_ABI,
    functionName: 'feed',
    args: [ user1, user2 ],
  })

  const data = await writeContract(config);
  return data;
}

async function getChat(user1:string, user2:string) {

  const room1 = readContract({
    address: process.env.FIRECHAT_CONTRACT_ADDRESS as `0x${string}`|| ethers.constants.AddressZero,
    abi: FIRECHAT_ABI,
    functionName: "chats",
    args: [
      ethers.utils
      .keccak256(
        ethers.utils
        .defaultAbiCoder.encode(
          [ "address", "address" ],
          [ user1, user2 ]
        )
      ) 
    ],
  });

  const room2 = readContract({
    address: process.env.FIRECHAT_CONTRACT_ADDRESS as `0x${string}`|| ethers.constants.AddressZero,
    abi: FIRECHAT_ABI,
    functionName: "chats",
    args: [
      ethers.utils
      .keccak256(
        ethers.utils
        .defaultAbiCoder.encode(
          [ "address", "address" ],
          [ user2, user1 ]
        )
      ) 
    ],
  });

  await room1;
  console.log(room1)
  await room2;
  console.log(room2)
}
