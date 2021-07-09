import { useQuery } from "@apollo/client";
import { useRouter } from "next/dist/client/router";
import Head from "next/head";
import { useEffect, useRef } from "react";
import { useMarket } from "../../context/market";
import { useTabsContext, Tab } from "../../context/tabs";
import HideShow from "../../components/HideShow";
import {
  GetPairsDocument,
  PositionDocument,
  PositionQuery,
} from "../../generated/graphql";
import round from "../../utils/round";

declare global {
  interface Window {
    TradingView: any;
  }
}

const view: Record<string, any> = {};

export default function Trade() {
  const { selected, tabs } = useTabsContext();
  const router = useRouter();
  const div = useRef<any>(null);
  const pair = tabs.find(
    ({ key }) => key.toUpperCase() === selected.toUpperCase()
  ) as Tab;
  const { _id } = router.query;
  const market = useMarket(pair && pair.label, {
    skip: !_id || !pair,
  }) as number;
  const { data } = useQuery<PositionQuery>(PositionDocument, {
    variables: { _id },
    skip: !_id,
  });
  useEffect(() => {
    if (pair && pair.exchange && process.browser) {
      if (!div.current) {
        div.current = new window.TradingView.widget({
          autosize: true,
          timezone: "Europe/Paris",
          locale: "fr",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          container_id: `container-${pair.label}`,
          // width: 600,
          // height: 600,
          symbol: `${pair.exchange.toUpperCase()}:${pair.label
            .replace("/", "")
            .toUpperCase()}`,
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
      } else if (pair) {
        div.current.options.symbol = `${pair.exchange.toUpperCase()}:${pair.label
          .replace("/", "")
          .toUpperCase()}`;
        div.current.reload();
      }
    }
  }, [pair, process.browser]);

  const [quote] = ((pair && pair.label) || "").split("/");
  const profit =
    (data &&
      market * (data.position.balance[quote] || 0) -
        (data.position.investment || 0)) ||
    0;
  return (
    <>
      <Head>
        <title>Trade</title>
        <meta name="description" content="Trade from Binance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-1 ">
        {pair && process.browser && (
          <div className="flex flex-1 flex-row h-full">
            <div className="flex-1" id={`container-${pair.label}`} />
          </div>
        )}
        {data && data.position && (
          <div className="w-1/6 text-gray-200 px-2">
            <div className="flex">
              {Object.keys(data.position.balance).map((key, i) => {
                return (
                  <div
                    className={`flex-1 ${i === 1 && "text-right"}`}
                    key={key}
                  >
                    {key}
                    <br />
                    <HideShow>{data.position.balance[key]}</HideShow>
                  </div>
                );
              })}
            </div>
            <div>
              Profit: <HideShow>{round(profit)}</HideShow>(
              {round((profit * 100) / (data.position.investment || 1))}%)
            </div>
            <div>
              Investment: <HideShow>{data.position.investment}</HideShow>
            </div>
            <div>Objectif: {data.position.objectif || 0}</div>
            <div>Market: {market}</div>
          </div>
        )}
      </div>
      {!pair && <div>Pair introuvable</div>}
    </>
  );
}
