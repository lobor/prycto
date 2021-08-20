import { useQuery } from "@apollo/client";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { FormattedDate } from "react-intl";
import Table from "../../components/Table";
import {
  PredictHistoryDocument,
  PredictHistoryQuery,
  PredictHistoryQueryResult,
  PredictHistoryQueryVariables,
} from "../../generated/graphql";
import { useTable, Column } from "react-table";
import { useMemo } from "react";
import { AutoSizer } from "react-virtualized";
import SimpleBarReact from "simplebar-react";

const HistoryPredict = () => {
  const { data, loading } = useQuery<
    PredictHistoryQuery,
    PredictHistoryQueryVariables
  >(PredictHistoryDocument);
  const columns = useMemo(() => {
    return [
      {
        Header: "Pair",
        accessor: "pair", // accessor is the "key" in the data
      },
      {
        Header: "Predict date",
        accessor: "predictDate", // accessor is the "key" in the data
        Cell: ({ value }: any) => {
          return <FormattedDate value={value} />;
        },
      },
      {
        Header: "Verified",
        accessor: "verified", // accessor is the "key" in the data
        Cell: ({ value }: any) => {
          return (
            <span className={value ? "text-green-500" : "text-red-500"}>
              {value ? <AiOutlineCheck /> : <AiOutlineClose />}
            </span>
          );
        },
      },
    ];
  }, []);
  const tableInstance = useTable({
    columns,
    data: (data && data.predictHistory) || [],
  });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;
  return (
    <div className="flex flex-col h-full">
      <h1 className="text-xl text-gray-200 font-bold">History predict</h1>
      <Table columns={columns} data={(data && data.predictHistory) || []} />
    </div>
  );
};

export default HistoryPredict;
