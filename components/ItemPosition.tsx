import { useRouter } from "next/dist/client/router";
import Button from "../components/Button";
import classnames from "tailwindcss-classnames";
import useSocket from "../hooks/useSocket";
import { useTabsContext } from "../context/tabs";
import useEmit from "../hooks/useEmit";
import { useEffect } from "react";
import { useMarket } from "../context/market";
import { format } from "date-fns";
import { GetPositionResponse, RemovePositionParams } from "../type";
import round from "../utils/round";

interface ItemPositionProps {
  position: GetPositionResponse;
}

const ItemPosition = ({ position }: ItemPositionProps) => {
  const {
    _id,
    pair: symbol,
    exchange,
    investment,
    available,
    locked,
  } = position;
  const router = useRouter();
  const [updatePosition] = useEmit("syncPositions");
  const [removePosition] = useEmit<RemovePositionParams>("removePosition");
  const { addTab, selectTab } = useTabsContext();
  const { data: markets } = useSocket<{ [key: string]: number }>(
    `getMarkets:${symbol}`,
    {
      params: { symbol, exchangeId: exchange },
    }
  );
  const price = useMarket(symbol) as number;
  const market = (markets && markets[symbol]) || price;
  const total = Number(available || 0) + (Number(locked || 0) || 0);
  const profit = market * total - investment;
  return (
    <div
      key={symbol}
      className="hover:bg-gray-900 text-gray-200 border-b border-gray-900 flex"
    >
      <div className="py-2 px-6 flex-1">
        <img
          src={`${exchange}.ico`}
          alt={exchange}
          className="inline mr-1 align-text-top"
          style={{ height: "16px" }}
        />
        <Button
          variant="link"
          onClick={() => {
            addTab({
              key: symbol,
              label: symbol,
              canClose: true,
              exchange: exchange,
              href: `/tradingview?pair=${symbol}`,
            });
            router.push(`/tradingview?pair=${symbol}`);
            selectTab(symbol);
          }}
        >
          {symbol}
        </Button>
      </div>
      <div className="py-2 px-6 hidden md:block flex-1">{total}</div>
      <div className="py-2 px-6 hidden md:block flex-1">
        {round(total === 0 ? 0 : investment / total, 8)}
      </div>
      <div className="py-2 px-6 hidden md:block flex-1">{market}</div>
      <div className="py-2 px-6 hidden md:block flex-1">
        {round(investment)} /{" "}
        <span className="text-gray-400">{round(market * total)}</span>
      </div>
      <div
        className={classnames("py-2", "px-6", "flex-1", {
          "text-green-500": profit >= 0,
          "text-red-600": profit < 0,
        })}
      >
        {round(profit)} (
        {investment !== 0 ? round((profit * 100) / investment) : 0}
        %)
      </div>
      <div className="py-2 px-6 text-center w-60 hidden md:block">
        <Button
          onClick={() => {
            removePosition(_id);
          }}
        >
          Remove
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
              _id,
              pair: symbol,
              exchangeId: position.exchangeId,
            });
          }}
        >
          Update
        </Button>
      </div>
    </div>
  );
};

export default ItemPosition;
