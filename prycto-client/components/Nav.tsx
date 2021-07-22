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
import Dropdown from "./Dropdown";
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiFillSetting,
  AiOutlineLogout,
  AiOutlineSetting,
  AiOutlineWallet,
} from "react-icons/ai";
import { GiTwoCoins } from "react-icons/gi";
import { FormattedMessage, useIntl } from "react-intl";
import SelectLang from "./SelectLang";
import PryctoLogo from "./PryctoLogo";

const Nav = () => {
  const { exchangeId, setExchangeId, name, loading } = useExchange();
  const { isHide, setHide } = useHideShow();
  const router = useRouter();
  const { addTab, selectTab } = useTabsContext();
  const { data } = useQuery<ExchangesQuery>(ExchangesDocument, {
    skip: loading,
  });

  const intl = useIntl();
  return (
    <nav className="bg-gray-800 pt-2 md:pt-1 pb-1 px-1 w-full z-10">
      <div className="flex flex-1 flex-wrap items-baseline md:items-center">
        <Link href="/positions">
          <a title="Prycto">
            <PryctoLogo className="max-h-12 w-auto ml-1 mr-2" />
          </a>
        </Link>
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
        <div className="flex-1 order-last md:order-none overflow-x-auto">
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
          <div className="inline-blok mr-3">
            <Select
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
          <div className="mr-3">
            <SelectLang />
          </div>
          <Dropdown
            label={<AiFillSetting />}
            menu={[
              {
                disabled: false,
                component: (
                  <Link href="/balances">
                    <a
                      className="px-4 py-2 text-sm hover:bg-gray-800 flex items-center"
                      role="menuitem"
                      id="menu-item-2"
                      onClick={() => {
                        addTab({
                          key: "balances",
                          label: intl.formatMessage({ id: "balances" }),
                          canClose: true,
                          href: "/balances",
                        });
                        selectTab("exchange");
                      }}
                    >
                      <GiTwoCoins />
                      <span className="ml-1">
                        <FormattedMessage id="balances" />
                      </span>
                    </a>
                  </Link>
                ),
              },
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
                          label: intl.formatMessage({ id: "exchanges" }),
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
                  <Link href="/settings">
                    <a
                      className="px-4 py-2 text-sm hover:bg-gray-800 flex items-center"
                      role="menuitem"
                      id="menu-item-2"
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
                      <span className="ml-1">
                        <FormattedMessage id="settings" />
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
