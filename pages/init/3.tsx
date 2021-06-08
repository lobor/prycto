import { useFormik } from "formik";
import * as Yup from "yup";
import { filter } from "fuzzy";
import useEmit from "../../hooks/useEmit";
import useSocket from "../../hooks/useSocket";
import StepInitBar from "../../components/StepInitBar";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/dist/client/router";
import Loading from "../../components/Loading";
import Input from "../../components/Input";
import Label from "../../components/Label";
import Button from "../../components/Button";
import List from "react-virtualized/dist/commonjs/List";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import { keyBy } from "lodash";
import { string } from "yup/lib/locale";

const Init = () => {
  const router = useRouter();
  const { data: dataInit3, loading: loadingInit3 } = useSocket<boolean>("hasInit3")
  const originalPairs = useRef<{ symbol: string; exchange: string; id: string; exchangeId: string }[]>();
  const [pairs, setPairs] = useState<
    { symbol: string; exchange: string; id: string; exchangeId: string }[]
  >([]);
  const { data, loading } = useSocket("getAllPairs");
  const [
    savePairsPosition,
    { loading: loadingCreatePosition, data: dataPositions },
  ] = useEmit("createPositions");

  useEffect(() => {
    if (dataInit3 && !loadingInit3) {
      router.push("/positions");
    }
  }, [dataInit3, loadingInit3, router]);

  useEffect(() => {
    if (data && !loading) {
      originalPairs.current = data;
      setPairs(data);
    }
  }, [data]);

  useEffect(() => {
    if (!loadingCreatePosition && dataPositions) {
      router.push("/positions");
    }
  }, [loadingCreatePosition, dataPositions, router]);

  const formik = useFormik({
    initialValues: {
      pairs: [] as { exchangeId: string; symbol: string }[],
    },
    onSubmit: (values: { pairs: { exchangeId: string; symbol: string }[] }) => {
      const exchangesWithPairById = values.pairs.reduce<
        Record<string, { exchangeId: string; pairs: string[] }>
      >((acc, { exchangeId, symbol }) => {
        if (!acc[exchangeId]) {
          acc[exchangeId] = { exchangeId, pairs: [] };
        }
        acc[exchangeId].pairs.push(symbol);
        return acc;
      }, {});

      const [exchangeWithPairById] = Object.values(exchangesWithPairById);
      savePairsPosition(exchangeWithPairById);
    },
  });

  const handleChange =
    (exchangeId: string) => (e: ChangeEvent<HTMLInputElement>) => {
      if (e.currentTarget.checked) {
        formik.setFieldValue("pairs", [
          ...formik.values.pairs,
          { exchangeId, symbol: e.currentTarget.value },
        ]);
      } else {
        formik.setFieldValue(
          "pairs",
          formik.values.pairs.filter(
            (pair) =>
              pair.symbol !== e.currentTarget.value ||
              pair.exchangeId !== exchangeId
          )
        );
      }
    };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    if (originalPairs.current) {
      setPairs(
        filter(value, [...originalPairs.current], {
          extract: function (el) {
            return el.symbol;
          },
        }).map(({ original }) => original)
      );
    }
  };

  const formikPairsBySymbol = keyBy(
    formik.values.pairs,
    ({ exchangeId, symbol }) => {
      return `${exchangeId}${symbol}`;
    }
  );

  return (
    <>
      <StepInitBar step={3} />
      {(loading || loadingCreatePosition) && (
        <div className="flex flex-col items-center">
          <Loading />
        </div>
      )}
      {!loading && pairs && (
        <form className="flex flex-1 flex-col" onSubmit={formik.handleSubmit}>
          <Button type="submit" variant="validate">
            Save
          </Button>
          <Input name="pair" onChange={handleSearch} />
          <ul className="flex flex-1 flex-col items-center">
            <AutoSizer>
              {({ width, height }) => (
                <List
                  ref="List"
                  height={height}
                  rowCount={pairs.length}
                  rowHeight={32}
                  rowRenderer={({ index, key, style }) => {
                    const { id, symbol, exchangeId } = pairs[index];
                    return (
                      <li key={key} style={style}>
                        <Label label={symbol} htmlFor={symbol} variant="inline">
                          <input
                            onChange={handleChange(exchangeId)}
                            type="checkbox"
                            name={symbol}
                            id={symbol}
                            value={symbol}
                            checked={
                              formikPairsBySymbol[exchangeId] &&
                              formikPairsBySymbol[exchangeId].symbol === symbol
                            }
                          />
                        </Label>
                      </li>
                    );
                  }}
                  width={width}
                />
              )}
            </AutoSizer>
          </ul>
        </form>
      )}
    </>
  );
};

export default Init;
