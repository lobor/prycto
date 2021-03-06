import { InputHTMLAttributes } from "react";
import { classnames, TArg } from "tailwindcss-classnames";
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | undefined | false;
}
const Input = (props: InputProps) => {
  const { className, error, ...otherProps } = props;
  return (
    <>
      <input
        {...otherProps}
        className={`bg-gray-900 appearance-none border-2 border-gray-800 rounded-lg w-full py-1 md:py-2 px-4 text-gray-200 leading-tight focus:outline-none shadow-inner ${classnames(
          ...((className || "").split(" ") as TArg[])
        )}`}
      />
      <span className="text-red-800">{error}</span>
    </>
  );
};

export default Input;
