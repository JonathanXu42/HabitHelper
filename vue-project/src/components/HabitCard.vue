<template>
  <div class="habit-card">
    <h3 class="name">{{ habit.name }}</h3>
    <p class="notes" v-if="habit.notes">{{ habit.notes }}</p>

    <div class="streaks">
      <p>🔥 <strong>Current Streak:</strong> {{ habit.currentStreak }}</p>
      <p>🏆 <strong>Longest Streak:</strong> {{ habit.longestStreak }}</p>
    </div>

    <p class="days">
      📅 <strong>Days:</strong> {{ displayDays(habit.daysOfWeek) }}
    </p>

    <div class="actions">
      <button @click="$emit('edit', habit)">✏️ Edit</button>
      <button @click="viewLogs(habit.id)">📖 View Logs</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HabitCard',
  props: {
    habit: Object
  },
  methods: {
    displayDays(days) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days.map(d => dayNames[d]).join(', ');
    },
    viewLogs(habitId) {
      this.$router.push({ name: 'HabitLog', params: { habitId } });
    }
  }
};
</script>

<style scoped>
.habit-card {
  background: #1f1f1f;
  color: #f0f0f0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.habit-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
}

.name {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #4caf50;
}

.notes {
  font-size: 0.95rem;
  color: #a0c4ff;
  margin-bottom: 8px;
}

.streaks {
  margin-top: 10px;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #ffd166;
}

.streaks strong {
  color: #fff;
}

.days {
  margin-top: 10px;
  font-size: 0.85rem;
  color: #90caf9;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
}

button {
  background-color: #333;
  color: #f0f0f0;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

button:hover {
  background-color: #444;
  transform: scale(1.05);
}
</style>