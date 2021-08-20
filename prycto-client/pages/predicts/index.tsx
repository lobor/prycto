import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useState } from "react";
import {
  AiOutlineCaretDown,
  AiOutlineCaretUp,
  AiOutlineDash,
} from "react-icons/ai";
import { FormattedDate, FormattedMessage } from "react-intl";
import Select from "../../components/Select";
import { useExchange } from "../../context/exchange";
import {
  PredictDocument,
  PredictQuery,
  PredictQueryVariables,
} from "../../generated/graphql";
import round from "../../utils/round";

const PredictPage = () => {
  const [sort, setSort] = useState("upMax");
  const { exchangeId } = useExchange();
  const { data, loading } = useQuery<PredictQuery, PredictQueryVariables>(
    PredictDocument,
    {
      variables: { exchangeId },
      skip: !exchangeId,
    }
  );
  const options = [
    { label: "up max", value: "upMax" },
    { label: "down max", value: "downMax" },
  ];
  return (
    <div className="text-gray-200">
      <div className="text-xl my-4 flex">
        <span className="flex-1">
          <FormattedMessage id="predict.description" />
        </span>
        <div>
          <div><Link href="/predicts/history"><a title="">History predict</a></Link></div>
          <div>
            <Select
              className="text-sm"
              placeholder="Trie"
              options={options}
              value={options.find(({ value }) => value === sort)}
              onChange={(e: string) => {
                setSort(e);
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex-wrap justify-start flex">
        {loading && <div>Loading</div>}
        {((data && [...data.positions]) || [])
          .sort((a, b) => {
            if (sort === "upMax") {
              return b.predict.up - a.predict.up;
            } else if (sort === "downMax") {
              return b.predict.down - a.predict.down;
            } else {
              return 0;
            }
          })
          .map(({ pair: symbol, predict: { up, down, predictDate } }, i) => {
            const isUp = up > down;
            const isUnknown = up === down;
            return (
              <div
                key={`predict-${symbol}`}
                className={`p-2 m-1 border-2 w-1/12 rounded-md ${
                  isUnknown
                    ? "border-yellow-500"
                    : isUp
                    ? "border-green-500"
                    : "border-red-600"
                }`}
              >
                <div className="text-center">
                  {symbol}
                  <br />
                  <FormattedDate value={predictDate} />
                </div>
                <div
                  className={`text-center flex justify-center text-6xl ${
                    isUnknown
                      ? "border-yellow-500"
                      : isUp
                      ? "text-green-500"
                      : "text-red-600"
                  }`}
                >
                  {isUnknown ? (
                    <AiOutlineDash />
                  ) : isUp ? (
                    <AiOutlineCaretUp />
                  ) : (
                    <AiOutlineCaretDown />
                  )}
                </div>
                <div className="text-sm flex justify-between">
                  <span>up: {round(up * 100, 0)}%</span>
                  <span>down: {round(down * 100, 0)}%</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default PredictPage;
