import { Dialog as DialogDefault, Transition } from "@headlessui/react";
import { Fragment, ReactNode } from "react";

interface DialogProps {
  open: boolean;
  children: ReactNode;
  title?: ReactNode;
  onClose: () => void;
}

const Dialog = ({ open, onClose, children, title }: DialogProps) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <DialogDefault
        open={open}
        onClose={onClose}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-60"
            leave="ease-in duration-200"
            leaveFrom="opacity-60"
            leaveTo="opacity-0"
          >
            <DialogDefault.Overlay className="fixed inset-0 bg-gray-800 opacity-70" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="bg-gray-800 text-gray-200 inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              {title && (
                <DialogDefault.Title className="text-lg font-medium leading-6 text-gray-200 mb-10">
                  {title}
                </DialogDefault.Title>
              )}
              {children}
            </div>
          </Transition.Child>
        </div>
      </DialogDefault>
    </Transition>
  );
};

export default Dialog;
