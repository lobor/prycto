import { ButtonHTMLAttributes } from "react";
import { classnames, TArg } from "tailwindcss-classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'danger' | 'validate' | 'link' | 'default'
}
const Boutton = (props: ButtonProps) => {
  const { children, className, variant, ...otherProps } = props;

  let classNameVariant = 'px-4 py-2 text-xs font-semibold bg-gray-900 tracking-wider text-gray-200 hover:text-white rounded hover:bg-gray-700 disabled:opacity-50'
  if (variant === 'validate') {
    classNameVariant = 'bg-green-900 px-4 py-2 text-xs font-semibold tracking-wider text-gray-200 rounded hover:bg-green-800 disabled:opacity-50'
  } else if (variant === 'danger') {
    classNameVariant = 'px-4 py-2 text-xs font-semibold text-gray-200 tracking-wider text-black rounded bg-red-900 hover:bg-red-800 disabled:opacity-50'
  } else if (variant === 'link') {
    classNameVariant = 'hover:underline text-blue-500'
  }

  return (
    <button
      type="button"
      {...otherProps}
      className={`${classNameVariant} ${classnames(
        ...((className || "").split(" ") as TArg[])
      )}`}
    >
      {children}
    </button>
  );
};

export default Boutton;
