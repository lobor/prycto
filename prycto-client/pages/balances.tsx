import { useMutation, useQuery } from "@apollo/client";
import { FormattedMessage, useIntl } from "react-intl";
import { useExchange } from "../context/exchange";
import Head from "next/head";
import {
  BalancesByExchangeIdDocument,
  BalancesByExchangeIdQuery,
  BalancesByExchangeIdQueryVariables,
  UpdateExchangeDocument,
} from "../generated/graphql";
import HideShow from "../components/HideShow";
import Table from "../components/Table";
import Input from "../components/Input";
import { useFormik } from "formik";
import * as Yup from "yup";
import round from "../utils/round";

const EditCell = ({
  value,
  row,
}: {
  value: number;
  row: {
    original: {
      exchangeId: string;
      quote: string;
      locked: number;
      available: number;
    };
  };
}) => {
  const { original } = row;
  const [updateExchange] = useMutation(UpdateExchangeDocument);
  const formik = useFormik({
    validationSchema: Yup.object({ [original.quote]: Yup.number() }),
    initialValues: { [original.quote]: value },
    onSubmit: () => {},
  });
  const handleSave = (e: any) => {
    if (Number(formik.values[original.quote]) || Number(formik.values[original.quote]) === 0) {
      updateExchange({
        variables: {
          _id: original.exchangeId,
          balance: { [original.quote]: Number(formik.values[original.quote]) },
        },
      });
    } else {
      formik.setFieldValue(original.quote, value);
    }
  };
  return (
    <span className="flex flex-col flex-1">
      <HideShow>
        <Input
          name={original.quote}
          value={formik.values[original.quote]}
          error={formik.errors[original.quote]}
          onChange={formik.handleChange}
          onBlur={handleSave}
        />
      </HideShow>
    </span>
  );
};
const Balances = () => {
  const intl = useIntl();
  const { exchangeId, loading: loadingExchange } = useExchange();
  const { data, loading } = useQuery<
    BalancesByExchangeIdQuery,
    BalancesByExchangeIdQueryVariables
  >(BalancesByExchangeIdDocument, {
    variables: { _id: exchangeId },
    skip: !exchangeId || loadingExchange,
  });

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
                return <HideShow>{round(value, 7)}</HideShow>;
              },
            },
            {
              Header: intl.formatMessage({ id: "balance.locked" }),
              accessor: "locked",
              Cell: EditCell,
            },
          ]}
          data={Object.keys(data.exchangeById.balance || {}).map((quote) => {
            const { locked, available } = data.exchangeById.balance[quote];
            return {
              exchangeId: data.exchangeById._id,
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
