import AutocompleteMarket from "./AutocompleteMarket";
import { useTabsContext } from "../context/tabs";
import Boutton from "./Button";
import Tabs from "./Tabs";
import { useRouter } from "next/dist/client/router";

const Nav = () => {
  const router = useRouter();
  const { addTab, selectTab } = useTabsContext();
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
            addTab({
              key: `exchange`,
              label: 'Exchange',
              canClose: true,
              href: "/exchange",
            });
            selectTab('exchange');
            router.push(`/exchange`);
          }}
        >
          ⚙️
        </Boutton>
      </div>
    </nav>
  );
};

export default Nav;
