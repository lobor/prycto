import { InputHTMLAttributes } from "react";
import { classnames, TArg } from "tailwindcss-classnames";

const Input = (props: InputHTMLAttributes<HTMLInputElement>) => {
  const { className, ...otherProps } = props;
  return (
    <input
      {...otherProps}
      className={`bg-gray-900 appearance-none border-2 border-gray-800 rounded-lg w-full py-2 px-4 text-gray-200 leading-tight focus:outline-none shadow-inner focus:border-gray-900 ${classnames(
        ...((className || "").split(" ") as TArg[])
      )}`}
    />
  );
};

export default Input;
