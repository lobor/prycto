import Head from "next/head";
import { useState } from "react";
import { useEmit } from "socketio-hooks";
import Button from "../components/Button";
import AddExchange from "../components/AddExchange";
import useSocket from "../hooks/useSocket";

export default function Exchange() {
  const [addExchangeShowing, setAddExchangeShowing] = useState(false);
  const { data: exchanges, refetch: getExchanges } =
    useSocket<{ _id: string; name: string }[]>("getExchange");
  const addExchanges = useEmit("addExchange:request");
  const removeExchanges = useEmit("removeExchange:request");
  return (
    <div>
      <Head>
        <title>Exchange - Prycto</title>
        <meta name="description" content="Exchange configuration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {addExchangeShowing && (
        <AddExchange
          onSubmit={(e) => {
            addExchanges(e);
            setAddExchangeShowing(false);
            getExchanges();
          }}
          onCancel={() => {
            setAddExchangeShowing(false);
          }}
        />
      )}
      <div className="shadow-md mt-6 hidden md:block">
        <table className="table-auto text-left w-full border-collapse">
          <thead>
            <tr className="bg-gray-900 text-gray-200">
              <th className="py-4 px-6 font-bold uppercase text-sm">Echange</th>
              {/* <th className="py-4 px-6 font-bold uppercase text-sm">Actions</th> */}
              <th className="w-1/12 py-4 px-6 font-bold uppercase text-sm">
                <Button
                  variant="validate"
                  onClick={() => {
                    setAddExchangeShowing(true);
                  }}
                >
                  Add
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {exchanges &&
              exchanges.map((exchange) => {
                return (
                  <tr
                    key={exchange._id}
                    className="hover:bg-gray-900 text-gray-200 border-b border-gray-900"
                  >
                    <td className="py-2 px-6 ">
                      {exchange.name}
                      {/* <img
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
                    </Button> */}
                    </td>
                    {/* <td className="py-2 px-6"></td> */}
                    {/* <td className="py-2 px-6">{market}</td>
                  <td className="py-2 px-6">
                    {round(position.investment)} /{" "}
                    <span className="text-gray-400">
                      {round(market * position.available)}
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
                  </td> */}
                    <td className="py-2 px-6">
                      <Button
                        onClick={() => {
                          removeExchanges(exchange._id);
                          getExchanges();
                        }}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
