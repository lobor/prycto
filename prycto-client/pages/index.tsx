import Head from "next/head";
import Snackbar from "../components/Snackbar";
import Loading from "../components/Loading";
import Button from "../components/Button";
import { FormattedMessage } from "react-intl";
import Link from "next/link";
import SelectLang from "../components/SelectLang";
import { useRouter } from "next/dist/client/router";
import PryctoLogo from "../components/PryctoLogo";

export default function Home() {
  const router = useRouter();
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
            <h1 className="text-2xl">Prycto</h1>
            <div>Suivre une position crypto en toute simplicité</div>

            <h2 className="text-2xl mt-5">Commençons</h2>

            <h3 className="text-xl mt-5">Inscription</h3>
            <img src="/tuto/register.png" alt="Register" />
            {/* <div className="text-md">Suivre une position crypto en toute simplicité</div> */}

            <h3 className="text-xl mt-5">Ajout d'un porte-feuille</h3>
            <img src="/tuto/addExchange.png" alt="add Exchange" />
            <br />
            <img src="/tuto/selectExchange.png" alt="selectExchange" />
            {/* <div>Suivre une position crypto en toute simplicité</div> */}

            <h3 className="text-xl mt-5">Ajout d'une position</h3>
            <img src="/tuto/addedPosition.png" alt="added position" />
            {/* <div>Suivre une position crypto en toute simplicité</div> */}
          </div>
        </div>
        {/* <Loading /> */}
      </div>
    </>
  );
}
