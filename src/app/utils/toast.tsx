import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const successToast = (message: string) => {
  toast.success(message, {
    position: "bottom-left",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: "colored",
  });
};

export const failToast = (message: string) => {
  toast.error(message, {
    position: "bottom-left",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: "colored",
  });
};

export const warnToast = (message: string) =>{
  toast.warn(message, {
    position: "bottom-left",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: "colored",
    transition: undefined,
    });
}

export const processing = (message: string) =>{
  toast.info(message, {
    position: "bottom-left",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: "colored",
    transition: undefined,
    });
}