import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { darkTheme, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { arbitrum, goerli, mainnet, optimism, polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

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
        <Component {...pageProps} />

        <footer className="bg-neutral-950 text-green-500 mx-auto flex flex-row gap-3 text-sm font-mono">
          <a href="https://github.com/yashkarthik/firechat" rel="noopener noreferrer" target="_blank">
            Github
          </a>

          <a href="https://yashkarthik.xyz" rel="noopener noreferrer" target="_blank">
            Blog
          </a>

          <p>yashkarthik.eth</p>
        </footer>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
