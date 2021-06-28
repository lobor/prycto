import { createRef, useEffect, useRef, useState } from "react";
import Button from "./Button";

const SnackbarItem = ({
  msg,
  type,
  removeError,
}: {
  msg: string;
  type: "default" | "error" | "success";
  removeError: (msg: string) => void;
}) => {
  const timeout = useRef<NodeJS.Timeout>();
  useEffect(() => {
    timeout.current = setTimeout(() => {
      removeError(msg);
    }, 15000);
  }, [msg, removeError]);
  const handleRemove = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      removeError(msg);
    }
  };

  let typeClassName = "border-gray-500";
  if (type === "error") {
    typeClassName = "border-red-500";
  } else if (type === "success") {
    typeClassName = "border-green-500";
  }

  return (
    <div
      className={`flex border-t-4 mt-2 w-1/6 md:min-w-0 ${typeClassName} relative bg-gray-200 shadow-lg text-gray-900 px-2 py-1 items-center`}
      key={msg}
    >
      <span className="flex-1">{msg}</span>
      <Button onClick={handleRemove} size="small">
        X
      </Button>
    </div>
  );
};

const Snackbar = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  // useSocket("error", (message: string) => {
  //   setErrors({ ...errors, [message]: message });
  // });

  const removeError = (msg: string) => {
    if (errors[msg]) {
      delete errors[msg];
      setErrors({ ...errors });
    }
  };

  return (
    <div className="absolute top-0 z-30 right-0 left-0 flex flex-col items-center">
      {Object.keys(errors).map((error) => {
        return (
          <SnackbarItem
            key={error}
            type="error"
            msg={error}
            removeError={removeError}
          />
        );
      })}
    </div>
  );
};

export default Snackbar;
