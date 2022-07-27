import "../../styles/globals.css";
import "@fontsource/raleway";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import Layout from "../components/Layout";
import {
  WagmiConfig,
  createClient,
  configureChains,
  defaultChains,
  chain,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
const { chains, provider, webSocketProvider } = configureChains(
  [chain.ropsten],
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});
import type { NextPage } from "next";

const MyApp: NextPage<AppProps> = ({ Component, pageProps }) => {
  return (
    <WagmiConfig client={client}>
      <ChakraProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </WagmiConfig>
  );
};

export default MyApp;
