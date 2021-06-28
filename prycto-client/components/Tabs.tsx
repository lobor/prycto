import classNames, { TArg } from "tailwindcss-classnames";
import Link from 'next/link';
import { useTabsContext } from "../context/tabs";

const Tabs = () => {
  const { tabs, selected, removeTab, selectTab } = useTabsContext();

  return (
    <div className="bg-gray-800 bottom-0 w-full">
      <div className="content-center md:content-start text-left">
        <ul className="list-reset flex flex-row py-0 pt-0 px-1 text-center md:text-left">
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
              <Link href={href} key={key}>
                <li
                  className={classNames(
                    "mr-3",
                    "px-3",
                    "cursor-pointer",
                    "border-b-2",
                    ...className
                  )}
                >
                  <div
                    className="block py-1 md:py-3 pl-1 pr-1 align-middle text-white no-underline"
                    onClick={() => {
                      selectTab(key);
                    }}
                  >
                    <span className="pb-1 md:pb-0 text-xs md:text-base text-white md:text-white block md:inline-block">
                      {label}
                    </span>
                    {canClose && (
                      <button
                        className="ml-1 hover:bg-gray-500 p-1 inline-block leading-none"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeTab(key);
                        }}
                      >
                        X
                      </button>
                    )}
                  </div>
                </li>
              </Link>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Tabs;
