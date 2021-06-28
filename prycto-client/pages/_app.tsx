import "tailwindcss/tailwind.css";
import "../styles/nav.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  useQuery,
  gql
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { HttpLink } from "@apollo/client/link/http";
import Nav from "../components/Nav";
import { TabsProvider } from "../context/tabs";
import { MarketsProvider } from "../context/market";
import { HideShowProvider } from "../context/hideShow";
import SocketIOProvider from "../providers/Socket";

const setAuthorizationLink = setContext((request, previousContext) => ({
  headers: {exchangeId: localStorage.getItem('exchangeId')}
}));

const httpGatewayLink = new HttpLink({
  fetch,
  uri: `http://192.168.1.70:3002/graphql`,
});


const link = ApolloLink.from([setAuthorizationLink, httpGatewayLink]);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <SocketIOProvider url="/">
        <MarketsProvider>
          <HideShowProvider>
            <TabsProvider
              value={{
                tabs: [
                  // { label: "Dashboard", key: "dashboard", canClose: false, href: "/dashboard" },
                  {
                    label: "Positions",
                    key: "positions",
                    canClose: false,
                    href: "/positions",
                  },
                ],
                selected: "positions",
              }}
            >
              <Nav />
              <div className="flex flex-col flex-1">
                <div className="main-content flex-1 bg-gray-800 flex flex-wrap h-full w-full getDiv flex-col">
                  <Component {...pageProps} />
                </div>
              </div>
            </TabsProvider>
          </HideShowProvider>
        </MarketsProvider>
      </SocketIOProvider>
    </ApolloProvider>
  );
}
export default MyApp;
