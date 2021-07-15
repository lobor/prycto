import { useFormik } from "formik";
import Label from "./Label";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";

interface FormValues {
  name: string;
  exchange: string;
  publicKey: string;
  secretKey: string;
}
interface AddPositionProps {
  onSubmit: (params: FormValues) => void;
  onCancel: () => void;
}
const AddPosition = ({ onSubmit, onCancel }: AddPositionProps) => {
  const formik = useFormik({
    initialValues: {
      exchange: "",
      name: "",
      publicKey: "",
      secretKey: "",
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });
  const optionsExchange = [
    { label: "Binance", value: "binance" },
    { label: "FTX", value: "ftx" },
    { label: "Kraken", value: "kraken" },
  ];
  return (
    <div className="h-screen absolute w-full flex flex-col items-center justify-center font-sans top-0 z-10">
      <div className="absolute top-0 bottom-0 left-0 right-0 bg-gray-800 opacity-90"></div>
      <div className="h-screen w-full absolute flex items-center justify-center top-0">
        <div className="bg-gray-800 text-gray-200 rounded shadow p-8 m-4 max-w-xs max-h-full text-center ">
          <div className="mb-4">
            <h1>Add position</h1>
          </div>
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-8">
              <Label htmlFor="exchange" label="Exchange">
                <Select
                  id="exchange"
                  name="exchange"
                  value={optionsExchange.find(
                    ({ value }) => value === formik.values.exchange
                  )}
                  options={optionsExchange}
                  onChange={(e) => {
                    if (e) {
                      formik.setFieldValue("exchange", e.value);
                      formik.setFieldTouched("exchange", true);
                    }
                  }}
                />
              </Label>
              <Label htmlFor="name" label="Name of connection">
                <Input id="name" name="name" onChange={formik.handleChange} />
              </Label>
              <Label htmlFor="publicKey" label="Public key">
                <Input
                  id="publicKey"
                  name="publicKey"
                  onChange={formik.handleChange}
                />
              </Label>
              <Label htmlFor="secretKey" label="Secret key">
                <Input
                  id="secretKey"
                  name="secretKey"
                  onChange={formik.handleChange}
                />
              </Label>
            </div>
            <div className="flex justify-center">
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="submit" variant="validate" className="ml-2">
                Add
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPosition;
