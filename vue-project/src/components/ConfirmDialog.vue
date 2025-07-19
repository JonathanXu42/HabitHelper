<template>
  <div v-if="visible" class="confirm-overlay">
    <div class="confirm-box">
      <p>{{ message }}</p>
      <div class="button-row">
        <button class="confirm-btn" @click="confirm(true)">Yes</button>
        <button class="cancel-btn" @click="confirm(false)">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  data() {
    return {
      visible: false,
      message: '',
      resolveFn: null
    };
  },
  methods: {
    show(message) {
      this.message = message;
      this.visible = true;
      return new Promise(resolve => {
        this.resolveFn = resolve;
      });
    },
    confirm(result) {
      this.visible = false;
      if (this.resolveFn) {
        this.resolveFn(result);
        this.resolveFn = null;
      }
    }
  }
};
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(18, 18, 18, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.confirm-box {
  background-color: #1f1f1f;
  color: #f0f0f0;
  padding: 1.5rem;
  border-radius: 16px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.confirm-btn,
.cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.confirm-btn {
  background-color: #4caf50;
  color: white;
}

.cancel-btn {
  background-color: #444;
  color: white;
}
</style>