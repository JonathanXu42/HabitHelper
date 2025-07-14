<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>{{ isEditMode ? 'Edit Habit Log' : 'Add Habit Log' }}</h2>

      <form @submit.prevent="submitLog">
        <label>Date:</label>
        <p class="text-sm text-gray-600 mb-2">
        {{ today }}
        </p>

        <label>Completed:</label>
        <input type="checkbox" v-model="form.completed" />

        <label>Progress (optional):</label>
        <input type="number" v-model.number="form.progress" />

        <label>Notes (optional):</label>
        <textarea v-model="form.notes"></textarea>

        <div class="modal-actions">
          <button type="submit">{{ isEditMode ? 'Save Changes' : 'Add Log' }}</button>
          <button type="button" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HabitLogModal',
  props: {
    habitId: {
      type: String,
      required: true
    },
    logToEdit: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        completed: false,
        progress: null,
        notes: ''
      }
    };
  },
  computed: {
    isEditMode() {
      return !!this.logToEdit;
    },    
    today() {
        return new Date().toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
        });
    }
  },
  mounted() {
    if (this.isEditMode) {
      this.form = {
        completed: this.logToEdit.completed,
        progress: this.logToEdit.progress,
        notes: this.logToEdit.notes
      };
    }
  },  
  methods: {
    async submitLog() {
      const url = this.isEditMode
        ? `/api/habit-logs/${this.habitId}/logs/${this.logToEdit.id}`
        : `/api/habit-logs/${this.habitId}/logs`;

      const method = this.isEditMode ? 'PATCH' : 'POST';        

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.form)
      });

      const savedLog = await res.json();
      this.$emit(this.isEditMode ? 'edited' : 'added', savedLog);
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: rgb(0, 0, 0);
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}
.modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
}
.modal-actions button {
  padding: 8px 12px;
}
</style>