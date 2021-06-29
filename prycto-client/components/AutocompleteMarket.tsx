import { ChangeEvent, useEffect, useRef, useState } from "react";
import { filter } from "fuzzy";
import { classnames } from "tailwindcss-classnames";
import List from "react-virtualized/dist/commonjs/List";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import Input from "./Input";
import { useQuery } from "@apollo/client";
import { GetPairsDocument, GetPairsQuery, Pair } from "../generated/graphql";

interface AutocompleteMarketProps {
  icon?: boolean;
  placeholder?: string;
  type?: string;
  value?: Pair;
  onSelect?: (key: Pair) => void;
}
const AutocompleteMarket = ({
  icon,
  placeholder,
  type,
  onSelect,
  value,
}: AutocompleteMarketProps) => {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const { data } = useQuery<GetPairsQuery>(GetPairsDocument)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    if (data) {
      setPairs(
        filter(value, data.getPairs, {
          extract: function (el) {
            return el.symbol;
          },
        }).map(({ original }) => original)
      );
    }
  };

  useEffect(() => {
    return () => {
      if (
        data &&
        Array.isArray(data.getPairs) &&
        data.getPairs.length > 0
      ) {
        localStorage.setItem("allPairs", JSON.stringify(data.getPairs));
      }
    };
  }, []);

  const handleSelect = (params: Pair) => () => {
    if (onSelect) {
      onSelect(params);
    }
  };

  return (
    <span className="relative w-full">
      <Input
        id="searchPairs"
        onChange={handleChange}
        onFocus={() => {
          setShow(true);
        }}
        onBlur={(e) => {
          e.currentTarget.value = "";
          if (data) {
            setTimeout(() => {
              if (data.getPairs) {
                setPairs(data.getPairs);
              }
              setShow(false);
            }, 200);
          }
        }}
        value={value && value.symbol}
        type={type || "text"}
        placeholder={placeholder}
        className={`w-full bg-gray-900 text-white transition border border-transparent focus:outline-none focus:border-gray-400 rounded py-3 px-2 appearance-none leading-normal ${classnames(
          { "pl-10": icon }
        )}`}
      />
      {icon && (
        <div
          className="absolute search-icon"
          style={{ top: "1rem", left: ".8rem" }}
        >
          <svg
            className="fill-current pointer-events-none text-white w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"></path>
          </svg>
        </div>
      )}
      {show && (
        <div className="absolute z-10 bg-gray-900 w-full h-80 overflow-auto">
          <AutoSizer>
            {({ width, height }) => (
              <List
                ref="List"
                height={height}
                rowCount={pairs.length}
                rowHeight={32}
                rowRenderer={({ index, key, style }) => {
                  const { symbol } = pairs[index];
                  return (
                    <button
                      key={key}
                      style={style}
                      className="text-left px-2 py-1 hover:bg-gray-800 cursor-pointer block w-full"
                      onClick={handleSelect(pairs[index])}
                      type="button"
                    >
                      {symbol}
                    </button>
                  );
                }}
                width={width}
              />
            )}
          </AutoSizer>
        </div>
      )}
    </span>
  );
};

export default AutocompleteMarket;
