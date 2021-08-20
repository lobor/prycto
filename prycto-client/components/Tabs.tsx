import classNames, { TArg } from "tailwindcss-classnames";
import Link from "next/link";
import { useTabsContext } from "../context/tabs";
import { AiOutlineClose } from "react-icons/ai";
import { AutoSizer } from "react-virtualized";

const Tabs = () => {
  const { tabs, selected, removeTab, selectTab } = useTabsContext();
  return (
    <div className="flex flex-1 md:w-1 md:order-first">
      <AutoSizer disableHeight>
        {({ width }) => (
          <ul
            style={{ width }}
            className="bottom-0 flex flex-grow flex-row py-0 pt-0 overflow-x-auto px-1 text-left"
          >
            {tabs.map(({ key, canClose, label, exchange, href }) => {
              const className: TArg[] = [];
              if (key === selected) {
                className.push("border-blue-500" as TArg);
              } else {
                className.push(
                  "hover:border-blue-500" as TArg,
                  "border-transparent" as TArg
                );
              }
              return (
                <li
                  className={classNames(
                    "mr-3",
                    "px-3",
                    "cursor-pointer",
                    "border-b-2",
                    "inline-block",
                    "whitespace-nowrap",
                    ...className
                  )}
                >
                  <Link href={href}>
                    <a title={label as string}>
                      <div
                        className="py-5 md:py-5 pl-1 pr-1 text-white no-underline flex items-center"
                        onClick={() => {
                          selectTab(key);
                        }}
                      >
                        {exchange && (
                          <img
                            src={`/${exchange.toLowerCase()}.ico`}
                            className="inline-block mr-2"
                            width="20"
                            alt={exchange}
                          />
                        )}
                        <span className="text-xs md:text-base text-white md:text-white block md:inline-block">
                          {label}
                        </span>
                        {canClose && (
                          <button
                            className="ml-1 hover:bg-gray-900 inline-block leading-none text-xs rounded-full p-1"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeTab(key);
                            }}
                          >
                            <AiOutlineClose />
                          </button>
                        )}
                      </div>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </AutoSizer>
    </div>
  );
};

export default Tabs;
