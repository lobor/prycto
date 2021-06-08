import Head from "next/head";
import Snackbar from "../components/Snackbar";
import Loading from "../components/Loading";
import useSocket from "../hooks/useSocket";
import { useEffect } from "react";
import { useRouter } from "next/dist/client/router";

export default function Home() {
  const { data, loading } = useSocket<boolean>("isInit");
  const router = useRouter();
  useEffect(() => {
    if (!loading && data === false) {
      router.push("/init/1");
    }
  }, [data, loading, router]);
  return (
    <div>
      <Head>
        <title>Prycto</title>
        <meta name="description" content="Prycto" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Snackbar />
      {loading && (
        <div className="flex content-center items-center flex-col mt-40">
          <Loading />
        </div>
      )}
    </div>
  );
}
