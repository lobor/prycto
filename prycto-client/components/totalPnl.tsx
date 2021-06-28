import classnames from "tailwindcss-classnames";
import { useMarket, ContextMarkets } from "../context/market";
import useSocket from "../hooks/useSocket";
import { GetPositionResponse } from "../../type";
import round from "../utils/round";
import HideShow from "./HideShow";

const TotalPnl = () => {
  const { data: positions } = useSocket<GetPositionResponse[]>("getPositions");
  const { markets } = useMarket() as ContextMarkets;
  const { globalInvestment, globalProfit } = (positions || []).reduce(
    (acc, position) => {
      const market = markets[position.pair] || 0;
      const profit = market * (position.available + (position.locked || 0));
      acc.globalProfit += profit;
      acc.globalInvestment += position.investment;
      return acc;
    },
    { globalInvestment: 0, globalProfit: 0 }
  );

  return (
    <div className="flex justify-between mt-6 mr-6 text-gray-200">
      <span className="ml-6">
        <HideShow>{round(globalInvestment)}</HideShow>BUSD /
        <span
          className={classnames("inline-block", "w-28", {
            "text-red-600": globalInvestment >= globalProfit,
            "text-green-500": globalInvestment < globalProfit,
          })}
        >
          <HideShow>{round(globalProfit)}</HideShow>
          BUSD
        </span>{" "}
        ≈ <HideShow>{round(globalInvestment * 0.82)}</HideShow>€ /{" "}
        <span
          className={classnames("inline-block", "w-14", {
            "text-red-600": globalInvestment >= globalProfit,
            "text-green-500": globalInvestment < globalProfit,
          })}
        >
          <HideShow>{round(globalProfit * 0.82)}</HideShow>€
        </span>
        <br />
        <span
          className={classnames({
            "text-red-600": globalProfit - globalInvestment < 0,
            "text-green-500": globalProfit - globalInvestment >= 0,
          })}
        >
          <HideShow>{round(globalProfit - globalInvestment)}</HideShow>BUSD
        </span>
        {" ≈ "}
        <span
          className={classnames({
            "text-red-600": globalProfit - globalInvestment < 0,
            "text-green-500": globalProfit - globalInvestment >= 0,
          })}
        >
          <HideShow>{round((globalProfit - globalInvestment) * 0.82)}</HideShow>€
        </span>{" "}
        (
        <span
          className={classnames({
            "text-red-600": globalProfit - globalInvestment < 0,
            "text-green-500": globalProfit - globalInvestment >= 0,
          })}
        >
          {round(((globalProfit - globalInvestment) * 100) / globalInvestment)}%
        </span>
        )
      </span>
    </div>
  );
};

export default TotalPnl;
