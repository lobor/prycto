import classNames, { TArg } from "tailwindcss-classnames";
import Link from "next/link";
import { useTabsContext } from "../context/tabs";
import { AiOutlineClose } from "react-icons/ai";
import { Transition } from "@headlessui/react";
import { Fragment } from "react";

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
              <Transition
                key={key}
                as={Fragment}
                appear={true}
                show
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <li
                  className={classNames(
                    "mr-3",
                    "px-3",
                    "cursor-pointer",
                    "border-b-2",
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
              </Transition>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Tabs;
