import Label from "./Label";
import AutocompleteMarket from "./AutocompleteMarket";
import Button from "./Button";
import Dialog from "./Dialog";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

interface AddPositionProps {
  onSubmit: (params: any) => void;
  onCancel: () => void;
  open: boolean;
}
const AddPosition = ({ onSubmit, open, onCancel }: AddPositionProps) => {
  const [value, setValue] = useState<any>();
  const handleClose = () => {
    setValue(null);
    onCancel()
  }
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
          <Label htmlFor="pair" label={<FormattedMessage id="pair" />}>
            <AutocompleteMarket
              value={value}
              onSelect={(e) => {
                setValue(e);
              }}
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
