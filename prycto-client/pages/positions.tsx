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

const sortFunction = (sort: { sort: string; key: string }) => (
  positionsOriginal: any[]
) => {
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
  const { exchangeId } = useExchange();
  const [positions, setPositions] = useState<
    (Position & {
      market: number;
      profit: number;
      profitPercent: number;
      total: number;
    })[]
  >([]);
  const [sort, setSort] = useState({ sort: "asc", key: "pair" });
  const [addPosisitonShowing, setAddPositionShowing] = useState(false);
  // const [editPositionShowing, setEditPositionShowing] = useState<any>();

  const { data, loading, refetch } = useQuery<PositionsQuery>(
    PositionsDocument,
    {
      skip: !exchangeId,
    }
  );

  const [addPosition] = useMutation<
    AddPositionMutation,
    AddPositionMutationVariables
  >(AddPositionDocument, {
    onCompleted: () => {
      setAddPositionShowing(false);
      refetch();
    },
  });
  // const [editPosition] = useEmit<EditPositionParams>("editPosition");
  const { markets } = useMarket() as ContextMarkets;

  const positionsOriginal = useMemo(() => {
    return ((data && data.positions) || []).map((position) => {
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
  }, [data, markets]);

  const handleSort = (key: string) => () => {
    if (positionsOriginal) {
      const sortTmp = {
        ...sort,
        sort: sort.sort === "asc" ? "desc" : "asc",
        key,
      };
      setSort(sortTmp);
      setPositions(sortFunction(sortTmp)(positionsOriginal));
    }
  };

  useEffect(() => {
    const sortStorageString = localStorage.getItem("sort");
    if (sortStorageString) {
      try {
        const sortStorage = JSON.parse(sortStorageString);
        setSort(sortStorage);
      } catch (e) {}
    }
  }, []);

  useEffect(() => () => localStorage.setItem("sort", JSON.stringify(sort)), [
    sort,
  ]);

  useEffect(() => {
    if (positionsOriginal) {
      setPositions(sortFunction(sort)(positionsOriginal));
    }
  }, [markets, sort]);

  useEffect(() => {
    if (positionsOriginal && !loading) {
      setPositions(sortFunction(sort)(positionsOriginal));
    }
  }, [positionsOriginal, loading]);
  const totalPnlRender = useMemo(() => <TotalPnl />, []);
  const positionsRender = useMemo(() => {
    return (
      <>
        {positions && (
          <div>
            {positions.map((position) => {
              return <ItemPosition key={position.pair} position={position} />;
            })}
          </div>
        )}
      </>
    );
  }, [sort, positions]);

  return useMemo(
    () => (
      <>
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
        <div className="shadow-md mt-6">
          <div className="w-full">
            <div className="w-full bg-gray-900 text-gray-200 flex flex-row items-center">
              <div
                onClick={handleSort("pair")}
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer"
              >
                Paires
                {sort.key === "pair" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div className="" style={{ width: "80px" }}></div>
              <div
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer hidden md:flex"
                onClick={handleSort("amount")}
              >
                Amount
                {sort.key === "amount" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div className="flex-1 py-4 px-6 font-bold uppercase text-sm hidden md:flex">
                Price bought
              </div>
              <div
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer hidden md:flex"
                onClick={handleSort("market")}
              >
                Market
                {sort.key === "market" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer hidden md:flex"
                onClick={handleSort("investment")}
              >
                Investment
                {sort.key === "investment" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer"
                onClick={handleSort("profitPercent")}
              >
                Profit
                {sort.key === "profitPercent" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer hidden md:flex"
                onClick={handleSort("objectif")}
              >
                Objectif (
                <HideShow>
                  {round(
                    positions.reduce((acc, { objectif, total }) => {
                      acc += (objectif || 0) * total;
                      return acc;
                    }, 0)
                  )}
                </HideShow>
                )
                {sort.key === "objectif" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div className="py-4 px-6 font-bold uppercase text-sm text-center w-60 hidden md:flex justify-center">
                <Button
                  variant="validate"
                  onClick={() => {
                    setAddPositionShowing(true);
                  }}
                >
                  &#10010;
                </Button>
              </div>
            </div>
          </div>
          {!loading && positionsRender}
          {loading && (
            <div className="flex-1 text-center text-gray-200">Loading...</div>
          )}
        </div>
      </>
    ),
    [addPosisitonShowing, positions, sort]
  );
};

export default Positions;
