import Head from "next/head";
import { useMemo } from "react";
// import Positions from "../components/Positions";
// import Trades from "../components/trades";
import Snackbar from "../components/Snackbar";
// import Dashboard from "../components/Dashboard";
import { useTabsContext } from "../context/tabs";

export default function Home() {
  const { selected } = useTabsContext();

  // const Trade = useMemo(() => {
  //   return !["position", "dashboard"].includes(selected) && <Trades />;
  // }, [selected]);
  // const Position = useMemo(() => {
  //   return selected === "position" && <Positions />;
  // }, [selected]);
  // const DashboardComponent = useMemo(() => {
  //   return selected === "dashboard" && <Dashboard />;
  // }, [selected]);
  return (
    <div>
      <Head>
        <title>crypto profit</title>
        <meta name="description" content="Crypto profit from Binance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Snackbar />
      {/* {DashboardComponent} */}
      {/* {Position} */}
      {/* {Trade} */}
    </div>
  );
}
