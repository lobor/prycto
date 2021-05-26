import classnames from "tailwindcss-classnames";
import { useEffect, useState } from "react";
import { useSocket, useEmit } from "socketio-hooks";
import { useTabsContext } from "../context/tabs";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import Label from "./Label";

const round = (num: number) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

const Positions = () => {
  const [addPosisitonShowing, setAddPositionShowing] = useState(false);
  const { addTab, selectTab } = useTabsContext();
  const [markets, setMarket] =
    useState<Record<string, any> | undefined>(undefined);
  const [positions, setPositions] =
    useState<
      | {
          pair: string;
          available: number;
          investment: number;
          exchange: string;
        }[]
      | undefined
    >(undefined);

  const getPositions = useEmit("positions");
  const removePosition = useEmit("removePosition");
  const addPosition = useEmit("addPosition");

  useSocket("markets", (message) => {
    setMarket({ ...(markets || {}), ...message });
  });
  useSocket("positions", (message) => {
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
      {addPosisitonShowing && (
        <div className="h-screen absolute w-full flex flex-col items-center justify-center font-sans">
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-gray-800 opacity-90"></div>
          <div className="h-screen w-full absolute flex items-center justify-center">
            <div className="bg-gray-800 text-gray-200 rounded shadow p-8 m-4 max-w-xs max-h-full text-center">
              <div className="mb-4">
                <h1>Add position</h1>
              </div>
              <form
                onSubmit={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  var formData = new FormData(e.currentTarget);
                  const values: Record<string, unknown> = {};
                  for (var entrie of formData.entries()) {
                    const [key, value] = entrie;
                    values[key] = value;
                  }
                  addPosition(values);
                  setAddPositionShowing(false);
                }}
              >
                <div className="mb-8">
                  <Label htmlFor="exchange" label="Exchange">
                    <Select id="exchange" name="exchange">
                      <option value="binance">Binance</option>
                      <option value="ftx">FTX</option>
                    </Select>
                  </Label>
                  <Label htmlFor="pair" label="Pair">
                    <Input name="pair" id="pair" />
                  </Label>
                </div>
                <div className="flex justify-center">
                  <Button onClick={() => setAddPositionShowing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="validate" className="ml-2">
                    Add
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between mt-6 mr-6 text-gray-200">
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
        <div>
          <Button
            variant="validate"
            onClick={() => {
              setAddPositionShowing(true);
            }}
          >
            Add positions
          </Button>
        </div>
      </div>
      <div className="shadow-md mt-6 block md:hidden">
        {positions &&
          positions.map((position) => {
            const market = (markets && markets[position.pair]) || 0;
            const profit = market * position.available - position.investment;
            return (
              <div key={position.pair} className="mb-3 mx-2 bg-gray-700 text-gray-200">
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
                      });
                      selectTab(position.pair);
                    }}
                  >
                    {position.pair}
                  </Button>
                </div>
                <div className="py-2 px-6">Amount: {position.available}</div>
                <div className="py-2 px-6">Market: {market}</div>
                <div className="py-2 px-6">
                  Investment: {round(position.investment)} /{" "}
                  <span className="text-gray-400">
                    {round(market * position.available)}
                  </span>
                </div>
                <div
                  className={classnames("py-2", "px-6", {
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
      <div className="shadow-md mt-6 hidden md:block">
        <table className="text-left w-full border-collapse">
          <thead>
            <tr className="bg-gray-900 text-gray-200">
              <th className="py-4 px-6 font-bold uppercase text-sm">Paires</th>
              <th className="py-4 px-6 font-bold uppercase text-sm">Amount</th>
              <th className="py-4 px-6 font-bold uppercase text-sm">Market</th>
              <th className="py-4 px-6 font-bold uppercase text-sm">
                Investment
              </th>
              <th className="py-4 px-6 font-bold uppercase text-sm">Profit</th>
              <th className="py-4 px-6 font-bold uppercase text-sm">Actions</th>
            </tr>
          </thead>
          {positions && (
            <tbody>
              {positions.map((position) => {
                const market = (markets && markets[position.pair]) || 0;
                const profit =
                  market * position.available - position.investment;
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
                          });
                          selectTab(position.pair);
                        }}
                      >
                        {position.pair}
                      </Button>
                    </td>
                    <td className="py-2 px-6">{position.available}</td>
                    <td className="py-2 px-6">{market}</td>
                    <td className="py-2 px-6">
                      {round(position.investment)} /{" "}
                      <span className="text-gray-400">
                        {round(market * position.available)}
                      </span>
                    </td>
                    <td
                      className={classnames(
                        "py-2",
                        "px-6",
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
                    <td className="py-2 px-6">
                      <Button
                        onClick={() => {
                          removePosition({
                            exchange: position.exchange,
                            pair: position.pair,
                          });
                        }}
                      >
                        Remove
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
