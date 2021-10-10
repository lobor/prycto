import { useFormik } from "formik";
import Label from "./Label";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import Dialog from "./Dialog";
import { FormattedMessage } from "react-intl";
import { useMetamask } from "../context/metamask";

interface FormValues {
  name: string;
  exchange: string;
  publicKey: string;
  secretKey: string;
}
interface AddPositionProps {
  onSubmit: (params: FormValues) => void;
  onCancel: () => void;
  open: boolean;
}
const AddPosition = ({ onSubmit, onCancel, open }: AddPositionProps) => {
  const formik = useFormik({
    initialValues: {
      exchange: "",
      name: "",
      publicKey: "",
      secretKey: "",
      address: "",
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });
  const optionsExchange = [
    { label: "Binance", value: "binance" },
    { label: "FTX", value: "ftx" },
    { label: "Kraken", value: "kraken" },
    // { label: "Binance Smart Chain", value: "bsc" },
  ];
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={<FormattedMessage id="addExchange" />}
    >
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-8">
          <Label htmlFor="exchange" label={<FormattedMessage id="exchange" />}>
            <Select
              placeholder={<FormattedMessage id="exchange" />}
              value={optionsExchange.find(
                ({ value }) => value === formik.values.exchange
              )}
              options={optionsExchange}
              onChange={(e) => {
                if (e) {
                  formik.setFieldValue("exchange", e);
                  formik.setFieldTouched("exchange", true);
                }
              }}
            />
          </Label>
          <Label htmlFor="name" label={<FormattedMessage id="exchangeName" />}>
            <Input id="name" name="name" onChange={formik.handleChange} />
          </Label>
          {formik.values.exchange !== "bsc" ? (
            <Label
              htmlFor="publicKey"
              label={<FormattedMessage id="publicKey" />}
            >
              <Input
                id="publicKey"
                name="publicKey"
                type="password"
                onChange={formik.handleChange}
              />
            </Label>
          ) : (
            <Label
              htmlFor="address"
              label={<FormattedMessage id="address" />}
            >
              <Input
                id="address"
                name="address"
                type="password"
                onChange={formik.handleChange}
              />
            </Label>
          )}
          <Label
            htmlFor="secretKey"
            label={<FormattedMessage id="secretKey" />}
          >
            <Input
              id="secretKey"
              name="secretKey"
              type="password"
              onChange={formik.handleChange}
            />
          </Label>
        </div>
        <div className="flex justify-center">
          <Button onClick={onCancel}>
            <FormattedMessage id="cancel" />
          </Button>
          <Button type="submit" variant="validate" className="ml-2">
            <FormattedMessage id="add" />
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddPosition;
