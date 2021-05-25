import Head from "next/head";
import { useMemo } from "react";
import Positions from "../components/Positions";
import Trades from "../components/trades";
import { useTabsContext } from "../context/tabs";

export default function Home() {
  const { selected } = useTabsContext();

  const Trade = useMemo(() => {
    return selected !== "position" && <Trades pair={selected} />;
  }, [selected]);
  const Position = useMemo(() => {
    return selected === "position" && <Positions />;
  }, [selected]);
  return (
    <div>
      <Head>
        <title>crypto profit</title>
        <meta name="description" content="Crypto profit from Binance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {Position}
      {Trade}
    </div>
  );
}
