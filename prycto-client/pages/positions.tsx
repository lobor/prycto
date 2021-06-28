import { useEffect, useMemo, useState } from "react";
import useSocket from "../hooks/useSocket";
import useEmit from "../hooks/useEmit";
import Button from "../components/Button";
import AddPosition from "../components/AddPosition";
import HideShow from "../components/HideShow";
import TotalPnl from "../components/totalPnl";
import { AddPositionParams, GetPositionResponse } from "../../type";
import ItemPosition, { Position } from "../components/ItemPosition";
import { ContextMarkets, useMarket } from "../context/market";
import { round } from "lodash";
import { gql, useQuery } from "@apollo/client";
import { PositionsDocument, PositionsQuery } from "../generated/graphql";

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
  const [positions, setPositions] = useState<GetPositionResponse[]>([]);
  const [sort, setSort] = useState({ sort: "asc", key: "pair" });
  const [addPosisitonShowing, setAddPositionShowing] = useState(false);
  // const [editPositionShowing, setEditPositionShowing] = useState<any>();

  const [addPosition] = useEmit<AddPositionParams>("addPosition");
  // const [editPosition] = useEmit<EditPositionParams>("editPosition");
  const { markets } = useMarket() as ContextMarkets;

  const { data, loading } = useQuery<PositionsQuery>(PositionsDocument);
  const positionsOriginal = useMemo(() => {
    return ((data && data.positions) || []).map((position) => {
      const { available, locked } = position;
      const total = Number(available || 0) + (Number(locked || 0) || 0);
      return {
        ...position,
        total,
      };
    });
  }, [data]);

  const handleSort = (key: string) => () => {
    if (positionsOriginal) {
      const sortTmp = {
        ...sort,
        sort: sort.sort === "asc" ? "desc" : "asc",
        key,
      };
      setSort(sortTmp);
      setPositions(
        sortFunction(sort)(
          positionsOriginal.map((position) => {
            const market = (markets && markets[position.pair]) || 0;
            const profit = market * position.total - position.investment;
            return {
              ...position,
              profit,
              profitPercent: (profit * 100) / (position.investment || 1),
              market: (markets && markets[position.pair]) || 0,
            };
          })
        )
      );
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

  useEffect(
    () => () => localStorage.setItem("sort", JSON.stringify(sort)),
    [sort]
  );

  useEffect(() => {
    if (positionsOriginal) {
      setPositions(
        sortFunction(sort)(
          positionsOriginal.map((position) => {
            const market = (markets && markets[position.pair]) || 0;
            const profit = market * position.total - position.investment;
            return {
              ...position,
              profit,
              profitPercent: (profit * 100) / (position.investment || 1),
              market: (markets && markets[position.pair]) || 0,
            };
          })
        )
      );
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
              return (
                <ItemPosition
                  key={position.pair}
                  position={position as Position}
                />
              );
            })}
          </div>
        )}
        {loading && positions && (
          <div className="flex-1 text-center text-gray-200">Loading...</div>
        )}
      </>
    );
  }, [positions, loading]);

  return useMemo(
    () => (
      <>
        {totalPnlRender}
        {addPosisitonShowing && (
          <AddPosition
            onSubmit={(e) => {
              addPosition(e);
              setAddPositionShowing(false);
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
          <div className="w-full hidden md:flex">
            <div className="w-full bg-gray-900 text-gray-200 flex flex-row items-center">
              <div
                onClick={handleSort("pair")}
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer"
              >
                Paires
                {sort.key === "pair" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer"
                onClick={handleSort("amount")}
              >
                Amount
                {sort.key === "amount" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div className="flex-1 py-4 px-6 font-bold uppercase text-sm">
                Price bought
              </div>
              <div
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer"
                onClick={handleSort("market")}
              >
                Market
                {sort.key === "market" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div>
              <div
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer"
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
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer"
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
              <div className="py-4 px-6 font-bold uppercase text-sm text-center w-60">
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
          {positionsRender}
        </div>
      </>
    ),
    [addPosisitonShowing, positions, sort]
  );
};

export default Positions;
