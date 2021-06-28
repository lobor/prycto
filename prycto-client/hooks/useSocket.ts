import { useEffect, useState, useContext, useCallback } from "react";
// import { useSocket as useSocketOriginal } from "socketio-hooks";
import SocketContext from "../context/socket";

const cache: any = {};

function useSocket<Schema = any>(
  name: string,
  {
    params,
    computeData,
    initialState,
  }: {
    params?: any;
    computeData?: (state: Schema | undefined, data: Schema) => Schema;
    initialState?: Schema;
  } = {}
) {
  const sockets = useContext(SocketContext);
  const [data, setData] = useState<Schema>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  // const getExchanges = useEmit(`${name}:request`);
  // useSocketOriginal(`${name}:response`, (dataResponse: Schema) => {
  //   setLoading(false);
  //   setData((computeData && computeData(data, dataResponse)) || dataResponse);
  // });

  const getData = useCallback(
    (params?: Schema) => {
      if (sockets) {
        sockets.emit(`${name}:request`, params);
      }
    },
    [sockets]
  );

  const onEvent = useCallback(
    (dataResponse: Schema) => {
      setLoading(false);
      const responseData =
        (computeData && computeData(data, dataResponse)) || dataResponse;
      cache[`${name}:${JSON.stringify(params || {})}`] = responseData;
      setData(responseData);
    },
    [data, computeData, setData]
  );
  const onError = useCallback((error: string) => {
    setLoading(false);
    setError(error);
  }, []);

  useEffect(() => {
    if (sockets) {
      sockets.on(`${name}:response`, onEvent);
      sockets.on(`${name}:error`, onError);
      return () => {
        sockets.off(`${name}:response`, onEvent);
        sockets.off(`${name}:error`, onError);
      };
    }
  }, [sockets]);

  useEffect(() => {
    if (initialState !== undefined) {
      setData(initialState);
    }
  }, [initialState]);
  useEffect(() => {
    if (!data) {
      refetch(params);
    }
  }, [data]);
  const refetch = (arg?: any) => {
    setLoading(true);
    const localCache = cache[`${name}:${JSON.stringify(arg || {})}`];
    if (localCache) {
      onEvent(localCache);
      return;
    }
    getData(arg);
  };

  return { refetch, data, loading, error };
}

export default useSocket;
