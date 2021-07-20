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
            <Button className="ml-2" onClick={() => router.push('/login')}>
              <FormattedMessage id="login" />
            </Button>
            <Button className="ml-2" onClick={() => router.push('/register')}>
              <FormattedMessage id="register" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          Welcome
        </div>
        {/* <Loading /> */}
      </div>
    </>
  );
}
