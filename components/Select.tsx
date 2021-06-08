import { SelectHTMLAttributes } from "react";
import { classnames, TArg } from "tailwindcss-classnames";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string | false;
}
const Select = (props: SelectProps) => {
  const { className, children, error, ...otherProps } = props;
  return (
    <>
      <select
        {...otherProps}
        className={`bg-gray-900 appearance-none border-2 rounded-lg border-gray-800 w-full py-2 px-4 text-gray-200 focus:outline-none focus:border-gray-900 ${classnames(
          ...((className || "").split(" ") as TArg[])
        )}`}
      >
        {children}
      </select>
      <span className="text-red-800">{error}</span>
    </>
  );
};

export default Select;
