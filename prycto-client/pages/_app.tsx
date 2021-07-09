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
  gql,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { HttpLink } from "@apollo/client/link/http";
import Nav from "../components/Nav";
import { TabsProvider } from "../context/tabs";
import { MarketsProvider } from "../context/market";
import { HideShowProvider } from "../context/hideShow";
import { ExchangeProvider } from "../context/exchange";
import { WebSocketLink } from "apollo-link-ws";

const setAuthorizationLink = setContext((request, previousContext) => ({
  headers: { exchangeId: localStorage.getItem("exchangeId") },
}));

const wsLink = process.browser
  ? new WebSocketLink({
      uri: process.env.NEXT_PUBLIC_URL_SOCKET as string,
      options: {
        reconnect: true,
      },
    })
  : null;

const httpGatewayLink = new HttpLink({
  fetch,
  uri: process.env.NEXT_PUBLIC_URL_API,
});

const transportLink =
  process.browser && wsLink
    ? split(
        // split based on operation type
        ({ query }) => {
          const [def] = query.definitions;
          return (
            def.kind === "OperationDefinition" &&
            def.operation === "subscription"
          );
        },
        wsLink as unknown as ApolloLink,
        httpGatewayLink
      )
    : httpGatewayLink;

const link = ApolloLink.from([setAuthorizationLink, transportLink]);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ExchangeProvider>
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
      </ExchangeProvider>
    </ApolloProvider>
  );
}
export default MyApp;
