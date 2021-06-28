import AutocompleteMarket from "./AutocompleteMarket";
import { useTabsContext } from "../context/tabs";
import { useQuery, gql, useApolloClient } from "@apollo/client";
import Boutton from "./Button";
import Select from "./Select";
import Tabs from "./Tabs";
import { useRouter } from "next/dist/client/router";
import { useHideShow } from "../context/hideShow";
import { ExchangesDocument, ExchangesQuery } from "../generated/graphql";
import { useEffect, useState } from "react";

const Nav = () => {
  const client = useApolloClient()
  const { isHide, setHide } = useHideShow();
  const router = useRouter();
  const { addTab, selectTab } = useTabsContext();
  const { data, loading } = useQuery<ExchangesQuery>(ExchangesDocument);
  const [exchangeId, setExchangeId] = useState<string | null>();

  useEffect(() => {
    if (exchangeId) {
      client.reFetchObservableQueries()
    }
  }, [exchangeId])
  useEffect(() => {
    const exchangeIdStorage = localStorage.getItem("exchangeId");
    if (!exchangeId && exchangeIdStorage) {
      setExchangeId(exchangeIdStorage);
    }
    if (exchangeId && exchangeIdStorage !== exchangeId) {
      localStorage.setItem("exchangeId", exchangeId);
    }
  }, [exchangeId, data]);
  return (
    <nav className="bg-gray-800 pt-2 md:pt-1 pb-1 px-1 w-full">
      <div className="flex flex-wrap items-center">
        <div className="flex justify-center md:justify-start text-white w-full md:w-auto">
          <AutocompleteMarket
            icon
            type="search"
            placeholder="Search pairs"
            onSelect={(key) => {
              const { exchange, symbol } = key;
              addTab({
                key: `${symbol.toLowerCase()}`,
                label: symbol,
                canClose: true,
                exchange,
                href: "/tradingview",
              });
              selectTab(symbol.toLowerCase());
              router.push(`/tradingview?pair=${symbol}`);
            }}
          />
        </div>
        <div className="flex-1">
          <Tabs />
        </div>
        <Boutton
          className="hidden md:block"
          onClick={() => {
            setHide(!isHide);
          }}
        >
          &#x1f441;
        </Boutton>
        <Boutton
          className="hidden md:block"
          onClick={() => {
            addTab({
              key: `exchange`,
              label: "Exchange",
              canClose: true,
              href: "/exchange",
            });
            selectTab("exchange");
            router.push(`/exchange`);
          }}
        >
          ⚙️
        </Boutton>
        <div className="inline-blok w-64">
          <Select
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
      </div>
    </nav>
  );
};

export default Nav;
