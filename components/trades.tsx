import Head from "next/head";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Input from "./Input";
import Button from "./Button";

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
          <div className="flex flex-row items-start">
            <div className="bg-gray-800 hidden md:block p-1 text-gray-200 border-t-2 border-b-2 border-l-2 border-r-1 border-gray-900">
              <div className="flex justify-between px-1">
                <span>Acheter</span>
                <span>0.5262451 BUSD</span>
              </div>
              <div className="mb-2">
                <Input placeholder="Prix" defaultValue="4625.25" />
              </div>
              <div className="mb-2">
                <Input placeholder="Montant" />
              </div>
              <div className="text-right">
                <Button variant="validate">Acheter</Button>
              </div>
            </div>
            <div className="bg-gray-800 hidden md:block p-1 text-gray-200 border-t-2 border-b-2 border-r-2 border-l-1 border-gray-900">
              <div className="flex justify-between px-1">
                <span>Vendre</span>
                <span>0.5262451 ETH</span>
              </div>
              <div className="mb-2">
                <Input placeholder="Prix" defaultValue="4625.25" />
              </div>
              <div className="mb-2">
                <Input placeholder="Montant" />
              </div>
              <div className="text-right">
                <Button variant="danger">Vendre</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {!pair && <div>Pair introuvable</div>}
    </>
  );
}
