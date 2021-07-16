import AutocompleteMarket from "./AutocompleteMarket";
import { useTabsContext } from "../context/tabs";
import { useQuery, gql, useApolloClient } from "@apollo/client";
import Link from "next/link";
import Select from "./Select";
import Tabs from "./Tabs";
import { useRouter } from "next/dist/client/router";
import { useHideShow } from "../context/hideShow";
import { ExchangesDocument, ExchangesQuery } from "../generated/graphql";
import { useExchange } from "../context/exchange";
import Dropdown from "./Dropdown";
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiFillSetting,
  AiOutlineLogout,
  AiOutlineWallet,
} from "react-icons/ai";
import { FormattedMessage, useIntl } from "react-intl";

const Nav = () => {
  const { exchangeId, setExchangeId, name, loading } = useExchange();
  const { isHide, setHide } = useHideShow();
  const router = useRouter();
  const { addTab, selectTab } = useTabsContext();
  const { data } = useQuery<ExchangesQuery>(ExchangesDocument, {
    skip: loading,
  });

  const intl = useIntl()

  return (
    <nav className="bg-gray-800 pt-2 md:pt-1 pb-1 px-1 w-full">
      <div className="flex flex-1 flex-wrap items-baseline md:items-center">
        <div className="flex md:max-w-lg justify-center md:justify-start text-white flex-1 mr-1 md:mr-0">
          <AutocompleteMarket
            icon
            type="search"
            placeholder={intl.formatMessage({ id: 'searchPairs' })}
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
          <div className="inline-blok mr-3 w-36">
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
          <div className="mr-3">

          <Dropdown
            label={"lang"}
            menu={[
              {
                component: (
                  <Link href={router.asPath} locale="fr">
                    <a className="px-4 py-2 text-sm hover:bg-gray-800 flex items-center">fr</a>
                  </Link>
                ),
              },
              {
                component: (
                  <Link href={router.asPath} locale="en">
                    <a className="px-4 py-2 text-sm hover:bg-gray-800 flex items-center">en</a>
                  </Link>
                ),
              },
            ]}
          />
          </div>
          <Dropdown
            label={<AiFillSetting />}
            menu={[
              {
                disabled: false,
                component: (
                  <Link href="/exchange">
                    <a
                      className="px-4 py-2 text-sm hover:bg-gray-800 flex items-center"
                      role="menuitem"
                      id="menu-item-2"
                      onClick={() => {
                        addTab({
                          key: "exchange",
                          label: intl.formatMessage({ id: 'exchanges' }),
                          canClose: true,
                          href: "/exchange",
                        });
                        selectTab("exchange");
                      }}
                    >
                      <AiOutlineWallet />
                      <span className="ml-1">
                        <FormattedMessage id="exchanges" />
                      </span>
                    </a>
                  </Link>
                ),
              },
              {
                disabled: false,
                component: (
                  <button
                    type="submit"
                    className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-800"
                    role="menuitem"
                    id="menu-item-3"
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
                  >
                    <AiOutlineLogout />
                    <span className="ml-1">
                      <FormattedMessage id="logout" />
                    </span>
                  </button>
                ),
              },
            ]}
          />
        </div>
        <div className="h-0 block md:hidden" style={{ flexBasis: "100%" }} />
      </div>
    </nav>
  );
};

export default Nav;
