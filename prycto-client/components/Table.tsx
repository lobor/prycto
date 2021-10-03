import { useEffect } from "react";
import {
  useTable,
  Column,
  useFlexLayout,
  useSortBy,
  UseSortByColumnOptions,
} from "react-table";
import { AutoSizer } from "react-virtualized";
import SimpleBarReact from "simplebar-react";

interface TableProps<D extends Record<string, any> = {}> {
  columns: (Column<D> & UseSortByColumnOptions<D>)[];
  data: D[];
}

const Table = ({ columns, data }: TableProps) => {
  const tableInstance = useTable(
    {
      columns,
      data,
      autoResetSortBy: false,
    } as any,
    useFlexLayout,
    useSortBy
  );
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  useEffect(() => {
    if (process.browser) {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 500);
    }
  }, [process.browser]);
  return (
    <table
      {...getTableProps({
        className: "flex-1 flex flex-col table-auto w-full text-gray-200",
      })}
    >
      <thead className="flex">
        {headerGroups.map((headerGroup) => (
          <tr
            {...headerGroup.getHeaderGroupProps({
              className: "text-left flex-1 flex bg-gray-900 text-gray-200",
            })}
          >
            {headerGroup.headers.map((column: any) => (
              <th
                {...column.getHeaderProps({
                  ...column.getSortByToggleProps(),
                  className:
                    "flex-1 py-4 px-6 font-bold uppercase text-sm flex align-middle",
                })}
              >
                {column.render("Header")}
                <span>
                  {column.isSorted
                    ? column.isSortedDesc
                      ? "\u21E3"
                      : "\u21E1"
                    : ""}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps({ className: "flex-1" })}>
        <AutoSizer>
          {({ height, width }) => (
            <SimpleBarReact
              className="flex-1"
              style={{ height, width }}
              forceVisible="y"
              autoHide={false}
            >
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps({
                      className:
                        "flex hover:bg-gray-900 text-gray-200 border-b border-gray-900",
                    })}
                  >
                    {row.cells.map((cell) => {
                      return (
                        <td
                          {...cell.getCellProps({
                            className: "flex-1 flex align-middle py-2 px-6",
                          })}
                        >
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </SimpleBarReact>
          )}
        </AutoSizer>
      </tbody>
    </table>
  );
};

export default Table;
