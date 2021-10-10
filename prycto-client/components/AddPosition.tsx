import Label from "./Label";
import AutocompleteMarket from "./AutocompleteMarket";
import Button from "./Button";
import Dialog from "./Dialog";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { useExchange } from "../context/exchange";
import Input from "./Input";

interface AddPositionProps {
  onSubmit: (params: any) => void;
  onCancel: () => void;
  open: boolean;
}
const AddPosition = ({ onSubmit, open, onCancel }: AddPositionProps) => {
  const [value, setValue] = useState<any>();
  const { exchange } = useExchange();
  const handleClose = () => {
    setValue(null);
    onCancel();
  };
  return (
    <Dialog
      onClose={handleClose}
      open={open}
      title={<FormattedMessage id="addPosition" />}
    >
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (value) {
            onSubmit(value);
            setValue(null);
          }
        }}
      >
        <div className="mb-8">
          {exchange !== "bsc" ? (
            <Label htmlFor="pair" label={<FormattedMessage id="pair" />}>
              <AutocompleteMarket
                value={value}
                onSelect={(e) => {
                  setValue(e);
                }}
              />
            </Label>
          ) : (
            <Label label={<FormattedMessage id="Token address" />}>
              <Input
                type="text"
                onChange={(e) => {
                  setValue({ symbol: e.target.value });
                }}
              />
            </Label>
          )}
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
