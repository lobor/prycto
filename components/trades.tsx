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
    <div>
      <Head>
        <title>Trade</title>
        <meta name="description" content="Trade from Binance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {pair && process.browser && (
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
      )}
      {!pair && <div>Pair introuvable</div>}
    </div>
  );
}
