import { useRouter } from "next/dist/client/router";
import Button from "./Button";
import Input from "./Input";
import classnames from "tailwindcss-classnames";
import { useTabsContext } from "../context/tabs";
import round from "../utils/round";
import HideShow from "./HideShow";
import { useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  ExchangeByIdDocument,
  ExchangeByIdQuery,
  PositionsDocument,
  RemovePositionDocument,
  RemovePositionMutation,
  RemovePositionMutationVariables,
  Position,
  EditPositionDocument,
  SyncPositionsDocument,
  GetHistoryBySymbolDocument,
  GetHistoryBySymbolQuery,
  GetHistoryOrderBySymbolQuery,
  GetHistoryOrderBySymbolQueryVariables,
  GetHistoryOrderBySymbolDocument,
} from "../generated/graphql";
import { VictoryChart, VictoryAxis, VictoryArea } from "victory";
import { useExchange } from "../context/exchange";
import {
  AiOutlineCaretDown,
  AiOutlineCaretUp,
  AiOutlineDash,
  AiOutlineDelete,
  AiOutlineReload,
} from "react-icons/ai";
import { ImSpinner5 } from "react-icons/im";

export interface ItemPositionProps {
  position: Position & {
    market: number;
    profit: number;
    profitPercent: number;
    total: number;
    gain: number;
  };
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const ItemPosition = ({ position }: ItemPositionProps) => {
  const {
    _id,
    pair: symbol,
    investment,
    profit = 0,
    objectif,
    market,
    total,
    predict,
    exchange,
    gain,
  } = position;
  const { data: exchangeData } = useQuery<ExchangeByIdQuery>(
    ExchangeByIdDocument,
    { variables: { _id: position.exchangeId } }
  );
  const [isEditObjectif, setEditObjectif] = useState(false);
  const router = useRouter();
  const [editPosition, { data, loading }] = useMutation(EditPositionDocument, {
    onCompleted: () => {
      setEditObjectif(false);
    },
  });
  const [getPositions] = useLazyQuery(PositionsDocument, {
    fetchPolicy: "network-only",
    variables: { exchangeId: position.exchangeId },
  });
  const [updatePosition] = useMutation(SyncPositionsDocument, {
    onCompleted: () => {
      getPositions({ variables: { exchangeId: position.exchangeId } });
    },
  });

  const { data: dataHistory } = useQuery<GetHistoryBySymbolQuery>(
    GetHistoryBySymbolDocument,
    { variables: { symbol, limit: 30 } }
  );
  const [removePosition] = useMutation<
    RemovePositionMutation,
    RemovePositionMutationVariables
  >(RemovePositionDocument, {
    onCompleted: () => {
      getPositions();
    },
  });
  const { addTab, selectTab } = useTabsContext();
  const handleEditObjectif = () => {
    setEditObjectif(!isEditObjectif);
  };

  const formik = useFormik({
    validationSchema: Yup.object({
      objectif: Yup.number().required(),
    }),
    initialValues: {
      objectif: objectif || 0,
    },
    onSubmit: (value) => {
      editPosition({ variables: { _id, ...value } });
    },
  });

  const handleTrendingview = () => {
    if (exchangeData) {
      const pathname = `/tradingview/${_id}?pair=${symbol}`;
      addTab({
        key: symbol,
        label: symbol,
        canClose: true,
        exchange: exchangeData.exchangeById.exchange,
        href: pathname,
      });
      router.push(pathname);
      selectTab(symbol);
    }
  };

  const { min, max } = useMemo(() => {
    return ((dataHistory && dataHistory.getHistoryBySymbol) || []).reduce(
      (acc, history) => {
        if (acc.min > history.close || acc.min === 0) {
          acc.min = history.close;
        }
        if (acc.max < history.close) {
          acc.max = history.close;
        }
        return acc;
      },
      { min: 0, max: 0 }
    );
  }, [dataHistory]);

  const chart = useMemo(() => {
    return !dataHistory ? (
      <div
        className="flex justify-center items-center"
        style={{ width: "80px", height: "40px" }}
      >
        <ImSpinner5 className="animate-spin" />
      </div>
    ) : (
      <div>
        <VictoryChart
          width={1}
          height={50}
          style={{
            parent: { width: "80px", height: "40px" },
          }}
          // scale={{ x: "time" }}
          // domainPadding={{ x: 0, y: 0 }}
          minDomain={{ y: min }}
        >
          <VictoryArea
            style={{
              data: { stroke: "rgb(59, 130, 246)" },
            }}
            data={[
              ...((dataHistory && dataHistory.getHistoryBySymbol) || []),
              { timestamp: Date.now(), close: market },
            ]}
            x="timestamp"
            y="close"
          />
          <VictoryAxis
            invertAxis
            tickFormat={() => ""}
            style={{
              axisLabel: { color: "transparent" },
              axis: { stroke: "none" },
            }}
          />
          <VictoryAxis
            dependentAxis
            invertAxis
            tickFormat={() => ""}
            style={{
              axisLabel: { color: "transparent" },
              axis: { stroke: "none" },
            }}
          />
        </VictoryChart>
      </div>
    );
  }, [dataHistory, market]);
  const isUp = predict.up > predict.down;
  const isUnknown = predict.up === predict.down;
  return useMemo(
    () => (
      <div
        key={`itemPosition${symbol}`}
        className={`${
          objectif && objectif <= market ? "bg-green-900" : ""
        } hover:bg-gray-900 text-gray-200 border-b border-gray-900 flex items-center`}
      >
        <div className="py-2 md:px-6 flex-1 flex items-center">
          <img
            src={`/${exchange}.ico`}
            className="inline-block mr-2"
            width="20"
            alt={exchange}
          />
          <Button
            variant="link"
            className="inline-block"
            onClick={handleTrendingview}
          >
            {symbol}
          </Button>
        </div>
        {/* Char column  */}
        {chart}
        {/* Amount column  */}
        <div className="py-2 md:px-6 hidden md:block flex-1">
          <HideShow>{round(total, 7)}</HideShow>
        </div>
        {/* Average price column  */}
        <div className="py-2 md:px-6 hidden md:block flex-1">
          <HideShow>
            {round(total === 0 || investment < 0 ? 0 : investment / total, 8)}
          </HideShow>
        </div>
        {/* Market column  */}
        <div className="py-2 md:px-6 hidden md:block flex-1">
          {round(market, 8)}
        </div>
        {/* Investment column  */}
        <div className="py-2 md:px-6 hidden md:block flex-1">
          <HideShow>{round(investment > 0 ? investment : 0)}</HideShow> /{" "}
          <span className="text-gray-400">
            <HideShow>{round(investment + profit)}</HideShow>
          </span>
        </div>
        {/* Profit column  */}
        <div
          className={classnames(
            "py-2",
            "px-6",
            "flex-1",
            "flex",
            "justify-between",
            {
              "text-green-500": profit >= 0,
              "text-red-600": profit < 0,
            }
          )}
        >
          <div>
            <HideShow>
              {round(investment > 0 ? profit : profit + investment)}
            </HideShow>
          </div>
          <div>{round(investment > 0 ? (profit * 100) / investment : 0)}%</div>
        </div>
        {/* Gain column  */}
        <div className="py-2 md:px-6 hidden md:block flex-1 text-center">
          <HideShow>{round(gain)}</HideShow>
        </div>
        <div
          className="py-2 md:px-6 hidden md:block w-28 cursor-pointer text-center"
          onClick={handleEditObjectif}
        >
          {objectif || 0}
        </div>
        {/* <div
          className={`py-2 px-6 w-40 hidden md:flex md:justify-center ${
            isUnknown
              ? "text-yellow-500"
              : isUp
              ? "text-green-500"
              : "text-red-600"
          }`}
        >
          {isUnknown ? (
            <AiOutlineDash />
          ) : isUp ? (
            <AiOutlineCaretUp />
          ) : (
            <AiOutlineCaretDown />
          )}
        </div> */}
        <div className="py-2 md:px-6 text-center w-60 hidden md:block">
          <Button
            onClick={() => {
              removePosition({ variables: { _id } });
            }}
          >
            <AiOutlineDelete />
          </Button>
          {/* <Button
          className="ml-2"
          onClick={() => {
            // setEditPositionShowing(position);
          }}
        >
          Edit
        </Button> */}
          <Button
            className="ml-2"
            onClick={() => {
              updatePosition({
                variables: {
                  _id,
                },
              });
            }}
          >
            <AiOutlineReload />
          </Button>
        </div>
      </div>
    ),
    [market, isEditObjectif, formik]
  );
};

export default ItemPosition;
