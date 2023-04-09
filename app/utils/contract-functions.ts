import { readContract } from '@wagmi/core'
import { ethers } from 'ethers';
import FIRECHAT_ABI from "../abis/Firechat.json";

/** 
  * Takes in the users of chat room and returns the array, chatHash for which the chat room exist.
  * Returns null if chat room with given users does not exist.
  **/
export async function getChat(user1:string, user2:string, contractAddress: `0x${string}`) {

  async function readChatsMapping(user1: string, user2: string) {
    const userPair = ethers
      .utils
      .keccak256(
        ethers.utils
        .defaultAbiCoder.encode(
          [ "address", "address" ],
          [ user1, user2 ]
        )
      );
    const room = await readContract({
      address: contractAddress,
      abi: FIRECHAT_ABI,
      functionName: "chats",
      args: [userPair],
    }) as string[];

    return {
      users: room,
      chatHash: userPair
    }
  }

  const room1 = readChatsMapping(user1, user2);
  const room2 = readChatsMapping(user2, user1);

  if ((await room1).users[0] != ethers.constants.AddressZero) return room1;
  if ((await room2).users[0] != ethers.constants.AddressZero) return room2;

  return null;
}
