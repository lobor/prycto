import "tailwindcss/tailwind.css";
import "../styles/nav.css";
import "../styles/globals.css";
import "simplebar/dist/simplebar.min.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { IntlProvider } from "react-intl";

import Nav from "../components/Nav";
import { TabsProvider } from "../context/tabs";
import { MarketsProvider } from "../context/market";
import { HideShowProvider } from "../context/hideShow";
import { MetamaskProvider } from "../context/metamask";
import { ExchangeProvider } from "../context/exchange";
import { useRouter } from "next/dist/client/router";
import * as trad from "../traductions";

const Apollo = dynamic(() => import("../components/Apollo"), { ssr: false });

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const showLayout = !["/login", "/register", "/"].includes(router.asPath);
  return (
    <IntlProvider
      messages={
        (trad as unknown as Record<string, Record<string, string>>)[
          router.locale || "en"
        ] || {}
      }
      locale={router.locale || "en"}
      defaultLocale={router.defaultLocale || "en"}
    >
      <Apollo>
        <ExchangeProvider>
          <MarketsProvider>
            <MetamaskProvider>
              <HideShowProvider>
                <TabsProvider
                  value={{
                    tabs: [
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
                  <Nav hide={!showLayout}>
                    <Component {...pageProps} />
                  </Nav>
                </TabsProvider>
              </HideShowProvider>
            </MetamaskProvider>
          </MarketsProvider>
        </ExchangeProvider>
      </Apollo>
    </IntlProvider>
  );
}
export default MyApp;
