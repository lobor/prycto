import Head from "next/head";
import { useState } from "react";
import Button from "../components/Button";
import AddExchange from "../components/AddExchange";
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

export default function Exchange() {
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
    <div>
      <Head>
        <title>Exchange - Prycto</title>
        <meta name="description" content="Exchange configuration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {addExchangeShowing && (
        <AddExchange
          onSubmit={(e) => {
            addExchange({ variables: e });
          }}
          onCancel={() => {
            setAddExchangeShowing(false);
          }}
        />
      )}
      <div className="shadow-md mt-6 hidden md:block">
        <table className="table-auto text-left w-full border-collapse">
          <thead>
            <tr className="bg-gray-900 text-gray-200">
              <th className="py-4 px-6 font-bold uppercase text-sm">Echange</th>
              <th className="w-1/12 py-4 px-6 font-bold uppercase text-sm">
                <Button
                  variant="validate"
                  onClick={() => {
                    setAddExchangeShowing(true);
                  }}
                >
                  Add
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {exchanges &&
              exchanges.exchanges.map((exchange) => {
                return (
                  <tr
                    key={exchange._id}
                    className="hover:bg-gray-900 text-gray-200 border-b border-gray-900"
                  >
                    <td className="py-2 px-6 ">{exchange.name}</td>
                    <td className="py-2 px-6">
                      <Button
                        onClick={() => {
                          removeExchanges({ variables: { _id: exchange._id } });
                        }}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
