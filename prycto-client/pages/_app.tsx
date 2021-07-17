import "tailwindcss/tailwind.css";
import "../styles/nav.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  split,
} from "@apollo/client";
import { IntlProvider } from "react-intl";

import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { HttpLink } from "@apollo/client/link/http";
import Nav from "../components/Nav";
import { TabsProvider } from "../context/tabs";
import { MarketsProvider } from "../context/market";
import { HideShowProvider } from "../context/hideShow";
import { ExchangeProvider } from "../context/exchange";
import { WebSocketLink } from "apollo-link-ws";
import { useRouter } from "next/dist/client/router";
import * as trad from "../traductions";

const setAuthorizationLink = setContext((request, previousContext) => ({
  headers: {
    exchangeId: localStorage.getItem("exchangeId"),
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
}));

const errorLink = onError((args) => {
  if (args.graphQLErrors) {
    const error = args.graphQLErrors[0] as { message?: { id?: string } };
    console.log(error);
    if (error.message === "notLogin") {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }
  }
  args.forward(args.operation);
});

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

const link = ApolloLink.from([errorLink, setAuthorizationLink, transportLink]);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const showLayout = !["/login", "/register"].includes(router.asPath);
  return (
    <IntlProvider
      messages={
        (trad as unknown as Record<string, Record<string, string>>)[router.locale || "en"] || {}
      }
      locale={router.locale || "en"}
      defaultLocale={router.defaultLocale || "en"}
    >
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
                {showLayout && <Nav />}
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
    </IntlProvider>
  );
}
export default MyApp;
