import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import AddPosition from "../components/AddPosition";
import HideShow from "../components/HideShow";
import TotalPnl from "../components/totalPnl";
import ItemPosition from "../components/ItemPosition";
import { ContextMarkets, useMarket } from "../context/market";
import { round } from "lodash";
import { useMutation, useQuery } from "@apollo/client";
import {
  AddPositionDocument,
  AddPositionMutation,
  AddPositionMutationVariables,
  PositionsDocument,
  PositionsQuery,
  Position,
} from "../generated/graphql";
import { useExchange } from "../context/exchange";
import { FormattedMessage } from "react-intl";
import { AiOutlinePlus } from "react-icons/ai";
import Head from "next/head";
import { useRouter } from "next/dist/client/router";

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
  const router = useRouter();
  const { exchangeId, loading: loadingExchange } = useExchange();
  const [positions, setPositions] = useState<
    (Position & {
      market: number;
      profit: number;
      profitPercent: number;
      total: number;
    })[]
  >([]);
  const [sort, setSort] = useState<{ sort: string; key: string } | null>(null);
  const [addPosisitonShowing, setAddPositionShowing] = useState(false);
  const {
    markets,
    refetch: refetchMarkets,
    loading: loadingMarkets,
  } = useMarket() as ContextMarkets;
  // const [editPositionShowing, setEditPositionShowing] = useState<any>();

  const { data, loading, refetch } = useQuery<PositionsQuery>(
    PositionsDocument,
    {
      variables: { exchangeId },
      skip: loadingExchange || !exchangeId,
    }
  );

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
  // const [editPosition] = useEmit<EditPositionParams>("editPosition");

  const positionsOriginal = useMemo(() => {
    return ((data && data.positions) || []).map((position) => {
      const { available, locked } = position;
      const market = 0;
      const total = Number(available || 0) + (Number(locked || 0) || 0);
      const profit = market * total - position.investment;
      return {
        ...position,
        market,
        profitPercent: (profit * 100) / (position.investment || 1),
        profit,
        total,
      };
    });
  }, [data]);

  const withMarket = (positionsOriginal: any[]) => {
    return positionsOriginal.map((position) => {
      const { available, locked } = position;
      const market = (markets && markets[position.pair]) || 0;
      const total = Number(available || 0) + (Number(locked || 0) || 0);
      const profit = market * total - position.investment;
      return {
        ...position,
        market,
        profitPercent: (profit * 100) / (position.investment || 1),
        profit,
        total,
      };
    });
  };

  const handleSort = (key: string) => () => {
    if (positionsOriginal) {
      const sortTmp = {
        ...sort,
        sort: sort && sort.sort === "asc" ? "desc" : "asc",
        key,
      };
      localStorage.setItem("sort", JSON.stringify(sortTmp));
      console.log("handleSort");
      setSort(sortTmp);
      // setPositions(sortFunction(sortTmp)(withMarket(positionsOriginal)));
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

  // useEffect(() => {
  //   if (sort && positionsOriginal) {
  //     console.log('useEffect')
  //     setPositions(sortFunction(sort)(withMarket(positionsOriginal)));
  //   }
  // }, [sort]);

  // useEffect(() => {
  //   if (sort && positionsOriginal && !loading) {
  //     console.log('useEffect 2')
  //     setPositions(sortFunction(sort)(withMarket(positionsOriginal)));
  //   }
  // }, [sort, positionsOriginal, loading]);
  const totalPnlRender = useMemo(() => <TotalPnl />, []);
  const positionsRender = useMemo(() => {
    console.log("renter positionsRender");
    // console.log(sort, markets)
    return (
      <>
        {sort && positionsOriginal && (
          <div>
            {sortFunction(sort)(withMarket(positionsOriginal)).map(
              (position) => (
                <ItemPosition key={position.pair} position={position} />
              )
            )}
          </div>
        )}
      </>
    );
  }, [sort]);
  return useMemo(
    () => (
      <div>
        <Head>
          <title>Positions - Prycto</title>
          <meta name="description" content="Positions - Prycto" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {totalPnlRender}
        {addPosisitonShowing && (
          <AddPosition
            onSubmit={(e) => {
              addPosition({ variables: e });
            }}
            onCancel={() => {
              setAddPositionShowing(false);
            }}
          />
        )}
        {/* {editPositionShowing && (
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
        )} */}
        <div className="shadow-md mt-6 flex-1">
          <div className="w-full">
            <div className="w-full bg-gray-900 text-gray-200 flex flex-row items-center">
              <div
                onClick={handleSort("pair")}
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer"
              >
                <FormattedMessage id="pairs" />
                {sort &&
                  sort.key === "pair" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div className="" style={{ width: "80px" }}></div>
              <div
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer hidden md:flex"
                onClick={handleSort("amount")}
              >
                <FormattedMessage id="amount" />
                {sort &&
                  sort.key === "amount" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div className="flex-1 py-4 px-6 font-bold uppercase text-sm hidden md:flex">
                <FormattedMessage id="averagePrice" />
              </div>
              <div
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer hidden md:flex"
                onClick={handleSort("market")}
              >
                <FormattedMessage id="market" />
                {sort &&
                  sort.key === "market" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer hidden md:flex"
                onClick={handleSort("investment")}
              >
                <FormattedMessage id="investment" />
                {sort &&
                  sort.key === "investment" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer"
                onClick={handleSort("profitPercent")}
              >
                <FormattedMessage id="profit" />
                {sort &&
                  sort.key === "profitPercent" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer hidden md:flex"
                onClick={handleSort("objectif")}
              >
                <FormattedMessage id="goal" /> (
                <HideShow>
                  {round(
                    positions.reduce((acc, { objectif, total }) => {
                      acc += (objectif || 0) * total;
                      return acc;
                    }, 0)
                  )}
                </HideShow>
                )
                {sort &&
                  sort.key === "objectif" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div className="py-4 px-6 font-bold uppercase text-sm text-center w-60 hidden md:flex justify-center">
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
          {!loading && !loadingMarkets && sort && positionsRender}
          {(loading || loadingMarkets || !sort) && (
            <div className="flex-1 text-center text-gray-200">
              <FormattedMessage id="loading" />
            </div>
          )}
        </div>
      </div>
    ),
    [addPosisitonShowing, positions, sort]
  );
};

export default Positions;
