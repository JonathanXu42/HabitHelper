<template>
  <div class="habit-card">
    <h3 class="name">{{ habit.name }}</h3>
    <p class="notes" v-if="habit.notes">{{ habit.notes }}</p>
    <p class="streaks">
      🔥 Current Streak: {{ habit.currentStreak }}<br />
      🏆 Longest Streak: {{ habit.longestStreak }}
    </p>
    <p class="days">
      Days: {{ displayDays(habit.daysOfWeek) }}
    </p>

    <button @click="$emit('edit', habit)">✏️ Edit</button>
    <button @click="viewLogs(habit.id)">View Logs</button>
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
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 16px;
  background: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.name {
  color: green;
}

.notes {
  color: blue;
}

.streaks {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #444;
}
.days {
  margin-top: 6px;
  font-size: 0.85rem;
  color: #777;
}
</style>