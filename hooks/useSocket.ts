import { useEffect, useState } from "react";
import { useEmit, useSocket as useSocketOriginal } from "socketio-hooks";

function useSocket<Schema = any>(
  name: string,
  {
    computeData,
    initialState,
  }: {
    computeData?: (state: Schema | undefined, data: Schema) => Schema;
    initialState?: Schema;
  } = {}
) {
  const [data, setData] = useState<Schema>();
  const [loading, setLoading] = useState<boolean>(false);
  const getExchanges = useEmit(`${name}:request`);
  useSocketOriginal(`${name}:response`, (dataResponse: Schema) => {
    setLoading(false);
    setData((computeData && computeData(data, dataResponse)) || dataResponse);
  });

  useEffect(() => {
    if (initialState !== undefined) {
      setData(initialState);
    }
  }, [initialState]);
  useEffect(() => {
    if (!data) {
      refetch();
    }
  }, [data]);
  const refetch = () => {
    setLoading(true);
    getExchanges();
  };
  return { refetch, data, loading };
}

export default useSocket;
