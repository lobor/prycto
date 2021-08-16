import AutocompleteMarket from "./AutocompleteMarket";
import { useTabsContext } from "../context/tabs";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import Select from "./Select";
import Tabs from "./Tabs";
import { useRouter } from "next/dist/client/router";
import { useHideShow } from "../context/hideShow";
import { ExchangesDocument, ExchangesQuery } from "../generated/graphql";
import { useExchange } from "../context/exchange";
import {
  AiFillExperiment,
  AiFillEye,
  AiFillEyeInvisible,
  AiOutlineLogout,
  AiOutlineSetting,
  AiOutlineWallet,
} from "react-icons/ai";
import { GiTwoCoins } from "react-icons/gi";
import { FormattedMessage, useIntl } from "react-intl";
import SelectLang from "./SelectLang";
import PryctoLogo from "./PryctoLogo";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { Transition } from "@headlessui/react";

interface NavProps {
  children?: ReactNode;
  hide?: boolean;
}

const Nav = ({ children, hide }: NavProps) => {
  const { exchangeId, setExchangeId, name, loading } = useExchange();
  const [isShowing, setIsShowing] = useState(true);
  const { isHide, setHide } = useHideShow();
  const router = useRouter();
  const { addTab, selectTab } = useTabsContext();
  const { data } = useQuery<ExchangesQuery>(ExchangesDocument, {
    skip: loading,
  });
  const intl = useIntl();

  useEffect(() => {
    const handleRouteStart = () => {
      setIsShowing(false);
    };
    const handleRouteEnd = () => {
      setIsShowing(true);
    };

    router.events.on("routeChangeStart", handleRouteStart);
    router.events.on("routeChangeComplete", handleRouteEnd);

    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteEnd);
    };
  }, []);

  return (
    <div className="flex flex-row h-full w-full">
      {!hide && (
        <ul className="text-gray-500 flex-none hidden md:flex flex-col bg-gray-900 w-30">
          <li>
            <Link href="/positions">
              <a
                title="Prycto"
                className="px-4 py-2 text-2xl flex-col flex items-center hover:text-gray-200"
              >
                <PryctoLogo className="max-h-12 w-auto ml-1 mr-2" />
              </a>
            </Link>
          </li>
          <li>
            <Link href="/exchange">
              <a
                className="px-4 py-2 text-2xl flex-col flex items-center hover:text-gray-200"
                role="menuitem"
                id="menu-item-2"
                title={intl.formatMessage({ id: "exchanges" })}
                onClick={() => {
                  addTab({
                    key: "exchange",
                    label: intl.formatMessage({ id: "exchanges" }),
                    canClose: true,
                    href: "/exchange",
                  });
                  selectTab("exchange");
                }}
              >
                <AiOutlineWallet />
                <span className="text-sm">
                  <FormattedMessage id="exchanges" />
                </span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/balances">
              <a
                className="px-4 py-2 text-2xl hover:text-gray-200 flex-col flex items-center"
                role="menuitem"
                id="menu-item-2"
                title={intl.formatMessage({ id: "balances" })}
                onClick={() => {
                  addTab({
                    key: "balances",
                    label: intl.formatMessage({ id: "balances" }),
                    canClose: true,
                    href: "/balances",
                  });
                  selectTab("balances");
                }}
              >
                <GiTwoCoins />
                <span className="text-sm">
                  <FormattedMessage id="balances" />
                </span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/predicts">
              <a
                className="px-4 py-2 text-2xl hover:text-gray-200 flex-col flex items-center"
                role="menuitem"
                id="menu-item-2"
                title={intl.formatMessage({ id: "predicts" })}
                onClick={() => {
                  addTab({
                    key: "predicts",
                    label: intl.formatMessage({ id: "predicts" }),
                    canClose: true,
                    href: "/predicts",
                  });
                  selectTab("predicts");
                }}
              >
                <AiFillExperiment />
                <span className="text-sm">
                  <FormattedMessage id="predicts" />
                </span>
              </a>
            </Link>
          </li>
          <li className="flex-1" />
          <li>
            <Link href="/settings">
              <a
                className="px-4 py-2 text-2xl hover:text-gray-200 flex-col flex items-center"
                role="menuitem"
                id="menu-item-2"
                title={intl.formatMessage({ id: "settings" })}
                onClick={() => {
                  addTab({
                    key: "settings",
                    label: intl.formatMessage({ id: "settings" }),
                    canClose: true,
                    href: "/settings",
                  });
                  selectTab("settings");
                }}
              >
                <AiOutlineSetting />
                <span className="text-sm">
                  <FormattedMessage id="settings" />
                </span>
              </a>
            </Link>
          </li>
          <li className="justify-self-end">
            <button
              type="submit"
              className="w-full text-left text-2xl flex items-center flex-col px-4 py-2 text-sm hover:text-gray-200"
              role="menuitem"
              id="menu-item-3"
              title={intl.formatMessage({ id: "logout" })}
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
            >
              <AiOutlineLogout />
              <span className="text-sm">
                <FormattedMessage id="logout" />
              </span>
            </button>
          </li>
        </ul>
      )}

      <div className="flex flex-1 flex-col">
        {!hide && (
          <nav className="bg-gray-900 pt-2 md:pt-1 pb-1 px-1 w-full z-10">
            <div className="flex flex-1 items-baseline md:flex-row md:items-center">
              <div className="flex w-full md:w-2/12 justify-center md:justify-start">
                <div className="flex md:max-w-lg justify-center md:justify-start text-white flex-1 mr-1 md:mr-0">
                  <AutocompleteMarket
                    icon
                    type="search"
                    placeholder={intl.formatMessage({ id: "searchPairs" })}
                    onSelect={(key) => {
                      const { symbol } = key;
                      const pathname = `/tradingview/?pair=${symbol}`;
                      addTab({
                        key: `${symbol.toLowerCase()}`,
                        label: symbol,
                        canClose: true,
                        exchange: name,
                        href: pathname,
                      });
                      selectTab(symbol.toLowerCase());
                      router.push(pathname);
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full md:flex-1 md:flex-row items-center">
                <Tabs />
                <div className="flex h-12 md:justify-end mt-2 md:mt-0">
                  <button
                    className="hidden md:block px-3 self-stretch focus:outline-none text-gray-200"
                    onClick={() => {
                      setHide(!isHide);
                    }}
                  >
                    {!isHide && <AiFillEye />}
                    {isHide && <AiFillEyeInvisible />}
                  </button>
                  <div className="inline-block mr-3 flex-1">
                    <Select
                      className="w-full"
                      placeholder={<FormattedMessage id="exchanges" />}
                      value={
                        data &&
                        data.exchanges
                          .map(({ _id, name }) => ({
                            value: _id,
                            label: name,
                          }))
                          .find(({ value }) => value === exchangeId)
                      }
                      onChange={(value) => {
                        if (value) {
                          setExchangeId(value);
                        }
                      }}
                      options={
                        (data &&
                          data.exchanges.map(({ _id, name }) => ({
                            value: _id,
                            label: name,
                          }))) ||
                        []
                      }
                    />
                  </div>
                  <div className="mr-3 flex-1">
                    <SelectLang />
                  </div>
                </div>
                <div
                  className="h-0 block md:hidden"
                  style={{ flexBasis: "100%" }}
                />
              </div>
            </div>
          </nav>
        )}
        <Transition
          show={isShowing}
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="main-content bg-gray-800 flex flex-1 w-full getDiv overflow-hidden flex-col p-2">
            {children}
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default Nav;
