import classnames from "tailwindcss-classnames";
import { useEffect, useRef, useState } from "react";
// import { useEmit } from "socketio-hooks";
import useSocket from "../hooks/useSocket";
import useEmit from "../hooks/useEmit";
import { useTabsContext } from "../context/tabs";
import Button from "../components/Button";
import AddPosition from "../components/AddPosition";
import EditPosition from "../components/EditPosition";
import { useRouter } from "next/dist/client/router";
import { format } from "date-fns";
import {
  AddPositionParams,
  RemovePositionParams,
  GetPositionResponse,
  EditPositionParams,
} from "../type";

const round = (num: number, decimal = 2) => {
  let decimalFactor = 1;
  for (let i = 0; i < decimal; i++) {
    decimalFactor *= 10;
  }
  return Math.round((num + Number.EPSILON) * decimalFactor) / decimalFactor;
};

const Positions = () => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const router = useRouter();
  const [initialState, setInitialState] = useState();
  const [addPosisitonShowing, setAddPositionShowing] = useState(false);
  const [editPositionShowing, setEditPositionShowing] = useState();
  const { addTab, selectTab } = useTabsContext();

  const [removePosition] = useEmit<RemovePositionParams>("removePosition");
  const [addPosition] = useEmit<AddPositionParams>("addPosition");
  const [editPosition] = useEmit<EditPositionParams>("editPosition");
  const [
    updatePosition,
    { data: syncPositions, loading: loadingSyncPosition },
  ] = useEmit("syncPositions");

  const { data: positions, refetch: refetchPositions } =
    useSocket<GetPositionResponse[]>("getPositions");
  const {
    data: markets,
    loading,
    refetch,
  } = useSocket<{ [key: string]: number }>("getMarkets", {
    computeData: (state, data) => {
      return { ...(state || {}), ...data };
    },
    initialState,
  });

  useEffect(() => {
    if (syncPositions && !loadingSyncPosition) {
      refetchPositions();
    }
  }, [loadingSyncPosition, syncPositions]);

  useEffect(() => {
    if (!loading && markets && !timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = undefined;
        }
        refetch();
      }, 2000);
    }
  }, [loading, markets]);
  useEffect(() => {
    const marketStorage = localStorage.getItem("markets");
    if (marketStorage) {
      try {
        setInitialState(JSON.parse(marketStorage));
      } catch (e) {
        console.warn("Local storage markets can't read");
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (markets) {
        localStorage.setItem("markets", JSON.stringify(markets));
      }
    };
  }, [markets]);

  const { globalInvestment, globalProfit } = (positions || []).reduce(
    (acc, position) => {
      const market = (markets && markets[position.pair]) || 0;
      const profit = market * (position.available + (position.locked || 0));
      acc.globalProfit += profit;
      acc.globalInvestment += position.investment;
      return acc;
    },
    { globalInvestment: 0, globalProfit: 0 }
  );

  return (
    <>
      {addPosisitonShowing && (
        <AddPosition
          onSubmit={(e) => {
            addPosition(e);
            setAddPositionShowing(false);
          }}
          onCancel={() => {
            setAddPositionShowing(false);
          }}
        />
      )}
      {editPositionShowing && (
        <EditPosition
          position={editPositionShowing}
          onSubmit={(e) => {
            editPosition({
              exchangeId: e.exchangeId,
              available: e.available,
              locked: e.locked || 0,
              positionId: e._id,
            });
            setEditPositionShowing(undefined);
          }}
          onCancel={() => {
            setEditPositionShowing(undefined);
          }}
        />
      )}
      <div className="flex justify-between mt-6 mr-6 text-gray-200">
        <span className="ml-6">
          {round(globalInvestment)}BUSD /{" "}
          <span
            className={classnames("inline-block", "w-28", {
              "text-red-600": globalInvestment >= globalProfit,
              "text-green-500": globalInvestment < globalProfit,
            })}
          >
            {round(globalProfit)}BUSD
          </span>{" "}
          ≈ {round(globalInvestment * 0.82)}€ /{" "}
          <span
            className={classnames("inline-block", "w-14", {
              "text-red-600": globalInvestment >= globalProfit,
              "text-green-500": globalInvestment < globalProfit,
            })}
          >
            {round(globalProfit * 0.82)}€
          </span>
          <br />
          <span
            className={classnames({
              "text-red-600": globalProfit - globalInvestment < 0,
              "text-green-500": globalProfit - globalInvestment >= 0,
            })}
          >
            {round(globalProfit - globalInvestment)}BUSD
          </span>
          {" ≈ "}
          <span
            className={classnames({
              "text-red-600": globalProfit - globalInvestment < 0,
              "text-green-500": globalProfit - globalInvestment >= 0,
            })}
          >
            {round((globalProfit - globalInvestment) * 0.82)}€
          </span>{" "}
          (
          <span
            className={classnames({
              "text-red-600": globalProfit - globalInvestment < 0,
              "text-green-500": globalProfit - globalInvestment >= 0,
            })}
          >
            {round(((globalProfit - globalInvestment) * 100) / globalProfit)}%
          </span>
          )
        </span>
        <br />
        {format(new Date(), "HH:mm:ss")}
      </div>
      <div className="shadow-md mt-6 block md:hidden">
        {positions &&
          positions.map((position) => {
            const market = (markets && markets[position.pair]) || 0;
            const total = position.available + (position.locked || 0);
            const profit = market * total - position.investment;
            return (
              <div
                key={position.pair}
                className="mb-3 mx-2 bg-gray-700 text-gray-200"
              >
                <div className="py-2 px-6 border-b border-gray-400">
                  <img
                    src={`${position.exchange}.ico`}
                    alt={position.exchange}
                    className="inline mr-1 align-text-top"
                    style={{ height: "16px" }}
                  />
                  <Button
                    variant="link"
                    onClick={() => {
                      addTab({
                        key: position.pair,
                        label: position.pair,
                        canClose: true,
                        href: "/tradingview",
                      });
                      selectTab(position.pair);
                    }}
                  >
                    {position.pair}
                  </Button>
                </div>
                <div className="py-2 px-6 flex justify-between">
                  <span>
                    {round(position.investment)} /{" "}
                    <span className="text-gray-400">
                      {round(market * total)}
                    </span>
                  </span>
                  <span
                    className={classnames({
                      "text-green-500": profit >= 0,
                      "text-red-600": profit < 0,
                    })}
                  >
                    {round(profit)} (
                    {position.investment !== 0
                      ? round((profit * 100) / position.investment)
                      : 0}
                    %)
                  </span>
                </div>
              </div>
            );
          })}
      </div>
      <div className="shadow-md mt-6 hidden md:block">
        <table className="text-left w-full border-collapse">
          <thead>
            <tr className="bg-gray-900 text-gray-200">
              <th className="py-4 px-6 font-bold uppercase text-sm">Paires</th>
              <th className="py-4 px-6 font-bold uppercase text-sm">Amount</th>
              <th className="py-4 px-6 font-bold uppercase text-sm">
                Price bought
              </th>
              <th className="py-4 px-6 font-bold uppercase text-sm">Market</th>
              <th className="py-4 px-6 font-bold uppercase text-sm">
                Investment
              </th>
              <th className="py-4 px-6 font-bold uppercase text-sm">Profit</th>
              <th className="py-4 px-6 font-bold uppercase text-sm text-center">
                <Button
                  variant="validate"
                  onClick={() => {
                    setAddPositionShowing(true);
                  }}
                >
                  Add
                </Button>
              </th>
            </tr>
          </thead>
          {positions && (
            <tbody>
              {positions.map((position) => {
                const market = (markets && markets[position.pair]) || 0;
                const total =
                  Number(position.available) + (Number(position.locked) || 0);
                const profit = market * total - position.investment;
                return (
                  <tr
                    key={position.pair}
                    className="hover:bg-gray-900 text-gray-200 border-b border-gray-900"
                  >
                    <td className="py-2 px-6 ">
                      <img
                        src={`${position.exchange}.ico`}
                        alt={position.exchange}
                        className="inline mr-1 align-text-top"
                        style={{ height: "16px" }}
                      />
                      <Button
                        variant="link"
                        onClick={() => {
                          addTab({
                            key: position.pair,
                            label: position.pair,
                            canClose: true,
                            exchange: position.exchange,
                            href: `/tradingview?pair=${position.pair}`,
                          });
                          router.push(`/tradingview?pair=${position.pair}`);
                          selectTab(position.pair);
                        }}
                      >
                        {position.pair}
                      </Button>
                    </td>
                    <td className="py-2 px-6">{total}</td>
                    <td className="py-2 px-6">
                      {round(total === 0 ? 0 : position.investment / total, 8)}
                    </td>
                    <td className="py-2 px-6">{market}</td>
                    <td className="py-2 px-6">
                      {round(position.investment)} /{" "}
                      <span className="text-gray-400">
                        {round(market * total)}
                      </span>
                    </td>
                    <td
                      className={classnames("py-2", "px-6", {
                        "text-green-500": profit >= 0,
                        "text-red-600": profit < 0,
                      })}
                    >
                      {round(profit)} (
                      {position.investment !== 0
                        ? round((profit * 100) / position.investment)
                        : 0}
                      %)
                    </td>
                    <td className="py-2 px-6 text-center">
                      <Button
                        onClick={() => {
                          removePosition(position._id);
                        }}
                      >
                        Remove
                      </Button>
                      <Button
                        className="ml-2"
                        onClick={() => {
                          setEditPositionShowing(position);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        className="ml-2"
                        onClick={() => {
                          updatePosition(position);
                        }}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    </>
  );
};

export default Positions;
