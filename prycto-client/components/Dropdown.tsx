import { Fragment, useEffect, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";

interface DropdownProps {
  menu: {
    disabled?: boolean;
    component: React.ReactNode;
  }[];
}
const Dropdown = ({ menu }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    if (open) {
      setTimeout(() => setOpen(false), 100);
    }
  };
  return (
    <Menu
      as="div"
      className="relative inline-block text-left h-full"
    >
      <Menu.Button className="inline-flex items-center h-full justify-center w-full px-4 py-2 text-sm font-medium text-gray-200 bg-gray-900 rounded-md hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
        Options
        {/* <ChevronDownIcon
            className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
            aria-hidden="true"
          /> */}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right text-gray-200 bg-gray-900 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none">
          <div className="py-1 ">
            {menu.map((el, i) => {
              return (
                <Menu.Item key={i} disabled={el.disabled}>
                  {({ active }) => el.component}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Dropdown;
