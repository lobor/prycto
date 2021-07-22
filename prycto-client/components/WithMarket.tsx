import { ReactNode } from "react";
import { useMarket } from "../context/market";

interface WithMarketProps {
  children: ({ market }: { market: number }) => any;
  symbol: string;
}

const WithMarket = ({ children, symbol }: WithMarketProps) => {
  const market = useMarket(symbol) as number;
  return <>{children({ market })}</>;
};

export default WithMarket;
