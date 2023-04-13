import type { NextPage } from 'next';
import Head from 'next/head';
import { useRef, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { ethers } from 'ethers';

import { getChat } from '../utils/contract-functions';
import FIRECHAT_ABI from "../abis/Firechat.json";
import { useRouter } from 'next/router';

const Home: NextPage = () => {

  const FIRECHAT_ADDRESS =  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const [inputStatus, setInputStatus] = useState<"room exists" | "invalid address" | "zero address" | "valid">("zero address");
  const msgReceiverAddrRef = useRef(ethers.constants.AddressZero);
  const router = useRouter();

  const { address } = useAccount({
    onConnect() {
      resetChatParams();
    },
  });

  async function checkIfRealError() {
    console.log(msgReceiverAddrRef.current);
    if (!address) return;
    if (!prepareChatConfigError) {
      console.log("valid");
      setInputStatus("valid");
      return;
    }

    console.log("still running", prepareChatConfigError);

    try {
      const room = await getChat(address, msgReceiverAddrRef.current, FIRECHAT_ADDRESS);
      if (room) {
        console.log('room exists');
        setInputStatus("room exists");
        return room.chatHash;
      }
      console.log("invalid address"); // if room doesn't exist, but we still get some error, there's some error
      setInputStatus("invalid address");
      return;

    } catch (e) {
      if (e instanceof Error) {
        // getChat will throw if the input is not an address
        if (e.message.slice(0, 15) == `invalid address`) {
          setInputStatus("invalid address");
          console.log("invalid address");
          return;
        }

      }
      console.log(e);
    }
  }

  const {
    config: chatConfig,
    error: prepareChatConfigError,
  } = usePrepareContractWrite({
    address: FIRECHAT_ADDRESS,
    abi: FIRECHAT_ABI,
    functionName: "newChat",
    args: [
      address,
      msgReceiverAddrRef.current
    ]
  });

  const {
    write: createNewChat,
    reset: resetChatParams,
    isLoading: isNewChatPreparing,
    data: createNewChatData
  } = useContractWrite(chatConfig);

  const { isLoading: isNewChatLoading } = useWaitForTransaction({
    hash: createNewChatData?.hash,
  });

  return (
    <div>
      <Head>
        <title>Firechat</title>
        <meta
          name="description"
          content="An on-chain chat app that uses smart contract storage as database."
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <div className=" flex flex-col ">
        <div className="
          flex flex-col
          items-center
        ">

        <div className=" self-end m-3 ">
          <ConnectButton />
        </div>

          <h1 className=" text-3xl font-bold ">
            Welcome to <span className='font-mono text-green-500'>Firechat</span>
          </h1>

          <p className="mb-7 mt-1">
            Burn <code className='text-green-500 font-mono ml-1'>ether Ξ </code>
            by chatting on-chain. <br/> <i className='text-green-500 font-mono'>Emergency</i> chat app on Ethereum.
          </p>

          <div className='mt-10'>
            <p>
              Whom do you wanna chat with?
            </p>
            <form onSubmit={async e => {
              e.preventDefault();
              if (!address) return;
              const chatHash = await checkIfRealError();
              console.log("on submit", inputStatus);
              if (chatHash) {
                router.push(`/chat/${chatHash}`);
                return;
              }

              console.log("starting");
              console.log("Config:\n", chatConfig);
              createNewChat?.();
              }}
              className="
                flex flex-col md:flex-row
                gap-2 items-center mt-2
            ">
              <input
                type="text"
                name="receiver"
                onChange={r => {
                  msgReceiverAddrRef.current = r.target.value;
                }} 
                className="
                  p-1
                  bg-black
                  border-2 border-gray-500
                  rounded-sm
                  min-w-[32ch] md:min-w-[42ch]
              "/>

              <button type='button' title="Refresh" className={`
                p-1 max-w-xs bg-black group
                hover:text-green-500
                border-2 border-gray-500 hover:border-green-500
                rounded-sm hover:rounded-lg
                ease-in-out duration-300
              `} onClick={() => checkIfRealError()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                </svg>
              </button>

              <button disabled={inputStatus == "invalid address" || inputStatus == "zero address"} title={prepareChatConfigError ? "Enter a valid address" : "Create chat"} className={`
                p-1 max-w-xs
                bg-black
                hover:text-green-500 disabled:hover:text-red-500
                border-2 border-gray-500 hover:border-green-500 hover:disabled:border-red-500 
                rounded-sm hover:rounded-lg hover:disabled:rounded-none
                ease-in-out duration-300
              `}>
                <p className={isNewChatPreparing ? "hidden" : (isNewChatLoading ? "hidden" : "block")}> 
                  { inputStatus == "invalid address" && "Invalid address" }
                  { inputStatus == "room exists" && "Enter chat" }
                  { (inputStatus == "valid" || inputStatus == "zero address") && "New chat" }
                </p>

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`
                  w-6 h-6
                  animate-pulse
                  ${isNewChatPreparing ? "block" : "hidden"}
                `}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`
                  w-6 h-6
                  animate-spin
                  ${isNewChatLoading ? "block" : "hidden"}
                `}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>

              </button>

            </form>

          </div>

        </div>
      </div>

    </div>
  );
};

export default Home;
