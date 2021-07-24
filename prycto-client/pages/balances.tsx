import { useQuery } from "@apollo/client";
import { FormattedMessage } from "react-intl";
import { useExchange } from "../context/exchange";
import Head from "next/head";
import {
  BalancesByExchangeIdDocument,
  BalancesByExchangeIdQuery,
  BalancesByExchangeIdQueryVariables,
} from "../generated/graphql";
import HideShow from "../components/HideShow";
import round from "../utils/round";
import SimpleBarReact from "simplebar-react";
import { AutoSizer } from "react-virtualized";

const Balances = () => {
  const { exchangeId, loading: loadingExchange } = useExchange();
  const { data, loading } = useQuery<
    BalancesByExchangeIdQuery,
    BalancesByExchangeIdQueryVariables
  >(BalancesByExchangeIdDocument, {
    variables: { _id: exchangeId },
    skip: !exchangeId || loadingExchange,
  });

  // const handleSort = (key: string) => () => {
  //   if (positionsOriginal) {
  //     const sortTmp = {
  //       ...sort,
  //       sort: sort.sort === "asc" ? "desc" : "asc",
  //       key,
  //     };
  //     setSort(sortTmp);
  //     setPositions(sortFunction(sortTmp)(positionsOriginal));
  //   }
  // };

  return (
    <div className="flex-1 flex flex-col">
      <Head>
        <title>Balances - Prycto</title>
        <meta name="description" content="Balances - Prycto" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {loading && (
        <div>
          <FormattedMessage id="loading" />
        </div>
      )}
      {!loading && data && (
        <>
          <div className="w-full">
            <div className="w-full bg-gray-900 text-gray-200 flex flex-row items-center">
              <div
                // onClick={handleSort("pair")}
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer"
              >
                <FormattedMessage id="balance.token" />
                {/* {sort.key === "pair" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)} */}
              </div>
              <div
                // onClick={handleSort("pair")}
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer"
              >
                <FormattedMessage id="balance.available" />
                {/* {sort.key === "pair" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)} */}
              </div>
              <div
                // onClick={handleSort("pair")}
                className="flex-1 py-4 px-6 font-bold uppercase text-sm cursor-pointer"
              >
                <FormattedMessage id="balance.locked" />
                {/* {sort.key === "pair" &&
                  (sort.sort === "desc" ? "\u21E3" : `\u21E1`)} */}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <AutoSizer>
              {({ width, height }) => (
                <SimpleBarReact
                  autoHide
                  style={{ width, height }}
                >
                  {Object.keys(data.exchangeById.balance).map((quote) => {
                    const { locked, available } =
                      data.exchangeById.balance[quote];
                    return (
                      <div
                        key={quote}
                        className="hover:bg-gray-900 text-gray-200 border-b border-gray-900 flex items-center"
                      >
                        <div className="py-2 px-6 hidden md:block flex-1">
                          {quote}
                        </div>
                        <div className="py-2 px-6 hidden md:block flex-1">
                          <HideShow>{round(available, 7)}</HideShow>
                        </div>
                        <div className="py-2 px-6 hidden md:block flex-1">
                          <HideShow>{locked}</HideShow>
                        </div>
                      </div>
                    );
                  })}
                </SimpleBarReact>
              )}
            </AutoSizer>
          </div>
        </>
      )}
    </div>
  );
};

export default Balances;
