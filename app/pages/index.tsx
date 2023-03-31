import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import FirechatAbi from "../abis/Firechat.json";

const Home: NextPage = () => {

  const { isDisconnected } = useAccount();

  const { config, error } = usePrepareContractWrite({
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: FirechatAbi,
    functionName: "newChat",
    args: [
      "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
      "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955"
    ],
  });      

  const { write } = useContractWrite(config);

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

          <p className=" ">
            Burn <code>ether Ξ </code>
            by chatting on-chain🔥
          </p>


          { isDisconnected ? "first connect wallet" : (
            <button className='bg-blue-500' disabled={!write} onClick={() => write?.()}>New Chat</button>
          )}

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
