import "tailwindcss/tailwind.css";
import "../styles/nav.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";

import Tabs from "../components/Tabs";
import Nav from "../components/Nav";
import { TabsProvider } from "../context/tabs";

import { SocketIOProvider } from "socketio-hooks";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SocketIOProvider url="/">
      <TabsProvider
        value={{
          tabs: [
            { label: "Positions", key: "position", canClose: false },
          ],
          selected: "position",
        }}
      >
        <Nav />
        <div className="flex flex-col flex-1">
          <Tabs />
          <div className="main-content flex-1 bg-gray-100">
            <div className="flex flex-wrap">
              <div className="w-full">
                <Component {...pageProps} />
              </div>
            </div>
          </div>
        </div>
      </TabsProvider>
    </SocketIOProvider>
  );
}
export default MyApp;
