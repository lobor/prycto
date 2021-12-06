import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/dist/client/router";
import Head from "next/head";
import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMarket } from "../../context/market";
import { useTabsContext, Tab } from "../../context/tabs";
import HideShow from "../../components/HideShow";
import {
  EditPositionDocument,
  GetHistoryOrderBySymbolDocument,
  GetHistoryOrderBySymbolQuery,
  GetHistoryOrderBySymbolQueryVariables,
  PositionDocument,
  PositionQuery,
  PositionsDocument,
  PositionsQuery,
  PredictDocument,
  PredictQuery,
  PredictQueryVariables,
} from "../../generated/graphql";
import * as Yup from "yup";
import round from "../../utils/round";
import {
  AiOutlineCaretDown,
  AiOutlineCaretUp,
  AiOutlineExpandAlt,
  AiOutlineUp,
  AiOutlineWarning,
} from "react-icons/ai";
import { useExchange } from "../../context/exchange";
import SimpleBarReact from "simplebar-react";
import { AutoSizer } from "react-virtualized";
import QuickPositions from "../../components/QuickPositions";
import { FormattedMessage } from "react-intl";
import Loading from "../../components/Loading";
import Input from "../../components/Input";
import { useFormik } from "formik";

declare global {
  interface Window {
    TradingView: any;
  }
}

const view: Record<string, any> = {};

export default function Trade() {
  const { selected, tabs } = useTabsContext();
  const { exchangeId } = useExchange();
  const [editPosition, { loading }] = useMutation(EditPositionDocument);
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

  const formik = useFormik({
    validationSchema: Yup.object({
      objectif: Yup.number().required(),
      investment: Yup.number().required(),
    }),
    enableReinitialize: true,
    initialValues: {
      objectif: (data && data.position.objectif) || 0,
      investment: (data && data.position.investment) || 0,
    },
    onSubmit: (value) => {
      editPosition({ variables: { _id, ...value } });
    },
  });

  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (pair && pair.exchange && process.browser) {
      if (!div.current && document.getElementById(`container-${pair.label}`)) {
        div.current = new window.TradingView.widget({
          autosize: true,
          timezone: "Europe/Paris",
          locale: "fr",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          container_id: `container-${pair.label}`,
          symbol: `${pair.exchange.toUpperCase()}:${(pair.label as string)
            .replace("/", "")
            .toUpperCase()}`,
          interval: "D",
          theme: "dark",
          style: "1",
          hide_side_toolbar: false,
          save_image: false,
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
      } else if (pair && document.getElementById(`container-${pair.label}`)) {
        div.current.options.symbol = `${pair.exchange.toUpperCase()}:${(
          pair.label as string
        )
          .replace("/", "")
          .toUpperCase()}`;
        div.current.reload();
      }
      return () => {
        if (div.current) {
          div.current = null;
        }
      };
    }
  }, [pair && pair.label, process.browser]);

  const [quote] = ((pair && (pair.label as string)) || "").split("/");
  const profit =
    (data &&
      typeof market === "number" &&
      market * (data.position.balance[quote] || 0) -
        (data.position.investment || 0)) ||
    0;

  // const isUp =
  //   dataPredict && Number(dataPredict.predict.up) > 0.5 ? true : false;
  // const validPredict =
  //   dataPredict &&
  //   dataPredict.predict.up !== 0 &&
  //   dataPredict.predict.down !== 0;

  const quickPositionsRender = useMemo(() => {
    return <QuickPositions />;
  }, []);

  const form = useRef<HTMLFormElement>(null);

  return (
    <>
      <Head>
        <title>Trade - Prycto</title>
        <meta name="description" content="Trade - Prycto" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-1 flex-col h-full">
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {quickPositionsRender}
          {pair && process.browser && (
            <div className="flex flex-1 flex-row pb-1">
              <div className="flex-1" id={`container-${pair.label}`} />
            </div>
          )}
          {data && data.position && (
            <div className="flex-col md:w-1/6 flex order-first md:order-last">
              <form ref={form} onSubmit={formik.handleSubmit}>
                <div className="text-gray-200 px-1">
                  <div className="flex mb-1 bg-gray-900 p-1 text-gray-400 rounded-md">
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
                  <div className="bg-gray-900 p-1 text-gray-400 mb-1 flex rounded-md">
                    <div className="flex-1">
                      <FormattedMessage id="profit" />:
                    </div>
                    <div
                      className={profit < 0 ? "text-red-600" : "text-green-500"}
                    >
                      <HideShow>{round(profit)}</HideShow>(
                      {round(
                        data.position.investment > 0
                          ? (profit * 100) / (data.position.investment || 1)
                          : 0
                      )}
                      %)
                    </div>
                  </div>
                  <div className="bg-gray-900 p-1 text-gray-400 mb-1 flex rounded-md">
                    <div className="flex-1">
                      <FormattedMessage id="investment" />:
                    </div>
                    <div className="text-gray-200">
                      <HideShow>
                        <Input
                          className="text-right"
                          name="investment"
                          type="number"
                          value={formik.values.investment}
                          error={formik.errors.investment}
                          onChange={formik.handleChange}
                          onBlur={() => {
                            if (formik.isValid && form.current) {
                              formik.handleSubmit({
                                target: form.current,
                              } as any);
                            }
                          }}
                        />
                      </HideShow>
                    </div>
                  </div>
                  <div className="bg-gray-900 p-1 text-gray-400 mb-1 flex rounded-md items-center">
                    <div className="flex-1">
                      <FormattedMessage id="goal" />:
                    </div>
                    <div className="text-gray-200">
                      <Input
                        className="text-right"
                        name="objectif"
                        type="number"
                        value={formik.values.objectif}
                        error={formik.errors.objectif}
                        onChange={formik.handleChange}
                        onBlur={() => {
                          if (formik.isValid && form.current) {
                            formik.handleSubmit({
                              target: form.current,
                            } as any);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-900 p-1 text-gray-400 mb-1 hidden md:flex rounded-md">
                    <div className="flex-1">
                      <FormattedMessage id="market" />:
                    </div>
                    <div className="text-gray-200">
                      {Number(market) && market}
                    </div>
                  </div>
                </div>
              </form>
              {/* <div className="">
                <div>Predict</div>
                <div>
                  {loadingPredict && <Loading />}
                  {!loadingPredict && dataPredict && (
                    <div>
                      <div
                        className={`${
                          (validPredict && (isUp ? "text-green-500" : "text-red-600")) || "text-yellow-600"
                        } text-8xl flex items-center flex-col`}
                      >
                        {validPredict && (
                            <>
                              {isUp ? (
                                <AiOutlineCaretUp />
                              ) : (
                                <AiOutlineCaretDown />
                              )}
                            </>
                          )}
                        {!validPredict && (
                            <AiOutlineWarning />
                          )}
                      </div>
                      up: {dataPredict.predict.up}
                      <br />
                      down: {dataPredict.predict.down}
                    </div>
                  )}
                </div>
              </div> */}
            </div>
          )}
        </div>
        <div className={`${showHistory ? "h-2/6" : ""}`}>
          <div className="h-full flex flex-col">
            <div className="bg-gray-900 text-gray-200 p-1 flex justify-between items-center">
              <span>
                <FormattedMessage id="history.title" />
              </span>
              <button
                className="hover:bg-gray-800 border border-gray-800 p-2 focus:outline-none rounded-md"
                onClick={() => setShowHistory(!showHistory)}
              >
                <AiOutlineExpandAlt />
              </button>
            </div>
            {showHistory && (
              <>
                <div className="hidden md:flex flex-row bg-gray-900 text-gray-200 p-2">
                  <div className="flex-1">
                    <FormattedMessage id="history.date" />
                  </div>
                  <div className="flex-1">
                    <FormattedMessage id="history.symbol" />
                  </div>
                  <div className="flex-1">
                    <FormattedMessage id="history.price" />
                  </div>
                  <div className="flex-1">
                    <FormattedMessage id="history.amount" />
                  </div>
                  <div className="flex-1">
                    <FormattedMessage id="history.cost" />
                  </div>
                  <div className="flex-1">
                    <FormattedMessage id="history.type" />
                  </div>
                  <div className="flex-1">
                    <FormattedMessage id="history.side" />
                  </div>
                  <div className="flex-1">
                    <FormattedMessage id="history.status" />
                  </div>
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
                                className={`flex-col md:flex-row hover:bg-gray-900 text-gray-200 border-b border-gray-900 flex md:items-center p-1 ${
                                  order.status === "canceled" && "opacity-50"
                                }`}
                              >
                                <div className="flex-1 flex justify-between">
                                  <span className="md:hidden">
                                    <FormattedMessage id="history.date" />
                                  </span>
                                  <span>
                                    {format(
                                      order.timestamp,
                                      "MM/dd/yyyy HH:mm:ss"
                                    )}
                                  </span>
                                </div>
                                <div className="flex-1 flex justify-between">
                                  <span className="md:hidden">
                                    <FormattedMessage id="history.symbol" />
                                  </span>
                                  <span>{order.symbol}</span>
                                </div>
                                <div className="flex-1 flex justify-between">
                                  <span className="md:hidden">
                                    <FormattedMessage id="history.price" />
                                  </span>
                                  <span>{order.price}</span>
                                </div>
                                <div className="flex-1 flex justify-between">
                                  <span className="md:hidden">
                                    <FormattedMessage id="history.amount" />
                                  </span>
                                  <span>
                                    <HideShow>{order.amount}</HideShow>
                                  </span>
                                </div>
                                <div className="flex-1 flex justify-between">
                                  <span className="md:hidden">
                                    <FormattedMessage id="history.cost" />
                                  </span>
                                  <span>
                                    <HideShow>{order.cost}</HideShow>
                                  </span>
                                </div>
                                <div className="flex-1 flex justify-between">
                                  <span className="md:hidden">
                                    <FormattedMessage id="history.type" />
                                  </span>
                                  <span>
                                    <FormattedMessage
                                      id={`history.${order.type}`}
                                    />
                                  </span>
                                </div>
                                <div
                                  className={`flex-1  flex justify-between ${
                                    order.side === "sell"
                                      ? "text-red-600"
                                      : "text-green-500"
                                  }`}
                                >
                                  <span className="md:hidden">
                                    <FormattedMessage id="history.side" />
                                  </span>
                                  <span>
                                    <FormattedMessage
                                      id={`history.${order.side}`}
                                    />
                                  </span>
                                </div>
                                <div className="flex-1 flex justify-between">
                                  <span className="md:hidden">
                                    <FormattedMessage id="history.status" />
                                  </span>
                                  <span>
                                    <FormattedMessage
                                      id={`history.${order.status}`}
                                    />
                                  </span>
                                </div>
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
