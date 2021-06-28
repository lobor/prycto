import Head from "next/head";
import { useEffect, useRef } from "react";
import { useTabsContext, Tab } from "../context/tabs";

declare global {
  interface Window { TradingView: any; }
}

export default function Trade() {
  const { selected, tabs } = useTabsContext();
  console.log(tabs)
  const pair = tabs.find(({ key }) => key.toUpperCase() === selected.toUpperCase()) as Tab
  console.log(pair)
  useEffect(() => {
    if (pair && pair.exchange) {
      console.log('ici')
      new window.TradingView.widget({
        autosize: true,
        timezone: "Europe/Paris",
        locale: "fr",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        container_id: "container",
        width: 600,
        height: 600,
        symbol: `${pair.exchange.toUpperCase()}:${pair.label.replace('/', '').toUpperCase()}`,
        interval: "D",
        theme: "dark",
        style: "1",
        // "toolbar_bg": "#f1f3f6",
        hide_side_toolbar: false,
        save_image: false,
        // hideideas: true,
        studies: [
          "CCI@tv-basicstudies",
          "MACD@tv-basicstudies",
          "RSI@tv-basicstudies",
          "StochasticRSI@tv-basicstudies",
        ],
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
      });
    }
  }, [pair]);
  return (
    <>
      <Head>
        <title>Trade</title>
        <meta name="description" content="Trade from Binance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {pair && process.browser && (
        <div className="flex flex-1 flex-row h-full">
          <div className="flex-1" id="container" />
        </div>
      )}
      {!pair && <div>Pair introuvable</div>}
    </>
  );
}