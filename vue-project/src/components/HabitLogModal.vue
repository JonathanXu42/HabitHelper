<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>{{ isEditMode ? 'Edit Habit Log' : 'Add Habit Log' }}</h2>

      <form @submit.prevent="submitLog">
        <div class="form-section">
          <label>Date:</label>
          <p class="text-sm text-muted">
            {{ today }}
          </p>
        </div>

        <div class="form-section">
          <label>Completed:</label>
          <input type="checkbox" v-model="form.completed" />
        </div>

        <div class="form-section">
          <label>Notes (optional):</label>
          <textarea v-model="form.notes" placeholder="Reflections, struggles, successes..." />
        </div>

        <div class="modal-actions">
          <div class="left-buttons">
            <button type="submit">
              {{ isEditMode ? 'Save Changes' : 'Add Log' }}
            </button>
          </div>
          <div class="right-buttons">
            <button type="button" class="cancel" @click="$emit('close')">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { fetchWithCsrf } from '../stores/csrfStore';

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
        date: new Date().toISOString().slice(0, 10),
        completed: false,
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

      const res = await fetchWithCsrf(url, {
        method,
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
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1f1f1f;
  color: #f0f0f0;
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  animation: fadeInScale 0.3s ease forwards;
}

h2 {
  margin-bottom: 1rem;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
}

input[type="checkbox"] {
  margin-top: 6px;
}

textarea {
  width: 100%;
  padding: 10px;
  background-color: #2c2c2c;
  color: #f0f0f0;
  border: 1px solid #555;
  border-radius: 6px;
  resize: vertical;
  min-height: 80px;
  font-size: 14px;
  margin-top: 6px;
}

.text-sm {
  font-size: 0.875rem;
}

.text-muted {
  color: #bbb;
}

.form-section {
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
}

.left-buttons,
.right-buttons {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button[type="submit"] {
  background-color: #4caf50;
  color: white;
}

button[type="submit"]:hover {
  background-color: #43a047;
}

button.cancel {
  background-color: #888;
  color: white;
}

button.cancel:hover {
  background-color: #777;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>