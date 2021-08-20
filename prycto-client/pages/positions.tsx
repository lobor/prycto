import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import AddPosition from "../components/AddPosition";
import HideShow from "../components/HideShow";
import TotalPnl from "../components/totalPnl";
import { ContextMarkets, useMarket } from "../context/market";
import { round } from "lodash";
import { useMutation, useQuery } from "@apollo/client";
import classnames from "tailwindcss-classnames";
import {
  AddPositionDocument,
  AddPositionMutation,
  AddPositionMutationVariables,
  PositionsDocument,
  PositionsQuery,
  Position,
} from "../generated/graphql";
// import Graph from '../components/Graph'
import { useExchange } from "../context/exchange";
import { FormattedMessage, useIntl, FormattedDate } from "react-intl";
import { AiOutlinePlus } from "react-icons/ai";
import Head from "next/head";
import ItemPosition from "../components/ItemPosition";
import SimpleBarReact from "simplebar-react";
import { AutoSizer } from "react-virtualized";
import { addDays } from "date-fns";
import Table from "../components/Table";
import { useRouter } from "next/dist/client/router";
import { useTabsContext } from "../context/tabs";

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
  // const intl = useIntl();
  // const { addTab, selectTab } = useTabsContext();
  // const router = useRouter();
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
      const market = (markets && markets[position.pair]) || 0;
      const total = Number(available || 0) + (Number(locked || 0) || 0);
      const profit = market * total - position.investment;
      return {
        ...position,
        market,
        profitPercent:
          position.investment > 0
            ? (profit * 100) / (position.investment || 1)
            : 0,
        profit,
        total,
      };
    });
  }, [data, markets]);

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

  // const totalPnlRender = useMemo(() => <TotalPnl />, []);
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
  return useMemo(
    () => (
      <div className="flex-1 flex flex-col h-full">
        <Head>
          <title>Positions - Prycto</title>
          <meta name="description" content="Positions - Prycto" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {/* {totalPnlRender} */}
        <AddPosition
          open={addPosisitonShowing}
          onSubmit={(e) => {
            addPosition({ variables: e });
          }}
          onCancel={() => {
            setAddPositionShowing(false);
          }}
        />
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
        <div className="flex-1 flex flex-col">
          <div className="w-full">
            {/* <Table
            columns={[
              {
                Header: intl.formatMessage({ id: "pairs" }),
                accessor: "pair",
                Cell: ({ row }: any) => {
                  return useMemo(
                    () => (
                      <>
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
                            const pathname = `/tradingview/${row.original._id}?pair=${row.original.pair}`;
                            addTab({
                              key: row.original.pair,
                              label: row.original.pair,
                              canClose: true,
                              exchange: exchange,
                              href: pathname,
                            });
                            router.push(pathname);
                            selectTab(row.original.pair);
                          }}
                        >
                          {row.original.pair}
                        </Button>
                      </>
                    ),
                    []
                  );
                },
              },
              {
                id: "graph",
                Cell: ({ row }: any) => {
                  return <Graph symbol={row.original.pair} market={row.original.market} />;
                },
              },
              {
                Header: intl.formatMessage({ id: "amount" }),
                accessor: "total",
                Cell: ({ value }) => {
                  return <HideShow>{round(value, 7)}</HideShow>;
                },
              },
              {
                Header: intl.formatMessage({ id: "averagePrice" }),
                id: "averagePrice",
                Cell: ({ row }: any) => {
                  return (
                    <>
                      <HideShow>
                        {round(
                          row.original.total === 0
                            ? 0
                            : row.original.investment / row.original.total,
                          8
                        )}
                      </HideShow>
                    </>
                  );
                },
              },
              {
                Header: intl.formatMessage({ id: "market" }),
                accessor: "market",
              },
              {
                Header: intl.formatMessage({ id: "investment" }),
                accessor: "investment",
                Cell: ({ value, row }: any) => {
                  return (
                    <>
                      <HideShow>{round(value)}</HideShow> /{" "}
                      <span className="text-gray-400">
                        <HideShow>
                          {round(row.original.market * row.original.total)}
                        </HideShow>
                      </span>
                    </>
                  );
                },
              },
              {
                Header: intl.formatMessage({ id: "profit" }),
                accessor: "profitPercent",
                Cell: ({ value, row }: any) => {
                  return (
                    <div
                      className={classnames("py-2", "px-6", "flex-1", {
                        "text-green-500": row.original.profit >= 0,
                        "text-red-600": row.original.profit < 0,
                      })}
                    >
                      <HideShow>{round(row.original.profit)}</HideShow>{" "}
                      <div className="block md:hidden" />({round(value)}
                      %)
                    </div>
                  );
                },
              },
              {
                Header: intl.formatMessage({ id: "goal" }),
                accessor: "objectif",
              },
            ]}
            data={positionsOriginal}
          /> */}
            <div className="w-full border-b-2 border-gray-900 text-gray-200 flex flex-row items-center">
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
              {/* <div
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer hidden md:flex"
                onClick={handleSort("objectif")}
              >
                <FormattedMessage id="goal" /> (
                <HideShow>
                  {round(
                    positionsOriginal.reduce((acc, { objectif, total }) => {
                      acc += (objectif || 0) * total;
                      return acc;
                    }, 0)
                  )}
                </HideShow>
                )
                {sort &&
                  sort.key === "objectif" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)}
              </div> */}
              {/* <div
                className="py-4 px-6 font-bold uppercase w-40 text-sm hidden md:flex md:justify-center"
              >
                <FormattedMessage id="prediction" />
                <br />
                (<FormattedDate value={addDays(Date.now(), 1)} />)
              </div> */}
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
    ),
    [addPosisitonShowing, positionsOriginal, sort]
  );
};

export default Positions;
