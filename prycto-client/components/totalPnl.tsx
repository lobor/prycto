import classnames from "tailwindcss-classnames";
import { useMarket, ContextMarkets } from "../context/market";
import round from "../utils/round";
import HideShow from "./HideShow";
import { useQuery } from "@apollo/client";
import { PositionsDocument, PositionsQuery } from "../generated/graphql";
import { useExchange } from "../context/exchange";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { intlFormat } from "date-fns";
import { useIntl } from "react-intl";

const stableCoins = "BUSD|USDT|USDC|TUSD";
const TotalPnl = () => {
  const intl = useIntl();
  const { exchangeId, loading } = useExchange();
  const { data: positions } = useQuery<PositionsQuery>(PositionsDocument, {
    variables: { exchangeId },
    skip: !exchangeId || loading,
  });
  const { markets } = useMarket() as ContextMarkets;
  const { globalInvestment, globalProfit } = (
    (positions && positions.positions) ||
    []
  ).reduce(
    (acc, position) => {
      if (position.pair.match(new RegExp(`(${stableCoins})$`, "g"))) {
        const market = markets[position.pair] || 0;
        const profit =
          market * ((position.available || 0) + (position.locked || 0));
        acc.globalProfit += profit;
        if (position.investment > 0) {
          acc.globalInvestment += position.investment;
        }
      }
      return acc;
    },
    { globalInvestment: 0, globalProfit: 0 }
  );
  return (
    <div className="flex justify-between mt-6 mr-6 text-gray-200">
      <span className="ml-6">
        <HideShow>{round(globalInvestment)}</HideShow>$ /{" "}
        <span
          className={classnames("inline-block", {
            "text-red-600": globalInvestment >= globalProfit,
            "text-green-500": globalInvestment < globalProfit,
          })}
        >
          <HideShow>{round(globalProfit)}</HideShow>$
          <span className="ml-3">
            {round(
              ((globalProfit - globalInvestment) * 100) /
                (globalInvestment || 1)
            )}
            %
          </span>
        </span>
        <small className="text-sm text-gray-500 flex items-center">
          <AiOutlineInfoCircle className="mr-1" />
          {intl.formatMessage({id: "pnl.only"}, { pairs: stableCoins })}
        </small>
      </span>
    </div>
  );
};

export default TotalPnl;
