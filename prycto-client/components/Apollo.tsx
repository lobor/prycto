import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  split,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { HttpLink } from "@apollo/client/link/http";
import { ReactNode } from "react";
import { WebSocketLink } from "apollo-link-ws";

const setAuthorizationLink = setContext((request, previousContext) => ({
  headers: {
    exchangeId: localStorage.getItem("exchangeId"),
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
}));

const errorLink = onError((args) => {
  if (args.graphQLErrors) {
    const error = args.graphQLErrors[0] as { message?: { id?: string } };
    if (
      error.message === "notLogin" &&
      !window.location.pathname.match(/(login|register)/i) &&
      window.location.pathname !== '/'
    ) {
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
        (wsLink as unknown) as ApolloLink,
        httpGatewayLink
      )
    : httpGatewayLink;

const linkLocal = ApolloLink.from([
  errorLink,
  setAuthorizationLink,
  transportLink,
]);

const cache = new InMemoryCache();

const client = new ApolloClient({
  cache,
  link: linkLocal,
});

interface ApolloCustomProps {
  children: ReactNode;
}

const ApolloCustom = ({ children }: ApolloCustomProps) => {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
};

export default ApolloCustom;
