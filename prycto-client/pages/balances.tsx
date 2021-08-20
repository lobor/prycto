import { useQuery } from "@apollo/client";
import { FormattedMessage, useIntl } from "react-intl";
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
import { useMemo, useState } from "react";
import Table from "../components/Table";

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

const Balances = () => {
  const intl = useIntl();
  const { exchangeId, loading: loadingExchange } = useExchange();
  const [sort, setSort] = useState<{ sort: string; key: string }>({
    sort: "asc",
    key: "quote",
  });
  const { data, loading } = useQuery<
    BalancesByExchangeIdQuery,
    BalancesByExchangeIdQueryVariables
  >(BalancesByExchangeIdDocument, {
    variables: { _id: exchangeId },
    skip: !exchangeId || loadingExchange,
  });

  const handleSort = (key: string) => () => {
    const sortTmp = {
      ...sort,
      sort: sort && sort.sort === "asc" ? "desc" : "asc",
      key,
    };
    setSort(sortTmp);
  };

  const balances = useMemo(() => {
    if (data && data.exchangeById) {
      return Object.keys(data.exchangeById.balance).map((quote) => {
        return {
          ...data.exchangeById.balance[quote],
          quote,
        };
      });
    }
    return [];
  }, [data]);

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
        <Table
          columns={[
            {
              Header: intl.formatMessage({ id: "balance.token" }),
              accessor: "quote",
            },
            {
              Header: intl.formatMessage({ id: "balance.available" }),
              accessor: "available",
              Cell: ({ value }: { value: number }) => {
                return <HideShow>{round(value, 7)}</HideShow>
              }
            },
            {
              Header: intl.formatMessage({ id: "balance.locked" }),
              accessor: "locked",
              Cell: ({ value }: { value: number }) => {
                return <HideShow>{round(value, 7)}</HideShow>
              }
            },
          ]}
          data={Object.keys(data.exchangeById.balance || {}).map((quote) => {
            const { locked, available } = data.exchangeById.balance[quote];
            return {
              quote,
              locked,
              available,
            };
          })}
        />
      )}
    </div>
  );
};

export default Balances;
