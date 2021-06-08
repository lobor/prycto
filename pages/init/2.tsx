import { useFormik } from "formik";
import * as Yup from "yup";

import useEmit from "../../hooks/useEmit";
import useSocket from "../../hooks/useSocket";
import StepInitBar from "../../components/StepInitBar";
import { useEffect } from "react";
import { useRouter } from "next/dist/client/router";
import Loading from "../../components/Loading";
import Input from "../../components/Input";
import Label from "../../components/Label";
import Boutton from "../../components/Button";

const Init = () => {
  const router = useRouter();
  const { data: dataInit2, loading: loadingInit2 } = useSocket<boolean>("hasInit2")
  const { data, loading } =
    useSocket<{ _id: string; balances: { [key: string]: number } }[]>(
      "getBalances"
    );
  const [editPosition, { data: dataEditPosition, loading: loadingPositions }] =
    useEmit<
      {
        _id: string;
        balance: { [key: string]: { locked: number; available: number } };
      }[]
    >("updateBalancesExchange");
  const [exchange] = data || [];
  const formik = useFormik({
    initialValues:
      (exchange &&
        Object.keys(exchange.balances).reduce<{
          [key: string]: { available: number; locked: number };
        }>((acc, key) => {
          if (!acc[key]) {
            acc[key] = { available: 0, locked: 0 };
          }
          acc[key]["available"] = exchange.balances[key];
          acc[key]["locked"] = 0;
          return acc;
        }, {})) ||
      {},
    enableReinitialize: true,
    onSubmit: (e) => {
      if (exchange) {
        editPosition([{
          _id: exchange._id,
          balance: e,
        }]);
      }
    },
  });

  useEffect(() => {
    if (dataInit2 && !loadingInit2) {
      router.push("/init/3");
    }
  }, [dataInit2, loadingInit2, router]);

  useEffect(() => {
    if (!loadingPositions && dataEditPosition) {
      router.push("/init/3");
    }
  }, [dataEditPosition, loadingPositions, router]);
  return (
    <>
      <StepInitBar step={2} />
      {(loading || loadingPositions) && (
        <div className="flex flex-col items-center">
          <Loading />
        </div>
      )}
      {!loading && exchange && (
        <div className="flex flex-col items-center">
          <form onSubmit={formik.handleSubmit}>
            <Boutton type="submit" variant="validate">
              Validate
            </Boutton>
            {Object.keys(exchange.balances).map((key) => {
              return (
                <div
                  className="flex flex-row text-gray-200 items-center"
                  key={key}
                >
                  <div>{key}</div>
                  <div>
                    <Label label="Available" htmlFor="available">
                      <Input
                        name={`${key}.available`}
                        id={`${key}.available`}
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          formik.setFieldTouched(`${key}.available`, true)
                          formik.setFieldValue(`${key}.available`, Number(e.currentTarget.value))
                        }}
                        value={formik.values[key].available}
                      />
                    </Label>
                  </div>
                  <div>
                    <Label label="Stacking/Blocked" htmlFor="locked">
                      <Input
                        name={`${key}.locked`}
                        id={`${key}.locked`}
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          formik.setFieldTouched(`${key}.locked`, true)
                          formik.setFieldValue(`${key}.locked`, Number(e.currentTarget.value))
                        }}
                        value={formik.values[key].locked}
                      />
                    </Label>
                  </div>
                </div>
              );
            })}
            <Boutton type="submit" variant="validate">
              Validate
            </Boutton>
          </form>
        </div>
      )}
    </>
  );
};

export default Init;
