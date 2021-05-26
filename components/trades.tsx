import Head from "next/head";
import { AdvancedChartWidgetProps } from "react-tradingview-embed";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const AdvancedChart = dynamic<any>(
  () => import("react-tradingview-embed").then((mod) => mod.AdvancedChart),
  { ssr: false }
);

export default function Trade({ pair }: { pair: string }) {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Trade</title>
        <meta name="description" content="Trade from Binance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {pair && process.browser && (
        <div className="flex flex-1 flex-row h-full">
          <div className="flex-1">
            <AdvancedChart
              widgetProps={{
                theme: "dark",
                symbol: pair as string,
                width: "100%",
                style: "1",
              }}
              widgetPropsAny={{
                interval: "15",
                studies: [
                  "CCI@tv-basicstudies",
                  "MACD@tv-basicstudies",
                  "RSI@tv-basicstudies",
                  "StochasticRSI@tv-basicstudies",
                ],
              }}
            />
          </div>
          <div className="border-2 border-blue-500 hidden md:block">
            <div><span>Acheter</span><span>0.5262451 BUSD</span></div>
            <div><input placeholder="Prix"  value="4625.25" /></div>
            <div><input placeholder="Montant" /></div>
            <div><button>Acheter</button></div>
          </div>
          <div className="border-2 border-blue-500 hidden md:block">
            <div><span>Vendre</span><span>0.5262451 ETH</span></div>
            <div><input placeholder="Prix" value="4625.25" /></div>
            <div><input placeholder="Montant" /></div>
            <div><button>Vendre</button></div>
          </div>
        </div>
      )}
      {!pair && <div>Pair introuvable</div>}
    </>
  );
}
