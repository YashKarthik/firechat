import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { darkTheme, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { arbitrum, goerli, mainnet, optimism, polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import Link from 'next/link';

const { chains, provider, webSocketProvider } = configureChains(
  [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    {
      id: 31337,
      name: "Localhost",
      network: "localhost",
      nativeCurrency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH",
    },
    rpcUrls: {
        default: {
            http: ["http://127.0.0.1:8545"],
        },
        public: {
            http: ["http://127.0.0.1:8545"],
        },
    },
},
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : []),
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'RainbowKit App',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} coolMode={true} theme={darkTheme({
        accentColor: "#22c55e",
        accentColorForeground: "white",
        overlayBlur: "small",
        borderRadius: "medium"
      })}>
        <div className='min-h-screen min-w-max bg-neutral-950 text-white'>
          <Component {...pageProps} />

          <footer className="absolute bottom-0 px-2 bg-neutral-950 text-green-500 flex flex-row gap-3 text-sm font-mono w-full">
            <Link href="/about">
              About
            </Link>

            <a href="https://github.com/yashkarthik/firechat" rel="noopener noreferrer" target="_blank">
              Github
            </a>

            <a href="https://yashkarthik.xyz" rel="noopener noreferrer" target="_blank">
              Blog
            </a>

            <button type="button" className='absolute right-0 mr-2' onClick={() => navigator.clipboard.writeText("yashkarthik.eth")}>
              yashkarthik.eth
            </button>
          </footer>
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
