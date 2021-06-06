import Label from "./Label";
import AutocompleteMarket from "./AutocompleteMarket";
import Button from "./Button";
import { useState } from "react";

interface AddPositionProps {
  onSubmit: (params: { pair: string; exchange: string }) => void;
  onCancel: () => void
}
const AddPosition = ({ onSubmit, onCancel }: AddPositionProps) => {
  const [value, setValue] = useState<{ pair: string; exchange: string }>();
  return (
    <div className="h-screen absolute w-full flex flex-col items-center justify-center font-sans top-0 z-10">
      <div className="absolute top-0 bottom-0 left-0 right-0 bg-gray-800 opacity-90"></div>
      <div className="h-screen w-full absolute flex items-center justify-center top-0">
        <div className="bg-gray-800 text-gray-200 rounded shadow p-8 m-4 max-w-xs max-h-full text-center ">
          <div className="mb-4">
            <h1>Add position</h1>
          </div>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (value) {
                onSubmit(value);
              }
            }}
          >
            <div className="mb-8">
              <Label htmlFor="pair" label="Pair">
                <AutocompleteMarket
                  value={value}
                  onSelect={(e) => {
                    setValue(e)
                  }}
                />
              </Label>
            </div>
            <div className="flex justify-center">
              <Button onClick={onCancel}>
                Cancel
              </Button>
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
