import { useQuery } from "@apollo/client";
import { useRouter } from "next/dist/client/router";
import Head from "next/head";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useMarket } from "../../context/market";
import { useTabsContext, Tab } from "../../context/tabs";
import HideShow from "../../components/HideShow";
import {
  GetHistoryOrderBySymbolDocument,
  GetHistoryOrderBySymbolQuery,
  GetHistoryOrderBySymbolQueryVariables,
  PositionDocument,
  PositionQuery,
  PositionsDocument,
  PositionsQuery,
} from "../../generated/graphql";
import round from "../../utils/round";
import { AiOutlineDown, AiOutlineExpandAlt, AiOutlineUp } from "react-icons/ai";
import { useExchange } from "../../context/exchange";
import Loading from "../../components/Loading";
import Button from "../../components/Button";
import SimpleBarReact from "simplebar-react";
import { AutoSizer } from "react-virtualized";

declare global {
  interface Window {
    TradingView: any;
  }
}

const view: Record<string, any> = {};

export default function Trade() {
  const { exchangeId, exchange, loading: loadingExchange } = useExchange();
  const { selected, tabs, addTab, selectTab } = useTabsContext();
  const router = useRouter();
  const div = useRef<any>(null);
  const pair = tabs
    .filter(({ key }) => key.toLowerCase() !== "positions")
    .find(({ key }) => key.toUpperCase() === selected.toUpperCase()) as Tab;
  const { _id } = router.query;

  const market = useMarket(pair && (pair.label as string));
  const { data } = useQuery<PositionQuery>(PositionDocument, {
    variables: { _id },
    skip: !_id,
  });

  const { data: dataPositions, loading: loadingPosition } =
    useQuery<PositionsQuery>(PositionsDocument, {
      variables: { exchangeId },
      skip: loadingExchange || !exchangeId,
    });

  const [showHistory, setShowHistory] = useState(false);

  const { data: historyOrder } = useQuery<
    GetHistoryOrderBySymbolQuery,
    GetHistoryOrderBySymbolQueryVariables
  >(GetHistoryOrderBySymbolDocument, {
    variables: {
      symbol: pair && (pair.label as string),
      positionId: _id as string,
    },
    skip: !pair || !_id,
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
          symbol: `${pair.exchange.toUpperCase()}:${(pair.label as string)
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
        div.current.options.symbol = `${pair.exchange.toUpperCase()}:${(
          pair.label as string
        )
          .replace("/", "")
          .toUpperCase()}`;
        div.current.reload();
      }
    }
  }, [pair, process.browser]);

  const [quote] = ((pair && (pair.label as string)) || "").split("/");
  const profit =
    (data &&
      typeof market === "number" &&
      market * (data.position.balance[quote] || 0) -
        (data.position.investment || 0)) ||
    0;

  return (
    <>
      <Head>
        <title>Trade - Prycto</title>
        <meta name="description" content="Trade - Prycto" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-1 flex-col h-full">
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <SimpleBarReact
            className="hidden md:flex flex-col w-50"
            style={{ width: 200 }}
            forceVisible="y"
            autoHide={false}
          >
            {loadingPosition && (
              <div className="flex flex-1 items-center justify-center">
                <Loading />
              </div>
            )}
            {!loadingPosition &&
              dataPositions &&
              dataPositions.positions.map((position) => {
                const { _id, pair: symbol } = position;
                return (
                  <div className="py-2 px-6 flex-1 flex items-center">
                    <img
                      src={`/${exchange}.ico`}
                      className="inline-block mr-2"
                      width="20"
                      alt={exchange}
                    />
                    <Button
                      variant="link"
                      className="inline-block"
                      onClick={() => {
                        const pathname = `/tradingview/${_id}?pair=${symbol}`;
                        addTab({
                          key: symbol,
                          label: symbol,
                          canClose: true,
                          exchange,
                          href: pathname,
                        });
                        router.push(pathname);
                        selectTab(symbol);
                      }}
                    >
                      {symbol}
                    </Button>
                  </div>
                );
              })}
          </SimpleBarReact>
          {pair && process.browser && (
            <div className="flex flex-1 flex-row">
              <div className="flex-1" id={`container-${pair.label}`} />
            </div>
          )}
          {data && data.position && (
            <div className="flex-col md:w-1/6 flex order-first md:order-last">
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
                <div className="bg-gray-900 p-1 text-gray-400 mb-1 hidden md:flex">
                  <div className="flex-1">Investment:</div>
                  <div className="text-gray-200">
                    <HideShow>{data.position.investment}</HideShow>
                  </div>
                </div>
                <div className="bg-gray-900 p-1 text-gray-400 mb-1 hidden md:flex">
                  <div className="flex-1">Objectif:</div>
                  <div className="text-gray-200">
                    {data.position.objectif || 0}
                  </div>
                </div>
                <div className="bg-gray-900 p-1 text-gray-400 mb-1 hidden md:flex">
                  <div className="flex-1">Market:</div>
                  <div className="text-gray-200">
                    {Number(market) && market}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={`${showHistory ? "h-2/6" : ""}`}>
          <div className="h-full flex flex-col">
            <div className="bg-gray-900 text-gray-200 p-1 flex justify-between items-center">
              <span>History order</span>
              <button
                className="hover:bg-gray-800 border border-gray-800 p-2 focus:outline-none rounded-md"
                onClick={() => setShowHistory(!showHistory)}
              >
                <AiOutlineExpandAlt />
              </button>
            </div>
            {showHistory && (
              <>
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
                <div className="flex-1 overflow-hidden">
                  <AutoSizer>
                    {({ width, height }) => (
                      <SimpleBarReact
                      style={{ width, height }}
                      forceVisible="y"
                      autoHide={false}
                    >
                      {historyOrder?.getHistoryOrderBySymbol
                        .slice()
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((order) => {
                          return (
                            <div
                              key={`symbol${order.timestamp}`}
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
                    </SimpleBarReact>
                    )}
                  </AutoSizer>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {!pair && <div>Pair introuvable</div>}
    </>
  );
}
