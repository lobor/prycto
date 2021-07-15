import { useQuery } from "@apollo/client";
import { useRouter } from "next/dist/client/router";
import Head from "next/head";
import { format } from "date-fns";
import { useEffect, useRef } from "react";
import { useMarket } from "../../context/market";
import { useTabsContext, Tab } from "../../context/tabs";
import HideShow from "../../components/HideShow";
import {
  GetHistoryOrderBySymbolDocument,
  GetHistoryOrderBySymbolQuery,
  GetHistoryOrderBySymbolQueryVariables,
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
  const pair = tabs
    .filter(({ key }) => key.toLowerCase() !== "positions")
    .find(({ key }) => key.toUpperCase() === selected.toUpperCase()) as Tab;
  const { _id } = router.query;
  const market = useMarket(pair && pair.label, {
    skip: !_id || !pair,
  }) as number;
  const { data } = useQuery<PositionQuery>(PositionDocument, {
    variables: { _id },
    skip: !_id,
  });

  const { data: historyOrder } = useQuery<
    GetHistoryOrderBySymbolQuery,
    GetHistoryOrderBySymbolQueryVariables
  >(GetHistoryOrderBySymbolDocument, {
    variables: { symbol: pair && pair.label },
    skip: !pair,
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
          popup_height: "600",
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
      <div className="flex flex-1 flex-col h-full overflow-auto">
        <div className="flex flex-row h-4/6 ">
          {pair && process.browser && (
            <div className="flex flex-1 flex-row h-full">
              <div className="flex-1" id={`container-${pair.label}`} />
            </div>
          )}
          {data && data.position && (
            <div className="flex-col w-1/6 hidden md:flex ">
              <div className="text-gray-200 px-1">
                <div className="flex mb-1 bg-gray-900 p-1 text-gray-400">
                  {Object.keys(data.position.balance).map((key, i) => {
                    return (
                      <div
                        className={`flex-1 ${i === 1 && "text-right"}`}
                        key={key}
                      >
                        <span className="text-gray-200">
                          <HideShow>
                            {round(data.position.balance[key], 10)}
                          </HideShow>
                        </span>{" "}
                        {key}
                      </div>
                    );
                  })}
                </div>
                <div className="bg-gray-900 p-1 text-gray-400 mb-1 flex">
                  <div className="flex-1">Profit:</div>
                  <div
                    className={profit < 0 ? "text-red-600" : "text-green-500"}
                  >
                    <HideShow>{round(profit)}</HideShow>(
                    {round((profit * 100) / (data.position.investment || 1))}%)
                  </div>
                </div>
                <div className="bg-gray-900 p-1 text-gray-400 mb-1 flex">
                  <div className="flex-1">Investment:</div>
                  <div className="text-gray-200">
                    <HideShow>{data.position.investment}</HideShow>
                  </div>
                </div>
                <div className="bg-gray-900 p-1 text-gray-400 mb-1 flex">
                  <div className="flex-1">Objectif:</div>
                  <div className="text-gray-200">
                    {data.position.objectif || 0}
                  </div>
                </div>
                <div className="bg-gray-900 p-1 text-gray-400 mb-1 flex">
                  <div className="flex-1">Market:</div>
                  <div className="text-gray-200">{market}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="h-2/6">
          <div className="h-full flex flex-col">
            <div className="bg-gray-900 text-gray-200 p-1">History order</div>
            <div className="flex flex-row bg-gray-900 text-gray-200 p-2">
              <div className="flex-1">Date</div>
              <div className="flex-1">Symbol</div>
              <div className="flex-1">Price</div>
              <div className="flex-1">Amount</div>
              <div className="flex-1">Cost</div>
              <div className="flex-1">Type</div>
              <div className="flex-1">Side</div>
              <div className="flex-1">Status</div>
            </div>
            <div className="overflow-auto flex-1">
              {historyOrder?.getHistoryOrderBySymbol
                .slice()
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((order) => {
                  return (
                    <div
                      key={order.symbol}
                      className="flex-row hover:bg-gray-900 text-gray-200 border-b border-gray-900 flex items-center p-1"
                    >
                      <div className="flex-1">
                        {format(order.timestamp, "MM/dd/yyyy HH:mm:ss")}
                      </div>
                      <div className="flex-1">{order.symbol}</div>
                      <div className="flex-1">{order.price}</div>
                      <div className="flex-1">
                        <HideShow>{order.amount}</HideShow>
                      </div>
                      <div className="flex-1">
                        <HideShow>{order.cost}</HideShow>
                      </div>
                      <div className="flex-1">{order.type}</div>
                      <div
                        className={`flex-1 ${
                          order.side === "sell"
                            ? "text-red-600"
                            : "text-green-500"
                        }`}
                      >
                        {order.side}
                      </div>
                      <div className="flex-1">{order.status}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      {!pair && <div>Pair introuvable</div>}
    </>
  );
}
