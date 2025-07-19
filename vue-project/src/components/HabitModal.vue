<template>
  <ConfirmDialog ref="confirmDialog" />
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-content">
        <h2>{{ editMode ? 'Edit Habit' : 'Add a New Habit' }}</h2>
        <form @submit.prevent="submitHabit">
          <div class="form-section">
            <input
              class="text-input"
              v-model="form.name"
              placeholder="Habit Name"
              required
              autofocus
            />
          </div>

          <div class="form-section">
            <textarea
              v-model="form.notes"
              placeholder="Why are you building this habit? (Optional)"
            />
          </div>

          <div class="form-section">
            <label>Days of the Week:</label>
            <div class="days">
              <label v-for="(day, index) in days" :key="index">
                <input type="checkbox" :value="index" v-model="form.daysOfWeek" />
                <span>{{ day }}</span>
              </label>
            </div>
          </div>

          <div class="form-section">
            <label>
              <input type="checkbox" v-model="form.emailReminderEnabled" />
              Enable Email Reminders
            </label>
          </div>

          <div
            v-if="form.emailReminderEnabled && form.daysOfWeek.length"
            class="form-section"
          >
            <div v-for="dayIndex in form.daysOfWeek" :key="dayIndex">
              <h4>{{ days[dayIndex] }}</h4>
              <div
                v-for="(time, i) in form.reminderTimesByDay[dayIndex]"
                :key="i"
                class="time-entry"
              >
                <input
                  type="number"
                  v-model.number="time.hour"
                  min="0"
                  max="12"
                  @input="clampHour(dayIndex, i)"
                />
                :
                <input
                  type="number"
                  v-model.number="time.minute"
                  min="0"
                  max="59"
                  @input="clampMinute(dayIndex, i)"
                />
                <select v-model="time.period">
                  <option>AM</option>
                  <option>PM</option>
                </select>
                <button type="button" @click="removeTime(dayIndex, i)">🗑</button>
              </div>
              <button type="button" @click="addTime(dayIndex)">+ Add Time</button>
            </div>
          </div>

          <div class="action-buttons">
            <div class="left-buttons">
              <button type="submit">
                {{ editMode ? 'Save Changes' : 'Add Habit' }}
              </button>
            </div>
            <div class="right-buttons">
              <button type="button" class="cancel" @click="$emit('close')">
                Cancel
              </button>
              <button
                v-if="editMode"
                type="button"
                class="delete"
                @click="confirmDelete"
              >
                Delete
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchWithCsrf } from '../stores/csrfStore';
import { useToast } from 'vue-toastification';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

export default {
  name: 'HabitModal',
  components: { ConfirmDialog },
  data() {
    return {
      form: {
        name: '',
        notes: '',
        daysOfWeek: [],
        emailReminderEnabled: false,
        reminderTimesByDay: {}
      },
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      toast: null
    };
  },
  props: {
    editMode: {
      type: Boolean,
      default: false
    },
    habitData: {
      type: Object,
      default: null
    }
  },
  created() {
    if (!this.editMode) {
      this.resetForm();
    }

    this.toast = useToast();
  },
  watch: {
    habitData: {
      immediate: true,
      handler(newData) {
        if (this.editMode && newData) {
          const { name, notes, daysOfWeek, emailReminderSettings } = newData;

          this.form.name = name;
          this.form.notes = notes || '';
          this.form.daysOfWeek = [...daysOfWeek];
          this.form.emailReminderEnabled = emailReminderSettings?.enabled || false;

          this.form.reminderTimesByDay = {};
          if (emailReminderSettings?.timesByDay) {
            for (const [day, timeStrings] of Object.entries(
              emailReminderSettings.timesByDay
            )) {
              const dayNum = parseInt(day, 10);
              this.form.reminderTimesByDay[dayNum] = timeStrings.map(str => {
                const [hh, mm] = str.split(':').map(Number);
                const period = hh >= 12 ? 'PM' : 'AM';
                const hour12 = hh % 12 === 0 ? 12 : hh % 12;
                return { hour: hour12, minute: mm, period };
              });
            }
          } else {
            this.form.reminderTimesByDay = {};
          }
        }
      }
    },

    'form.daysOfWeek'(newDays) {
      for (const day of newDays) {
        if (!this.form.reminderTimesByDay[day]) {
          this.form.reminderTimesByDay[day] = [];
        }
      }
      this.form.daysOfWeek.sort((a, b) => a - b);
    }
  },
  methods: {
    formatTime({ hour, minute, period }) {
      let h = hour % 12;
      if (period === 'PM') h += 12;
      const hh = h.toString().padStart(2, '0');
      const mm = minute.toString().padStart(2, '0');
      return `${hh}:${mm}`;
    },
    addTime(day) {
      if (!this.form.reminderTimesByDay[day]) {
        this.form.reminderTimesByDay[day] = [];
      }

      const newTime = { hour: 8, minute: 0, period: 'AM' };
      const newFormatted = this.formatTime(newTime);

      const alreadyExists = this.form.reminderTimesByDay[day].some(existing =>
        this.formatTime(existing) === newFormatted
      );

      if (!alreadyExists) {
        this.form.reminderTimesByDay[day].push(newTime);
        this.sortTimesForDay(day);
      } else {
        this.toast.warning(`Time ${newFormatted} already exists for ${this.days[day]}`);
      }
    },
    sortTimesForDay(day) {
      this.form.reminderTimesByDay[day].sort((a, b) => {
        const timeA = this.formatTime(a);
        const timeB = this.formatTime(b);
        return timeA.localeCompare(timeB);
      });
    },
    removeTime(day, index) {
      this.form.reminderTimesByDay[day].splice(index, 1);
    },
    async submitHabit() {
      let timesByDay = {};

      if (this.form.emailReminderEnabled) {
        for (const [day, timeList] of Object.entries(this.form.reminderTimesByDay)) {
          timesByDay[day] = timeList.map(this.formatTime);
        }
      }

      const emailReminderSettings = {
        enabled: this.form.emailReminderEnabled,
        timesByDay
      };

      const payload = {
        name: this.form.name,
        notes: this.form.notes,
        daysOfWeek: this.form.daysOfWeek,
        emailReminderSettings: emailReminderSettings
      };

      try {
        const url = this.editMode
          ? `/api/habits/${this.habitData.id}`
          : '/api/habits';

        const method = this.editMode ? 'PATCH' : 'POST';

        const response = await fetchWithCsrf(url, {
          method,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          if (method === 'PATCH') {
            throw new Error('Failed to update habit');
          } else {
            throw new Error('Failed to create habit');
          }
        }

        this.$emit('created');
        this.$emit('close');
      } catch (err) {
        this.toast.error(err.message);
      }
    },
    async confirmDelete() {
      const confirmed = await this.$refs.confirmDialog.show(
        'Are you sure you want to delete this habit? This cannot be undone.'
      );
      if (!confirmed) return;

      try {
        const response = await fetchWithCsrf(`/api/habits/${this.habitData.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete habit');

        this.$emit('deleted');
        this.$emit('close');
      } catch (err) {
        this.toast.error(err.message);
      }
    },
    resetForm() {
      this.form = {
        name: '',
        notes: '',
        daysOfWeek: [],
        emailReminderEnabled: false,
        reminderTimesByDay: {}
      };
    },
    clampHour(day, i) {
      const time = this.form.reminderTimesByDay[day][i];
      if (time.hour < 0) time.hour = 0;
      if (time.hour > 12) time.hour = 12;
    },
    clampMinute(day, i) {
      const time = this.form.reminderTimesByDay[day][i];
      if (time.minute < 0) time.minute = 0;
      if (time.minute > 59) time.minute = 59;
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #1f1f1f;
  color: #f0f0f0;
  padding: 24px;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: fadeInScale 0.3s ease forwards;
}

.modal-content {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

input[type='text'],
input[type='number'],
textarea,
select {
  width: 100%;
  padding: 8px 12px;
  margin-top: 8px;
  margin-bottom: 12px;
  border-radius: 6px;
  border: 1px solid #555;
  background-color: #2c2c2c;
  color: #f0f0f0;
  font-size: 14px;
}

textarea {
  resize: vertical;
  min-height: 60px;
}

.days {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.days label {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #333;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
}

.days input[type='checkbox'] {
  display: none;
}

.days input[type='checkbox']:checked + span {
  background-color: #4caf50;
  color: white;
}

.time-entry {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.time-entry input[type='number'] {
  width: 70px;
  text-align: center;
}

.time-entry button {
  background: none;
  color: #e74c3c;
  font-size: 18px;
  padding: 4px;
  border: none;
  cursor: pointer;
}

button {
  padding: 8px 16px;
  margin-top: 10px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button[type='submit'] {
  background-color: #4caf50;
  color: white;
}

button[type='submit']:hover {
  background-color: #43a047;
}

button.cancel {
  background-color: #888;
  color: white;
}

button.cancel:hover {
  background-color: #777;
}

button.delete {
  background-color: #e74c3c;
  color: white;
}

button.delete:hover {
  background-color: #c0392b;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 20px;
  gap: 10px;
}

.left-buttons {
  flex-shrink: 0;
}

.right-buttons {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
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