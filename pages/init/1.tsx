import { useFormik } from "formik";
import * as Yup from "yup";

import useSocket from "../../hooks/useSocket";
import useEmit from "../../hooks/useEmit";
import Label from "../../components/Label";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Loading from "../../components/Loading";
import { useEffect } from "react";
import { useRouter } from "next/dist/client/router";
import StepInitBar from "../../components/StepInitBar";

const Init = () => {
  const router = useRouter()
  const [addPosition, { loading, data }] = useEmit("addExchange");
  const { data: dataInit1, loading: loadingInit1 } = useSocket<boolean>("hasInit1")
  // useSocket();
  const formik = useFormik({
    validationSchema: Yup.object({
      exchange: Yup.string().required(),
      name: Yup.string().required(),
      publicKey: Yup.string().required(),
      secretKey: Yup.string().required(),
    }),
    initialValues: {
      exchange: "",
      name: "",
      publicKey: "",
      secretKey: "",
    },
    onSubmit: (values) => {
      addPosition(values);
    },
  });

  useEffect(() => {
    if (!loading && data) {
      router.push('/init/2')
    }
  }, [loading, data])

  useEffect(() => {
    if (!loadingInit1 && dataInit1) {
      router.push('/init/2')
    }
  }, [dataInit1, loadingInit1])

  return (
    <>
      <StepInitBar step={1} />
      <div className="flex flex-col items-center">
        <div className="bg-gray-800 text-gray-200 rounded p-8 m-4 max-w-xs max-h-full text-center ">
          <form onSubmit={formik.handleSubmit}>
            {loading && <Loading />}
            <div className="mb-8">
              <Label htmlFor="exchange" label="Exchange">
                <Select
                  id="exchange"
                  name="exchange"
                  onChange={formik.handleChange}
                  value={formik.values.exchange}
                  error={formik.touched.exchange && formik.errors.exchange}
                >
                  <option value="">Choose an exchange</option>
                  <option value="binance">Binance</option>
                  <option value="ftx">FTX</option>
                </Select>
              </Label>
              <Label htmlFor="name" label="Name of connection">
                <Input
                  id="name"
                  name="name"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && formik.errors.name}
                />
              </Label>
              <Label htmlFor="publicKey" label="Public key">
                <Input
                  id="publicKey"
                  name="publicKey"
                  onChange={formik.handleChange}
                  value={formik.values.publicKey}
                  onBlur={formik.handleBlur}
                  error={formik.touched.publicKey && formik.errors.publicKey}
                />
              </Label>
              <Label htmlFor="secretKey" label="Secret key">
                <Input
                  id="secretKey"
                  name="secretKey"
                  onChange={formik.handleChange}
                  value={formik.values.secretKey}
                  onBlur={formik.handleBlur}
                  error={formik.touched.secretKey && formik.errors.secretKey}
                />
              </Label>
            </div>
            <div className="flex justify-center">
              <Button type="submit" variant="validate" className="ml-2">
                Add
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Init;
