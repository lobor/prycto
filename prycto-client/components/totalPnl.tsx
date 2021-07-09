import classnames from "tailwindcss-classnames";
import { useMarket, ContextMarkets } from "../context/market";
import round from "../utils/round";
import HideShow from "./HideShow";
import { useQuery } from "@apollo/client";
import { PositionsDocument, PositionsQuery } from "../generated/graphql";

const TotalPnl = () => {
  const { data: positions } = useQuery<PositionsQuery>(PositionsDocument);
  const { markets } = useMarket() as ContextMarkets;
  const { globalInvestment, globalProfit } = (
    (positions && positions.positions) ||
    []
  ).reduce(
    (acc, position) => {
      const market = markets[position.pair] || 0;
      const profit =
        market * ((position.available || 0) + (position.locked || 0));
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
          <HideShow>{round((globalProfit - globalInvestment) * 0.82)}</HideShow>
          €
        </span>{" "}
        (
        <span
          className={classnames({
            "text-red-600": globalProfit - globalInvestment < 0,
            "text-green-500": globalProfit - globalInvestment >= 0,
          })}
        >
          {round(
            ((globalProfit - globalInvestment) * 100) / (globalInvestment || 1)
          )}
          %
        </span>
        )
      </span>
    </div>
  );
};

export default TotalPnl;
