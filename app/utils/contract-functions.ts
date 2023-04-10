import { readContract } from '@wagmi/core'
import { ethers } from 'ethers';
import FIRECHAT_ABI from "../abis/Firechat.json";

/** 
  * Takes in the users of chat room and returns the array, chatHash for which the chat room exist.
  * Returns null if chat room with given users does not exist.
  **/
export async function getChat(user1:string, user2:string, FIRECHAT_CONTRACT_ADDRESS: `0x${string}`) {

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
      address: FIRECHAT_CONTRACT_ADDRESS,
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

export type Message = {
  messageString: string;
  messageSender: string;
  messageTimestamp: string;
}

export async function getChatHistory(chatHash: string, FIRECHAT_CONTRACT_ADDRESS: `0x${string}`) {
  const chatHistory = await readContract({
    address: FIRECHAT_CONTRACT_ADDRESS,
    abi: FIRECHAT_ABI,
    functionName: "getChatHistory",
    args: [ chatHash ],
  }) as [[] | string[], [] | string[], [] | string[]];

  const chats: Message[] = chatHistory[0].map((_, msgIndex) => (
    {
      messageString: chatHistory[0][msgIndex],
      messageSender: chatHistory[1][msgIndex],
      messageTimestamp: chatHistory[2][msgIndex],
    }
  ));

  console.log(chats);
  return chats;
}
