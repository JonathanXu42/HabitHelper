<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Add a New Habit</h2>
      <form @submit.prevent="submitHabit">
        <div>
          <label>Name:</label>
          <input v-model="form.name" required />
        </div>

        <div>
          <label>Notes:</label>
          <textarea v-model="form.notes" />
        </div>

        <div>
          <label>Days of the Week:</label>
          <div class="days">
            <label v-for="(day, index) in days" :key="index">
              <input type="checkbox" :value="index" v-model="form.daysOfWeek" />
              {{ day }}
            </label>
          </div>
        </div>

        <!-- Email Reminder Checkbox -->
        <div>
          <label>
            <input type="checkbox" v-model="form.emailReminderEnabled" />
            Enable Email Reminders
          </label>
        </div>

        <!-- Reminder Times by Day -->
        <div v-if="form.emailReminderEnabled">
          <div v-for="dayIndex in form.daysOfWeek" :key="dayIndex">
            <h4>{{ days[dayIndex] }}</h4>
            <div
              v-for="(time, i) in form.reminderTimesByDay[dayIndex]"
              :key="i"
              class="time-entry"
            >
              <input type="number" v-model.number="time.hour" min="1" max="12" style="width: 60px;" @input="clampHour(dayIndex, i)" />
              :
              <input type="number" v-model.number="time.minute" min="0" max="59" style="width: 60px;" @input="clampMinute(dayIndex, i)"/>
              <select v-model="time.period">
                <option>AM</option>
                <option>PM</option>
              </select>
              <button type="button" @click="removeTime(dayIndex, i)">🗑</button>
            </div>
            <button type="button" @click="addTime(dayIndex)">+ Add Time</button>
          </div>
        </div>

        <button type="submit">Add Habit</button>
        <button type="button" @click="$emit('close')">Cancel</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HabitModal',
  data() {
    return {
      form: {
        name: '',
        notes: '',
        daysOfWeek: [],
        emailReminderEnabled: false,
        reminderTimesByDay: []
      },
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
  },
  watch: {
    // Initialize empty arrays when daysOfWeek changes
    'form.daysOfWeek'(newDays) {
      for (const day of newDays) {
        if (!this.form.reminderTimesByDay[day]) {
          this.form.reminderTimesByDay[day] = [];
        }
      }

      // Sort the daysOfWeek array in-place (numeric ascending)
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
        alert(`Time ${newFormatted} already exists for ${this.days[day]}`);
      }
    },
    sortTimesForDay(day) {
      this.form.reminderTimesByDay[day].sort((a, b) => {
        const timeA = this.formatTime(a);
        const timeB = this.formatTime(b);
        return timeA.localeCompare(timeB); // Lexicographic sort like "08:00" < "14:00"
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
        const response = await fetch('http://localhost:3000/api/habits', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to create habit');

        this.$emit('close');
      } catch (err) {
        alert(err.message);
      }
    },
    clampHour(day, i) {
      const time = this.form.reminderTimesByDay[day][i];
      if (time.hour < 1) time.hour = 1;
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
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(12, 11, 11, 0.5);
  display: flex; justify-content: center; align-items: center;
}

.modal {
  background: rgb(207, 80, 80);
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.days {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.time-entry {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
}
</style>