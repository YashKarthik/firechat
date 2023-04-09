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
import { useDebounce } from '../utils/useDebounce';
import FIRECHAT_ABI from "../abis/Firechat.json";

const Home: NextPage = () => {

  const FIRECHAT_ADDRESS =  "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const [msgReceiverAddr, setMsgReceiverAddr] = useState(ethers.constants.AddressZero);
  const [chatHash, setChatHash] = useState<string>();
  const debouncedMsgReceiverAddr = useDebounce(msgReceiverAddr, 500); // 1/2 sec
  const { address } = useAccount({
    onConnect() {
      resetChatParams();
    },
  });

  const {
    config: chatConfig,
    isError: isPrepareChatConfigError,
    error: prepareChatConfigError
  } = usePrepareContractWrite({
    address: FIRECHAT_ADDRESS,
    abi: FIRECHAT_ABI,
    functionName: "newChat",
    args: [
      address,
      debouncedMsgReceiverAddr
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

      <div className="
        flex flex-col
        min-h-screen
        bg-neutral-950 text-white
      ">
        <div className="
          flex flex-col
          items-center
        ">

        <div className=" self-end m-3 ">
          <ConnectButton />
        </div>

          <h1 className=" text-3xl font-bold ">
            Welcome to Firechat
          </h1>

          <p className="mb-7">
            Burn <code>ether Ξ </code>
            by chatting on-chain🔥
          </p>

          <div>
            <p>
              Whom do you wanna chat with?
            </p>
            <form onSubmit={async e => {
              e.preventDefault();
              if (!address) return;

              if ((!createNewChat) || (!isPrepareChatConfigError)) {
                const room = await getChat(address, debouncedMsgReceiverAddr, FIRECHAT_ADDRESS);
                if (!room) {
                  console.log("----------------- ERROR -----------------"); // if room doesn't exist, but we still get some error, there's some error
                  console.log(isPrepareChatConfigError);
                  return;
                }

                setChatHash(room.chatHash);
                return room;
              }

              console.log("starting");
              console.log("Config:\n", chatConfig);
              createNewChat?.();
              }}
              className="
                flex flex-col md:flex-row gap-2
                items-center
            ">
              <input
                type="text"
                name="receiver"
                onChange={r => setMsgReceiverAddr(r.target.value)} 
                className="
                  p-1
                  bg-black
                  border-2 border-gray-500
                  rounded-sm
                  min-w-[42ch]
              "/>

              <button title={isPrepareChatConfigError ? "Enter a valid address" : "Create chat"} className={`
                p-1 max-w-xs
                bg-black
                hover:text-green-500 disabled:hover:text-red-500
                border-2 border-gray-500 hover:border-green-500 hover:disabled:border-red-500 
                rounded-sm hover:rounded-lg hover:disabled:rounded-none
                ease-in-out duration-300
              `}>
                <p className={isNewChatPreparing ? "hidden" : (isNewChatLoading ? "hidden" : "block")}> New Chat </p>

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

        {/*
        <footer className="self-center">
          <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
            Made with ❤️ by your frens at 🌈
          </a>
        </footer>
        */}
      </div>

    </div>
  );
};

export default Home;
