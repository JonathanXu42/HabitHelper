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
      },
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
  },
  methods: {
    async submitHabit() {
      try {
        const response = await fetch('http://localhost:3000/api/habits', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });

        if (!response.ok) throw new Error('Failed to create habit');

        this.$emit('close');
      } catch (err) {
        alert(err.message);
      }
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
</style>