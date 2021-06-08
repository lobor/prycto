import { useEffect, useState } from "react";
import { useEmit as useEmitOriginal, useSocket } from "socketio-hooks";

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
  const [data, setData] = useState<Schema>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const getData = useEmitOriginal(`${name}:request`);
  useSocket(`${name}:response`, (dataResponse: Schema) => {
    setLoading(false);
    setData((computeData && computeData(data, dataResponse)) || dataResponse);
  });

  useSocket(`${name}:error`, (error: string) => {
    setLoading(false);
    setError(error);
  });

  const fetch = (params?: Schema) => {
    setLoading(true);
    getData(params);
  };
  return [fetch, { refetch: fetch, data, loading, error }];
}

export default useEmit;
