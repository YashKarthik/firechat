import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getChatHistory, Message } from "../../utils/contract-functions";
import FIRECHAT_ABI from "@/abis/Firechat.json";
import { useAccount, useContractRead } from "wagmi";
import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Chat: NextPage = () => {

  const FIRECHAT_CONTRACT_ADDRESS =  "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const router = useRouter();
  const { chatHash } = router.query;
  const [disableInput, setDisableInput] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>();

  const { address } = useAccount();

  useEffect(() => {
    if (!router.isReady) {
      console.count("router not ready");
      return;
    }

    console.count("router loaded");
    if (typeof chatHash != "string") {
      router.push("/");
      return;
    }

    if (chatHash.length != 66) {
      router.push("/");
      return
    };

    async function getChats(chatHash: string) {
      const msgs = await getChatHistory(chatHash, FIRECHAT_CONTRACT_ADDRESS);
      setChatHistory(msgs);
    }

    setDisableInput(false);

  }, [router.isReady])


  const {
    data: chatRoom,
    isError: chatRoomFetchError
  } = useContractRead({
    address: FIRECHAT_CONTRACT_ADDRESS,
    abi: FIRECHAT_ABI,
    functionName: "chats",
    args: [ chatHash ],
    onSuccess(data: string[]) {
      if (data[0] == ethers.constants.AddressZero) {
        router.push("/");
        return;
      }
      console.log("Users:\n", data);
      if (address != data[0] && address != data[1]) {
        router.push("/");
        return;
      }
    },
    onError() { console.count("err")}
  });

  return (
    <div className="
      flex flex-col items-center
      min-h-screen
      bg-neutral-950 text-white
    ">

    { !router.isReady && (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`
        w-6 h-6
        animate-spin
      `}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
      </svg>
    )}

    <div className=" self-end m-3 ">
      <ConnectButton />
    </div>

    <h1 className=" text-3xl font-bold ">
      Firechat
    </h1>

    {!chatRoomFetchError &&

      <div className="
        w-8/12 pl-24 my-7
      ">
        <p className="mb-2 ml-1">Chatting with: {chatRoom ? (chatRoom[0] == address ? chatRoom[0] : chatRoom[1]): chatRoom}</p>

        <div className="
          rounded-md border border-gray-700
          w-10/12
        ">

          <div className="
            flex flex-col
            p-3
          ">
            <p> msgs </p>
            <p> msgs </p>
            <p> msgs </p>
          </div>

          <form className="
            flex flex-row
            w-full gap-1
            p-3
            "
            onSubmit={e => {
              e.preventDefault();
              setDisableInput(true);
              const message = e.currentTarget.elements.namedItem("message") as HTMLInputElement;
              console.log(message.value);
            }}
          >
            <textarea name="message" disabled={disableInput} className="
              col-span-4
              flex h-14 w-full py-2 px-3 
              rounded-md border-2 border-gray-700
              bg-transparent text-gray-50
              text-sm placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-offset-2 
              disabled:cursor-not-allowed disabled:opacity-50
              focus:ring-gray-400 focus:ring-offset-gray-900
            "/>

            <button type="submit" disabled={disableInput} className="
              px-4 w-16
              hover:text-green-500 disabled:hover:text-red-500
              border-2 border-gray-700 hover:border-green-500 hover:disabled:border-red-500 
              rounded-sm hover:rounded-lg hover:disabled:rounded-none
              ease-in-out duration-300
            ">
              <svg className="w-6 h-6 " xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>

      </div>
    }
    </div>
  );
}

export default Chat;