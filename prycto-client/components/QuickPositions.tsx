import Loading from "./Loading";
import Button from "./Button";
import SimpleBarReact from "simplebar-react";
import { PositionsDocument, PositionsQuery } from "../generated/graphql";
import { useQuery } from "@apollo/client";
import { useExchange } from "../context/exchange";
import { useTabsContext } from "../context/tabs";
import { useRouter } from "next/dist/client/router";
import { ContextMarkets, useMarket } from "../context/market";
import { classnames } from "tailwindcss-classnames";
import HideShow from "./HideShow";
import { round } from "lodash";
import { FormattedMessage } from "react-intl";
import { useMemo, useState } from "react";

const sortFunction =
  (sort: { sort: string; key: string }) =>
  (positionsOriginal: any[] = []) => {
    return positionsOriginal.slice().sort((a: any, b: any) => {
      let valueA = a[sort.key];
      let valueB = b[sort.key];
      if (sort.sort === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  };

const QuickPositions = () => {
  const router = useRouter();
  const [sort, setSort] = useState<{ sort: string; key: string }>({
    sort: "desc",
    key: "profitPercent",
  });
  const { exchangeId, exchange, loading: loadingExchange } = useExchange();
  const { addTab, selectTab } = useTabsContext();
  const { markets } = useMarket() as ContextMarkets;
  const { data: dataPositions, loading: loadingPosition } =
    useQuery<PositionsQuery>(PositionsDocument, {
      variables: { exchangeId },
      skip: loadingExchange || !exchangeId,
    });
  const positionsOriginal = useMemo(() => {
    return ((dataPositions && dataPositions.positions) || []).map(
      (position) => {
        const { _id, pair: symbol } = position;
        const market = (markets && markets[symbol]) || 0;
        const total =
          Number(position.available || 0) + (Number(position.locked || 0) || 0);
        const profit = market * total - position.investment;
        return {
          ...position,
          profit,
          profitPercent:
            position.investment > 0
              ? (profit * 100) / (position.investment || 1)
              : 0,
        };
      }
    );
  }, [dataPositions, markets]);
  const handleSort = (key: string) => () => {
    if (positionsOriginal) {
      const sortTmp = {
        ...sort,
        sort: sort && sort.sort === "asc" ? "desc" : "asc",
        key,
      };
      setSort(sortTmp);
    }
  };
  return (
    <div className="w-50 flex-col pr-1 pb-1 hidden md:flex">
      <div className="py-2 px-2 flex justify-between bg-gray-900 text-gray-200">
        <div
          className="flex-1 flex items-center font-bold text-sm cursor-pointer"
          onClick={handleSort("pair")}
        >
          <FormattedMessage id="pairs" />
          {sort &&
            sort.key === "pair" &&
            (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
        </div>
        <div
          className="flex items-center w-12 font-bold text-sm cursor-pointer"
          onClick={handleSort("profitPercent")}
        >
          <FormattedMessage id="profit" />
          {sort &&
            sort.key === "profitPercent" &&
            (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex">
        <SimpleBarReact
          className="hidden md:flex flex-col "
          style={{ width: 200 }}
          autoHide
        >
          {loadingPosition && (
            <div className="flex flex-1 items-center justify-center">
              <Loading />
            </div>
          )}
          {!loadingPosition &&
            sortFunction(sort)(positionsOriginal).map((position) => {
              const { _id, pair: symbol, profitPercent } = position;
              return (
                <div className="py-2 px-2 flex justify-between" key={_id}>
                  <div className="flex-1 flex items-center ">
                    <img
                      src={`/${exchange}.ico`}
                      className="inline-block mr-2"
                      width="20"
                      alt={exchange}
                    />
                    <Button
                      variant="link"
                      className="inline-block"
                      onClick={() => {
                        const pathname = `/tradingview/${_id}?pair=${symbol}`;
                        addTab({
                          key: symbol,
                          label: symbol,
                          canClose: true,
                          exchange,
                          href: pathname,
                        });
                        router.push(pathname);
                        selectTab(symbol);
                      }}
                    >
                      {symbol}
                    </Button>
                  </div>
                  <div
                    className={classnames("w-12", "text-right", {
                      "text-green-500": profitPercent >= 0,
                      "text-red-600": profitPercent < 0,
                    })}
                  >
                    {/* <HideShow>{round(profit)}</HideShow>{" "} */}
                    <div className="block md:hidden" />({round(profitPercent)}
                    %)
                  </div>
                </div>
              );
            })}
        </SimpleBarReact>
      </div>
    </div>
  );
};

export default QuickPositions;
