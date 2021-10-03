import Head from "next/head";
import Snackbar from "../components/Snackbar";
import Button from "../components/Button";
import { FormattedMessage, useIntl } from "react-intl";
import Link from "next/link";
import SelectLang from "../components/SelectLang";
import { useRouter } from "next/dist/client/router";
import PryctoLogo from "../components/PryctoLogo";

export default function Home() {
  const router = useRouter();
  const intl = useIntl();
  return (
    <>
      <Head>
        <title>Prycto</title>
        <meta name="description" content="Prycto" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Snackbar />
      <div className="flex flex-col overflow-hidden h-full text-gray-200">
        <div className="h-12 flex flex-row justify-between p-2">
          <div className="h-full flex flex-row flex-wrap items-baseline">
            <h1>
              <Link href="/">
                <a title="Home - Prycto">
                  <PryctoLogo className="max-h-12 w-auto ml-1 mr-2" />
                </a>
              </Link>
            </h1>
          </div>
          <div className="flex flex-row flex-wrap items-baseline md:items-center h-full">
            <SelectLang />
            <Button className="ml-2" onClick={() => router.push("/login")}>
              <FormattedMessage id="login" />
            </Button>
            <Button className="ml-2" onClick={() => router.push("/register")}>
              <FormattedMessage id="register" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="w-1/3 m-auto">
            <h1 className="text-2xl">Prycto - {intl.formatMessage({ id: 'subTitle' })}</h1>
            <p className="mt-5">
              {intl.formatMessage({ id: 'index.descriptif' })}
              Beaucoup d'application existe afin de tracker le PNL de nos
              cryptos adorées. Mais elle se base sur le prix d'un token, peu
              importe la paire. Or quand on fait du trading, on a besoin de
              connaitre la valeur lié a notre position, Prycto rentre en jeux
            </p>
            <h2 className="text-2xl mt-5">Commençons</h2>

            <h3 className="text-xl mt-5">Inscription</h3>
            <img src="/tuto/register.png" alt="Register" className="border p-2 rounded-xl bg-gray-900 border-gray-500 m-auto" />
            {/* <div className="text-md">Suivre une position crypto en toute simplicité</div> */}

            <h3 className="text-xl mt-5">Ajout d'un porte-feuille</h3>
            <img src="/tuto/addExchange.png" alt="add Exchange" className="border p-2 rounded-xl bg-gray-900 border-gray-500 m-auto" />
            <br />
            <img src="/tuto/selectExchange.png" alt="selectExchange" className="border p-2 rounded-xl bg-gray-900 border-gray-500 m-auto" />
            {/* <div>Suivre une position crypto en toute simplicité</div> */}

            <h3 className="text-xl mt-5">Ajout d'une position</h3>
            <img src="/tuto/addedPosition.png" alt="added position" className="border p-2 rounded-xl bg-gray-900 border-gray-500 m-auto" />
            {/* <div>Suivre une position crypto en toute simplicité</div> */}
          </div>
        </div>
        {/* <Loading /> */}
      </div>
    </>
  );
}
