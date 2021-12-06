import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import AddPosition from "../components/AddPosition";
import { ContextMarkets, useMarket } from "../context/market";
import { useMutation, useQuery } from "@apollo/client";
import TotalPnl from "../components/totalPnl";
import {
  AddPositionDocument,
  AddPositionMutation,
  AddPositionMutationVariables,
  GetHistoryOrderBySymbolDocument,
  GetHistoryOrderBySymbolQuery,
  GetHistoryOrderBySymbolQueryVariables,
  PositionsDocument,
  PositionsQuery,
} from "../generated/graphql";
import { useExchange } from "../context/exchange";
import { FormattedMessage } from "react-intl";
import { AiOutlinePlus } from "react-icons/ai";
import Head from "next/head";
import ItemPosition from "../components/ItemPosition";
import SimpleBarReact from "simplebar-react";
import { AutoSizer } from "react-virtualized";
import useWallet from "use-wallet";
import { TokenPrice } from "../utils/tokenPrice";
import { fromWei } from "web3-utils";

const sortFunction =
  (sort: { sort: string; key: string }) => (positionsOriginal: any[]) => {
    return positionsOriginal.sort((a: any, b: any) => {
      let valueA = a[sort.key];
      let valueB = b[sort.key];
      if (sort.key === "amount") {
        valueA = a.locked + a.available;
        valueB = b.locked + b.available;
      }
      if (sort.sort === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  };

const Positions = () => {
  const { exchangeId, exchange, loading: loadingExchange } = useExchange();
  const [sort, setSort] = useState<{ sort: string; key: string }>({
    sort: "asc",
    key: "pair",
  });
  const [addPosisitonShowing, setAddPositionShowing] = useState(false);
  const {
    markets,
    refetch: refetchMarkets,
    loading: loadingMarkets,
  } = useMarket() as ContextMarkets;

  const { data, loading, refetch } = useQuery<PositionsQuery>(
    PositionsDocument,
    {
      variables: { exchangeId },
      skip: loadingExchange || !exchangeId,
    }
  );

  const { data: historyOrder } = useQuery<
    GetHistoryOrderBySymbolQuery,
    GetHistoryOrderBySymbolQueryVariables
  >(GetHistoryOrderBySymbolDocument, {
    variables: {
      positionIds: ((data && data.positions) || []).map(({ _id }) => _id),
    },
    skip: loading || !data || !data.positions,
  });

  const [addPosition] = useMutation<
    AddPositionMutation,
    AddPositionMutationVariables
  >(AddPositionDocument, {
    onCompleted: () => {
      setAddPositionShowing(false);
      refetch();
      refetchMarkets();
    },
  });

  useEffect(() => {
    if (process.browser) {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 500);
    }
  }, [process.browser]);

  const { ethereum, account } = useWallet();

  const totalPnlRender = useMemo(() => <TotalPnl />, []);

  const positionsOriginal = useMemo(
    () =>
      ((data && data.positions) || []).map((position) => {
        const { available, locked } = position;
        const market = (markets && markets[position.pair]) || 0;
        const total = Number(available || 0) + (Number(locked || 0) || 0);
        // const profit = market * total - position.investment;
        const profit =
          historyOrder && historyOrder.getHistoryOrderBySymbol && market
            ? historyOrder.getHistoryOrderBySymbol
                .filter(({ symbol }) => position.pair === symbol)
                .reduce((acc, order) => {
                  if (order.status === "closed") {
                    if (order.side === "buy") {
                      acc += market * order.amount - order.cost;
                    } else {
                      acc -= market * order.amount - order.cost;
                    }
                  }
                  return acc;
                }, 0)
            : 0;
        return {
          ...position,
          market,
          profitPercent:
            position.investment > 0
              ? (profit * 100) / (position.investment || 1)
              : 0,
          profit: position.investment > 0 ? profit : market * total - position.investment,
          total,
          gain: position.investment < 0 ? position.investment * -1 : 0,
        };
      }),
    [historyOrder, markets, data]
  );

  const handleSort = (key: string) => () => {
    if (positionsOriginal) {
      const sortTmp = {
        ...sort,
        sort: sort && sort.sort === "asc" ? "desc" : "asc",
        key,
      };
      localStorage.setItem("sort", JSON.stringify(sortTmp));
      setSort(sortTmp);
    }
  };

  useEffect(() => {
    const sortStorageString = localStorage.getItem("sort");
    if (sortStorageString && !loadingMarkets) {
      try {
        const sortStorage = JSON.parse(sortStorageString);
        setSort(sortStorage);
      } catch (e) {
        setSort({ sort: "asc", key: "pair" });
      }
    }
  }, [loadingMarkets]);

  const positionsRender = useMemo(() => {
    return (
      <AutoSizer>
        {({ height, width }) => (
          <SimpleBarReact
            className="flex-1"
            style={{ height, width }}
            forceVisible="y"
            autoHide={false}
          >
            {positionsOriginal.length > 0 && (
              <div>
                {sortFunction(sort)(positionsOriginal).map((position) => (
                  <ItemPosition key={position.pair} position={position} />
                ))}
              </div>
            )}
            {positionsOriginal.length === 0 && (
              <div className="flex-1 text-center text-gray-200 mt-3">
                <FormattedMessage id="positions.noData" />
              </div>
            )}
          </SimpleBarReact>
        )}
      </AutoSizer>
    );
  }, [sort, positionsOriginal]);
  return (
    <div className="flex-1 flex flex-col h-full">
      <Head>
        <title>Positions - Prycto</title>
        <meta name="description" content="Positions - Prycto" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {totalPnlRender}
      <AddPosition
        open={addPosisitonShowing}
        onSubmit={async (e) => {
          addPosition({ variables: e });
        }}
        onCancel={() => {
          setAddPositionShowing(false);
        }}
      />
      <div className="flex-1 flex flex-col">
        <div className="w-full">
          <div className="w-full border-b-2 border-gray-900 text-gray-200 flex flex-row items-center">
            <div
              onClick={handleSort("pair")}
              className="flex-1 py-4 md:px-6 font-bold uppercase text-sm cursor-pointer"
            >
              <FormattedMessage id="pairs" />
              {sort &&
                sort.key === "pair" &&
                (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
            </div>
            <div className="" style={{ width: "80px" }}></div>
            <div
              className="flex-1 py-4 md:px-6 font-bold uppercase text-sm cursor-pointer hidden md:flex"
              onClick={handleSort("amount")}
            >
              <FormattedMessage id="amount" />
              {sort &&
                sort.key === "amount" &&
                (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
            </div>
            <div className="flex-1 py-4 md:px-6 font-bold uppercase text-sm hidden md:flex">
              <FormattedMessage id="averagePrice" />
            </div>
            <div
              className="flex-1 py-4 md:px-6 font-bold uppercase text-sm cursor-pointer hidden md:flex"
              onClick={handleSort("market")}
            >
              <FormattedMessage id="market" />
              {sort &&
                sort.key === "market" &&
                (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
            </div>
            <div
              className="flex-1 py-4 md:px-6 font-bold uppercase text-sm cursor-pointer hidden md:flex"
              onClick={handleSort("investment")}
            >
              <FormattedMessage id="investment" />
              {sort &&
                sort.key === "investment" &&
                (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
            </div>
            <div
              className="flex-1 py-4 md:px-6 font-bold uppercase text-sm cursor-pointer text-center"
              onClick={handleSort("profitPercent")}
            >
              <FormattedMessage id="profit" />
              {sort &&
                sort.key === "profitPercent" &&
                (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
            </div>
            <div
              className="flex-1 py-4 md:px-6 font-bold uppercase text-sm cursor-pointer text-center hidden md:block"
              onClick={handleSort("gain")}
            >
              <FormattedMessage id="gain" />
              {sort &&
                sort.key === "gain" &&
                (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
            </div>
            <div
              className="w-28 py-4 md:px-6 font-bold uppercase text-sm cursor-pointer hidden md:block text-center"
              onClick={handleSort("objectif")}
            >
              <FormattedMessage id="goal" />
              {sort &&
                sort.key === "objectif" &&
                (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
            </div>
            <div className="py-4 md:px-6 font-bold uppercase text-sm text-center w-60 hidden md:flex justify-center">
              <Button
                variant="validate"
                onClick={() => {
                  setAddPositionShowing(true);
                }}
              >
                <AiOutlinePlus />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {!loading && !loadingMarkets && positionsRender}
        </div>
        {(loading || loadingMarkets) && (
          <div className="flex-1 text-center text-gray-200">
            <FormattedMessage id="loading" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Positions;
