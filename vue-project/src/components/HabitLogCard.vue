<template>
  <div class="habit-log-card p-4 mb-4 rounded-lg shadow bg-white dark:bg-gray-800">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold">
        {{ formatDate(log.date) }}
      </h3>
      <span
        class="px-2 py-1 rounded text-sm"
        :class="log.completed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'"
      >
        {{ log.completed ? 'Completed' : 'Missed' }}
      </span>
    </div>
    <p v-if="log.progress !== null" class="mt-1 text-sm text-gray-700 dark:text-gray-300">
      Progress: {{ log.progress }}
    </p>
    <p v-if="log.notes" class="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
      {{ log.notes }}
    </p>

    <button @click="$emit('edit', log)" class="mt-2 text-blue-600 hover:underline">
      ✏️ Edit Log
    </button>    
    <button
      type="button"
      @click="confirmDelete"
      style="margin-left: 10px; background-color: crimson; color: white;"
    >
      Delete
    </button>
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
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    async confirmDelete() {
      if (!confirm('Are you sure you want to delete this habit? This cannot be undone.')) return;

      try {
        const response = await fetch(`/api/habit-logs/${this.log.habitId}/logs/${this.log.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete habit');

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
  transition: transform 0.2s ease;
}
.habit-log-card:hover {
  transform: scale(1.02);
}
</style>