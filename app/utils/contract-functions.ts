import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'
import { ethers } from 'ethers';
import FIRECHAT_ABI from "../abis/Firechat.json";

export async function createNewChat(user1: string, user2: string) {

  const config = await prepareWriteContract({
    address: process.env.FIRECHAT_CONTRACT_ADDRESS as `0x${string}`|| ethers.constants.AddressZero,
    abi: FIRECHAT_ABI,
    functionName: 'newChat',
    args: [ user1, user2 ],
  })

  const data = await writeContract(config);
  return data;
}

export async function getChat(user1:string, user2:string) {

  async function readChatsMapping(user1: string, user2: string) {
    return await readContract({
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      //address: process.env.FIRECHAT_CONTRACT_ADDRESS as `0x${string}`|| ethers.constants.AddressZero,
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
    }) as string[];
  }

  const room1 = readChatsMapping(user1, user2);
  const room2 = readChatsMapping(user2, user1);

  if ((await room1)[0] != ethers.constants.AddressZero) return room1;
  return await room2;
}
