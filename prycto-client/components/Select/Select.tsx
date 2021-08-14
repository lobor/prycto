import { Listbox, Transition } from "@headlessui/react";
import { Fragment, ReactNode } from "react";
import { AiOutlineDown } from "react-icons/ai";

interface SelectProps {
  className?: string;
  error?: string | false;
  value?: {
    value: string;
    label: string;
  };
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  placeholder?: ReactNode;
}
const Select = ({
  className,
  error,
  value,
  options,
  onChange,
  placeholder,
}: SelectProps) => {
  return (
    <Listbox as="div" value={value && value.value} onChange={onChange} className={`relative h-full ${className || ''}`}>
      <Listbox.Button className="bg-gray-900 border-0 text-gray-200 w-full h-full focus:outline-none rounded-md px-4 py-2 flex justify-between items-center">
        {(value && value.label) || placeholder}
        <AiOutlineDown className="w-5 h-3 ml-2 -mr-1" />
      </Listbox.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Listbox.Options className="mt-1 shadow-lg rounded-md bg-gray-900 border-0 text-gray-200 py-1">
          {options.map((option) => (
            <Listbox.Option
              className="px-4 py-2 text-sm hover:bg-gray-800 flex items-center cursor-pointer"
              key={option.value}
              value={option.value}
            >
              {option.label}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  );
};

export default Select;
