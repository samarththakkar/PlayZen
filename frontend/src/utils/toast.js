import { toast as hotToast } from 'react-hot-toast';

// Helper to get an ID based on message content
const getToastId = (message) => {
  if (typeof message === 'string') {
    return message;
  }
  return undefined;
};

// Create a callable function that mimics hotToast
const toast = (message, options = {}) => {
  const id = options.id || getToastId(message);
  return hotToast(message, { id, ...options });
};

// Copy all methods from hotToast and wrap the ones that show messages
toast.success = (message, options = {}) => {
  const id = options.id || getToastId(message);
  return hotToast.success(message, { id, ...options });
};

toast.error = (message, options = {}) => {
  const id = options.id || getToastId(message);
  return hotToast.error(message, { id, ...options });
};

toast.loading = (message, options = {}) => {
  const id = options.id || getToastId(message);
  return hotToast.loading(message, { id, ...options });
};

toast.custom = (message, options = {}) => {
  const id = options.id || getToastId(message);
  return hotToast.custom(message, { id, ...options });
};

toast.dismiss = (toastId) => hotToast.dismiss(toastId);
toast.remove = (toastId) => hotToast.remove(toastId);
toast.promise = (promise, msgs, options) => hotToast.promise(promise, msgs, options);

export default toast;
