import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import AddExchange from "../components/AddExchange";
import Table from "../components/Table";
import { useMutation, useQuery } from "@apollo/client";
import {
  AddExchangeDocument,
  AddExchangeMutation,
  AddExchangeMutationVariables,
  ExchangesDocument,
  ExchangesQuery,
  RemoveExchangeDocument,
  RemoveExchangeMutation,
  RemoveExchangeMutationVariables,
} from "../generated/graphql";
import { FormattedMessage, useIntl } from "react-intl";
import { AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";

export default function Exchange() {
  const intl = useIntl();
  const [addExchangeShowing, setAddExchangeShowing] = useState(false);
  const { data: exchanges, refetch: getExchanges } =
    useQuery<ExchangesQuery>(ExchangesDocument);
  const [addExchange] = useMutation<
    AddExchangeMutation,
    AddExchangeMutationVariables
  >(AddExchangeDocument, {
    onCompleted: () => {
      getExchanges();
      setAddExchangeShowing(false);
    },
  });

  const [removeExchanges] = useMutation<
    RemoveExchangeMutation,
    RemoveExchangeMutationVariables
  >(RemoveExchangeDocument, {
    onCompleted: () => {
      getExchanges();
    },
  });
  
  return (
    <>
      <Head>
        <title>Exchange - Prycto</title>
        <meta name="description" content="Exchange configuration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AddExchange
        open={addExchangeShowing}
        onSubmit={(e) => {
          addExchange({ variables: e as any });
        }}
        onCancel={() => {
          setAddExchangeShowing(false);
        }}
      />
      <div className="shadow-md mt-6 h-full flex">
        <Table
          data={(exchanges && exchanges.exchanges) || []}
          columns={[
            {
              Header: intl.formatMessage({ id: "exchanges" }),
              accessor: "name",
            },
            {
              Header: () => {
                return (
                  <Button
                    variant="validate"
                    onClick={() => {
                      setAddExchangeShowing(true);
                    }}
                  >
                    <AiOutlinePlus />
                  </Button>
                );
              },
              width: 5,
              // width: 50,
              accessor: "_id",
              Cell: ({ value }: { value: string }) => {
                return (
                  <Button
                    onClick={() => {
                      removeExchanges({ variables: { _id: value } });
                    }}
                  >
                    <AiOutlineDelete />
                  </Button>
                );
              },
            },
          ]}
        />
      </div>
    </>
  );
}
