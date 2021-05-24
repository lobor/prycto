import Head from "next/head";
import Positions from '../components/Positions';
import Trades from '../components/trades';
import { useTabsContext } from "../context/tabs";


export default function Home() {
  const { selected } = useTabsContext()
  return (
    <div>
      <Head>
        <title>crypto profit</title>
        <meta name="description" content="Crypto profit from Binance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {selected === 'position' && <Positions />}
      {selected !== 'position' && <Trades pair={selected} />}
    </div>
  );
}
