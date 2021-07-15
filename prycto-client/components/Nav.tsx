import AutocompleteMarket from "./AutocompleteMarket";
import { useTabsContext } from "../context/tabs";
import { useQuery, gql, useApolloClient } from "@apollo/client";
import Link from "next/link";
import Select from "./Select";
import Tabs from "./Tabs";
import { useRouter } from "next/dist/client/router";
import { useHideShow } from "../context/hideShow";
import { ExchangesDocument, ExchangesQuery } from "../generated/graphql";
import { useEffect } from "react";
import { useExchange } from "../context/exchange";
import Dropdown from "./Dropdown";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const Nav = () => {
  const client = useApolloClient();
  const { exchangeId, setExchangeId, name } = useExchange();
  const { isHide, setHide } = useHideShow();
  const router = useRouter();
  const { addTab, selectTab } = useTabsContext();
  const { data, loading } = useQuery<ExchangesQuery>(ExchangesDocument);

  useEffect(() => {
    if (exchangeId) {
      client.resetStore();
    }
  }, [exchangeId]);
  return (
    <nav className="bg-gray-800 pt-2 md:pt-1 pb-1 px-1 w-full">
      <div
        className="flex flex-1 flex-wrap items-baseline md:items-center"
      >
        <div className="flex md:max-w-lg justify-center md:justify-start text-white flex-1 mr-1 md:mr-0">
          <AutocompleteMarket
            icon
            type="search"
            placeholder="Search pairs"
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
        <div className="flex-1 order-last md:order-none">
          <Tabs />
        </div>
        <div className="flex h-12 md:justify-end">
          <button
            className="hidden md:block px-3 self-stretch focus:outline-none text-gray-200"
            onClick={() => {
              setHide(!isHide);
            }}
          >
            {!isHide && <AiFillEye />}
            {isHide && <AiFillEyeInvisible />}
          </button>
          <Dropdown
            menu={[
              {
                disabled: true,
                component: (
                  <div className="inline-blok mr-3">
                    <Select
                      menuPlacement="auto"
                      isSearchable={false}
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
                          setExchangeId(value.value);
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
                ),
              },
              {
                disabled: false,
                component: (
                  <Link href="/exchange">
                    <a
                      className="block px-4 py-2 text-sm hover:bg-gray-800"
                      role="menuitem"
                      id="menu-item-2"
                    >
                      Exchanges
                    </a>
                  </Link>
                ),
              },
              {
                disabled: false,
                component: (
                  <button
                    type="submit"
                    className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-800"
                    role="menuitem"
                    id="menu-item-3"
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
                  >
                    Sign out
                  </button>
                ),
              },
            ]}
          />
        </div>
        <div className="h-0 block md:hidden" style={{ flexBasis: '100%'}} />
      </div>
    </nav>
  );
};

export default Nav;
