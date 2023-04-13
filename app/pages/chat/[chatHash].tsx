import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { getChatHistory, Message } from "../../utils/contract-functions";
import FIRECHAT_ABI from "@/abis/Firechat.json";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

const Chat: NextPage = () => {

  const FIRECHAT_CONTRACT_ADDRESS =  "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const router = useRouter();
  const { chatHash } = router.query;
  const [disableInput, setDisableInput] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>();
  const [msgText, setMsgText] = useState("default text");

  const { address } = useAccount({
    onConnect() {
      updateChatUI(chatHash as string);
    },
  });

  async function updateChatUI(chatHash: string) {
    const msgs = await getChatHistory(chatHash, FIRECHAT_CONTRACT_ADDRESS);
    setChatHistory(msgs);
  }


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

  const {
    config: messageConfig,
    error: prepareMsgConfigError,
  } = usePrepareContractWrite({
    address: FIRECHAT_CONTRACT_ADDRESS,
    abi: FIRECHAT_ABI,
    functionName: "sendMessage",
    args: [ msgText, router.isReady ? chatHash as string : "" ],
    onError(err) {
      console.error(err);
    },
  });

  const {
    write: sendMessage,
    error: sendMessageError,
    reset: resetMsgParams,
    data: messageSendData,
  } = useContractWrite(messageConfig);

  const { isLoading: isMessageSendLoading } = useWaitForTransaction({
    hash: messageSendData?.hash,
    onSuccess() {
      updateChatUI(chatHash as string);
      setDisableInput(false);
    },
  })

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

    updateChatUI(chatHash);
    resetMsgParams();
    setDisableInput(false);

  }, [router.isReady, chatHash, router, resetMsgParams])



  return (
    <div className=" flex flex-col items-center ">

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

    {!address && (
      <p>Connect wallet to start chatting.</p>
    )}


    {!chatRoomFetchError &&

      <div className="
        w-8/12 pl-24 my-7
      ">
        <div className="flex flex-row gap-1">
          <p className="mb-2 ml-1">Chatting with: {chatRoom ? (chatRoom[0] != address ? chatRoom[0] : chatRoom[1]): chatRoom}</p>
          <Link href="/" className="
            text-gray-500
          ">
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
          </Link>
        </div>

        <div className="
          rounded-md border border-gray-700
          w-10/12
        ">

          <div className="
            flex flex-col
            gap-7
            p-3
            overflow-y-scroll
            max-h-[500px]
          ">
            {chatHistory?.map(chat => (
               <div key={chat.messageTimestamp} className={`
                 flex flex-col
                 ${chat.messageSender == address ? "self-end" : "self-start"}
                 ${chat.messageSender == address ? "items-end" : "items-start"}
               `}>
                 <p className={`
                  px-2 py-1
                  border-2 rounded-lg
                  ease-in-out duration-300

                  ${chat.messageSender == address ? "border-green-500 hover:bg-green-500/25" : "border-gray-700 hover:bg-gray-700/25"}
                  ${chat.messageSender == address ? "items-end" : "items-start"}

                 `}>{ chat.messageString }</p>
                 <p className=" text-sm text-2 text-gray-400 hover:cursor-pointer " onClick={() => navigator.clipboard.writeText(chat.messageSender)}>
                  { chat.messageSender.slice(0, 4) + "..." + chat.messageSender.slice(chat.messageSender.length - 2,) }
                 </p>
               </div>
            ))}
          </div>

          <form className="
            flex flex-row
            w-full gap-1
            p-3
            "
            onSubmit={e => {
              e.preventDefault();
              setDisableInput(true);

              if (prepareMsgConfigError || !sendMessage) {
                console.log("error while prep", prepareMsgConfigError);
                return;
              }
              sendMessage();
            }}
          >
            <textarea name="message" onChange={e => setMsgText(e.target.value)} disabled={disableInput} className="
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
              hover:text-green-500 disabled:hover:text-gray-700
              border-2 border-gray-700 hover:border-green-500 hover:disabled:border-gray-700 
              rounded-sm hover:rounded-lg hover:disabled:rounded-none
              ease-in-out duration-300
            ">
              <svg className={`w-6 h-6 {isMessageSendLoading ? "hidden" : "block"} `} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>


              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`
                w-6 h-6
                animate-spin
                ${isMessageSendLoading ? "block" : "hidden"}
              `}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
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
