import classnames from "tailwindcss-classnames";
import { useEffect, useState } from "react";
import { useSocket, useEmit } from "socketio-hooks";
import { useTabsContext } from "../context/tabs";

const round = (num: number) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

const Positions = () => {
  const { addTab, selectTab } = useTabsContext();
  const [markets, setMarket] =
    useState<Record<string, any> | undefined>(undefined);
  const [positions, setPositions] =
    useState<
      { pair: string; available: number; investment: number }[] | undefined
    >(undefined);
  const [loadingReloadPosition, setLoadingReloadPosition] = useState(false);

  const reloadPositions = useEmit("reloadPositions");
  const getPositions = useEmit("positions");

  useSocket("market", (message) => {
    setMarket({ ...(markets || {}), ...message });
  });
  useSocket("positions", (message) => {
    setPositions(message);
  });
  useSocket("reloadPositions", (message) => {
    setLoadingReloadPosition(false);
    setPositions(message);
  });

  useEffect(() => {
    getPositions();
    const marketStorage = localStorage.getItem("markets");
    if (marketStorage) {
      try {
        setMarket(JSON.parse(marketStorage));
      } catch (e) {
        console.warn("Local storage markets can't read");
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      localStorage.setItem("markets", JSON.stringify(markets));
    };
  }, [markets]);

  const { globalInvestment, globalProfit } = (positions || []).reduce(
    (acc, position) => {
      const market = (markets && markets[position.pair]) || 0;
      const profit = market * position.available;
      acc.globalProfit += profit;
      acc.globalInvestment += position.investment;
      return acc;
    },
    { globalInvestment: 0, globalProfit: 0 }
  );

  return (
    <>
      <div className="flex justify-between mt-6 mr-6">
        <span className="ml-6">
          {round(globalInvestment)} /{" "}
          <span
            className={classnames("inline-block", "w-14", {
              "text-red-600": globalInvestment >= globalProfit,
              "text-green-500": globalInvestment < globalProfit,
            })}
          >
            {round(globalProfit)}
          </span>
          <br />
          <span
            className={classnames({
              "text-red-600": globalProfit - globalInvestment < 0,
              "text-green-500": globalProfit - globalInvestment >= 0,
            })}
          >
            {round(globalProfit - globalInvestment)}
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
        <button
          className="bg-blue-500 px-4 py-2 text-xs font-semibold tracking-wider text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loadingReloadPosition}
          onClick={() => {
            setLoadingReloadPosition(true);
            reloadPositions();
          }}
        >
          {loadingReloadPosition ? "Loading..." : "Reload Position"}
        </button>
      </div>
      <div className="shadow-md rounded mt-6 block md:hidden">
        {positions && positions.map((position) => {
          const market = (markets && markets[position.pair]) || 0;
          const profit = market * position.available - position.investment;
          return (
            <div key={position.pair} className="mb-3 mx-2 bg-white ">
              <div className="py-2 px-6 border-b border-grey-light">
                <button
                  className="hover:underline text-blue-500"
                  onClick={() => {
                    addTab({
                      key: position.pair,
                      label: position.pair,
                      canClose: true,
                    });
                    selectTab(position.pair);
                  }}
                >
                  {position.pair}
                </button>
              </div>
              <div className="py-2 px-6">
                Amount: {position.available}
              </div>
              <div className="py-2 px-6">Market: {market}</div>
              <div className="py-2 px-6">
                Investment: {round(position.investment)} /{" "}
                <span className="text-gray-400">
                  {round(market * position.available)}
                </span>
              </div>
              <div
                className={classnames("py-2 px-6", {
                  "text-green-500": profit >= 0,
                  "text-red-600": profit < 0,
                })}
              >
                Profit: {round(profit)} (
                {position.investment !== 0
                  ? round((profit * 100) / position.investment)
                  : 0}
                %)
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-white shadow-md rounded mt-6 hidden md:block">
        <table className="text-left w-full border-collapse">
          <thead>
            <tr>
              <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">
                Paires
              </th>
              <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">
                Amount
              </th>
              <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">
                Market
              </th>
              <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">
                Investment
              </th>
              <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">
                Profit
              </th>
            </tr>
          </thead>
          {positions && (
            <tbody>
              {positions.map((position) => {
                const market = (markets && markets[position.pair]) || 0;
                const profit =
                  market * position.available - position.investment;
                return (
                  <tr key={position.pair} className="hover:bg-gray-300">
                    <td className="py-2 px-6 border-b border-grey-light">
                      <button
                        className="hover:underline text-blue-500"
                        onClick={() => {
                          addTab({
                            key: position.pair,
                            label: position.pair,
                            canClose: true,
                          });
                          selectTab(position.pair);
                        }}
                      >
                        {position.pair}
                      </button>
                    </td>
                    <td className="py-2 px-6 border-b border-grey-light">
                      {position.available}
                    </td>
                    <td className="py-2 px-6 border-b border-grey-light">
                      {market}
                    </td>
                    <td className="py-2 px-6 border-b border-grey-light">
                      {round(position.investment)} /{" "}
                      <span className="text-gray-400">
                        {round(market * position.available)}
                      </span>
                    </td>
                    <td
                      className={classnames(
                        "py-2 px-6 border-b border-grey-light",
                        {
                          "text-green-500": profit >= 0,
                          "text-red-600": profit < 0,
                        }
                      )}
                    >
                      {round(profit)} (
                      {position.investment !== 0
                        ? round((profit * 100) / position.investment)
                        : 0}
                      %)
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
