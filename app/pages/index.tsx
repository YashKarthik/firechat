import type { NextPage } from 'next';
import Head from 'next/head';
import { useRef } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useContractRead,
} from 'wagmi';
import { ethers } from 'ethers';

import * as dotenv from "dotenv";
dotenv.config();

import { getChat, createNewChat as testCreateNewChat } from '../utils/contract-functions';
import FIRECHAT_ABI from "../abis/Firechat.json";

const Home: NextPage = () => {
  const FIRECHAT_ADDRESS =  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const { address, isDisconnected } = useAccount({
    onConnect() {
      resetChatParams();
    },
  });
  const receiverRef = useRef(ethers.constants.AddressZero);

  const {
    config: chatConfig,
    error: createChatConfigError
  } = usePrepareContractWrite({
    address: FIRECHAT_ADDRESS,
    abi: FIRECHAT_ABI,
    functionName: "newChat",
    args: [
      address,
      receiverRef.current
    ],
  });

  const {
    write: createNewChat,
    reset: resetChatParams,
    error: createChatError
  } = useContractWrite(chatConfig);

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
              console.log("starting");
              const t = await testCreateNewChat(
                address || ethers.constants.AddressZero,
                receiverRef.current
              );
              console.log(t);
              return;

              if (!createNewChat) {
                console.log("disabled");
                console.log(createChatError);
                return;
              }
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
                onChange={async r => {
                  receiverRef.current = r.target.value;
                }} 
                className="
                  p-1
                  bg-black
                  border-2 border-gray-500
                  rounded-sm
                  min-w-[42ch]
              "/>

              <button
                className="
                  p-1 max-w-xs
                  bg-black
                  text-gray-400 hover:text-green-500
                  border-2 border-gray-500 hover:border-green-500 
                  disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:border-red-500
                  rounded-sm hover:rounded-lg
                  ease-in-out duration-300
              ">
                New Chat
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
