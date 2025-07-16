<template>
  <div class="habit-log-card">
    <div class="header-row">
      <h3 class="date-time">
        {{ formatDateTime(log.date) }}
      </h3>
      <span
        class="status-badge"
        :class="log.completed ? 'completed' : 'missed'"
      >
        {{ log.completed ? 'Completed' : 'Missed' }}
      </span>
    </div>

    <p v-if="log.progress !== null" class="progress">
      Progress: {{ log.progress }}
    </p>
    <p v-if="log.notes" class="notes">
      {{ log.notes }}
    </p>

    <div class="actions">
      <button class="edit-btn" @click="$emit('edit', log)">✏️ Edit Log</button>
      <button class="delete-btn" @click="confirmDelete">Delete</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HabitLogCard',
  props: {
    log: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDateTime(dateStr) {
      const date = new Date(dateStr);
      // Format date + time localized to user
      return date.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      });
    },
    async confirmDelete() {
      if (!confirm('Are you sure you want to delete this habit log? This cannot be undone.')) return;

      try {
        const response = await fetch(`/api/habit-logs/${this.log.habitId}/logs/${this.log.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete habit log');

        this.$emit('deleted', this.log.id);
      } catch (err) {
        alert(err.message);
      }
    }
  }
};
</script>

<style scoped>
.habit-log-card {
  background-color: #1f1f1f;
  color: #f0f0f0;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.7);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 1rem;
}

.habit-log-card:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 28px rgba(76, 175, 80, 0.7);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.date-time {
  font-weight: 600;
  font-size: 1.15rem;
  color: #4caf50;
}

.status-badge {
  padding: 0.25rem 0.8rem;
  font-weight: 600;
  font-size: 0.85rem;
  border-radius: 9999px;
  user-select: none;
}

.status-badge.completed {
  background-color: #4caf50;
  color: #122a00;
  box-shadow: 0 0 6px #4caf50aa;
}

.status-badge.missed {
  background-color: #e57373;
  color: #450000;
  box-shadow: 0 0 6px #e57373aa;
}

.progress {
  margin-bottom: 0.6rem;
  font-size: 0.9rem;
  color: #a5d6a7;
}

.notes {
  font-style: italic;
  font-size: 0.9rem;
  color: #9e9e9e;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 0.8rem;
}

.actions button {
  cursor: pointer;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.edit-btn {
  background-color: #4caf50;
  color: #122a00;
  box-shadow: 0 0 6px #4caf50aa;
}

.edit-btn:hover {
  background-color: #43a047;
  transform: scale(1.05);
  box-shadow: 0 0 12px #4caf50ff;
}

.delete-btn {
  background-color: #d32f2f;
  color: #fff;
  box-shadow: 0 0 6px #d32f2faa;
}

.delete-btn:hover {
  background-color: #b71c1c;
  transform: scale(1.05);
  box-shadow: 0 0 12px #d32f2fff;
}
</style>