import AutocompleteMarket from './AutocompleteMarket';
import { useTabsContext } from "../context/tabs";

const Nav = () => {
  const { addTab, selectTab } = useTabsContext();
  return (
    <nav className="bg-gray-800 pt-2 md:pt-1 pb-1 px-1 w-full">
      <div className="flex flex-wrap items-center">
        <div className="flex flex-1 md:w-1/3 justify-center md:justify-start text-white px-2 pt-2">
          <AutocompleteMarket icon type="search" placeholder="Search pairs" onSelect={(key) => {
            const { exchange, pair } = key
            addTab({
              key: `${pair.toLowerCase()}`,
              label: pair,
              canClose: true,
              exchange
            });
            selectTab(pair.toLowerCase());
          }} />
        </div>
      </div>
    </nav>
  );
};

export default Nav;
