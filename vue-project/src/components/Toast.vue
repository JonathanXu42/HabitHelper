<template>
</template>

<script>
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

export default {
  name: 'Toast',
  install(app) {
    app.use(Toast, {
      transition: 'Vue-Toastification__fade',
      maxToasts: 5,
      newestOnTop: true,
      timeout: 4000,
      closeOnClick: true,
      pauseOnHover: true,
      hideProgressBar: false,
      toastClassName: 'custom-toast',
      filterBeforeCreate: (toast, toasts) => {
        if (toasts.length >= 5) {
            return false;
        }
        return toast;
      }
    });
  }
};
</script>

<style>
/* Global toast style matching your theme */
.custom-toast {
  background-color: #1f1f1f;
  color: #f0f0f0;
  border-left: 5px solid #4caf50;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
}
</style>