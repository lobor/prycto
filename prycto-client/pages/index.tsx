import Head from "next/head";
import Snackbar from "../components/Snackbar";
import Loading from "../components/Loading";
import useSocket from "../hooks/useSocket";
import { useEffect } from "react";
import { useRouter } from "next/dist/client/router";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/positions");
  }, [router]);
  return (
    <div>
      <Head>
        <title>Prycto</title>
        <meta name="description" content="Prycto" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Snackbar />
      <div className="flex content-center items-center flex-col mt-40">
        <Loading />
      </div>
    </div>
  );
}
