import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useEmit, useSocket } from "socketio-hooks";
import { filter } from "fuzzy";
import { classnames } from "tailwindcss-classnames";
import List from "react-virtualized/dist/commonjs/List";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import Input from "./Input";

interface AutocompleteMarketProps {
  icon?: boolean;
  placeholder?: string;
  type?: string;
  value?: { exchange: string; pair: string };
  onSelect?: (key: { exchange: string, pair: string }) => void;
}
const AutocompleteMarket = ({
  icon,
  placeholder,
  type,
  onSelect,
  value,
}: AutocompleteMarketProps) => {
  const originalPairs = useRef<{ pair: string; exchange: string }[]>();
  const [pairs, setPairs] = useState<{ pair: string; exchange: string }[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const getAllPairs = useEmit("getAllPairs");

  useSocket("getAllPairs", (msg) => {
    originalPairs.current = msg;
    setPairs(msg);
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    if (originalPairs.current) {
      setPairs(
        filter(value, originalPairs.current, {
          extract: function (el) {
            return el.pair;
          },
        }).map(({ original }) => original)
      );
    }
  };

  useEffect(() => {
    console.log(show, originalPairs.current)
    if (show && (!originalPairs.current || originalPairs.current.length === 0)) {
      getAllPairs();
    }
  }, [show]);

  useEffect(() => {
    return () => {
      if (
        originalPairs.current &&
        Array.isArray(originalPairs.current) &&
        originalPairs.current.length > 0
      ) {
        localStorage.setItem("allPairs", JSON.stringify(originalPairs.current));
      }
    };
  }, []);

  const handleSelect = (params: { exchange: string, pair: string }) => () => {
    if (onSelect) {
      onSelect(params);
    }
  }

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
          setTimeout(() => {
            if (originalPairs.current) {
              setPairs(originalPairs.current);
            }
            setShow(false);
          }, 200);
        }}
        value={value && value.pair}
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
                  const { exchange, pair } = pairs[index];
                  return (
                    <button
                      key={key}
                      style={style}
                      className="text-left px-2 py-1 hover:bg-gray-800 cursor-pointer block w-full"
                      onClick={handleSelect({ exchange, pair })}
                      type="button"
                    >
                      <img
                        src={`${exchange}.ico`}
                        alt={exchange}
                        className="inline mr-1 align-text-top "
                        style={{ height: "16px" }}
                      />
                      {pair}
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
