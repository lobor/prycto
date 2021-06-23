import { useContext, useCallback, useState, useEffect } from "react";
import SocketContext from "../context/socket";

function useEmit<Schema = any>(
  name: string,
  {
    computeData,
  }: {
    computeData?: (state: Schema | undefined, data: Schema) => Schema;
  } = {}
): [
  (params?: Schema) => void,
  {
    refetch: (params?: Schema) => void;
    data: Schema | undefined;
    loading: boolean;
    error?: string;
  }
] {
  const sockets = useContext(SocketContext);
  const [data, setData] = useState<Schema>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const getData = useCallback((params?: Schema) => {
    if (sockets) {
      sockets.emit(`${name}:request`, params)
    }
  }, [sockets])
  
  const onEvent = useCallback((dataResponse: Schema) => {
    setLoading(false);
    setData((computeData && computeData(data, dataResponse)) || dataResponse);
  }, [])
  const onError = useCallback((error: string) => {
    setLoading(false);
    setError(error);
  }, [])

  useEffect(() => {
    if (sockets) {
      sockets.on(`${name}:response`, onEvent)
      sockets.on(`${name}:error`, onError)
      return () => {
        sockets.off(`${name}:response`, onEvent);
        sockets.off(`${name}:error`, onError);
      }
    }
  }, [sockets])

  const fetch = (params?: Schema) => {
    setLoading(true);
    getData(params);
  };
  return [fetch, { refetch: fetch, data, loading, error }];
}

export default useEmit;
