<template>
  <div class="max-w-2xl mx-auto p-6">
    <Header></Header>
    <h1 class="text-2xl font-bold mb-6">
      Logs for: {{ habit?.name }}
    </h1>

    <div v-if="logs.length === 0" class="text-gray-500 text-center">
      No logs yet.
    </div>

    <div v-else>
      <HabitLogCard
        v-for="log in sortedLogs"
        :key="log.id"
        :log="log"
        @edit="openEditModal"
        @deleted="handleDeleted"
      />
    </div>

     <HabitLogModal
      v-if="showModal"
      :habit-id="habit.id"
      :log-to-edit="logBeingEdited"
      @edited="handleEdited"
      @added="handleAdded"
      @close="closeModal"
    />

    <button class="add-button" @click="openAddModal">+</button>
  </div>
</template>

<script>
import Header from '../components/Header.vue'
import HabitLogCard from '../components/HabitLogCard.vue';
import HabitLogModal from '../components/HabitLogModal.vue';

export default {
  name: 'HabitLog',
  components: { 
    Header,
    HabitLogCard,
    HabitLogModal 
  },
  data() {
    return {
      habit: null,
      logs: [],
      showModal: false
    };
  },
  computed: {
    sortedLogs() {
      return [...this.logs].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
    }
  },
  async created() {
    const habitId = this.$route.params.habitId;

    // First fetch the habit
    const habitRes = await fetch(`/api/habits/${habitId}`, {
      credentials: 'include'
    });
    if (!habitRes.ok) {
      console.error('Failed to fetch habit:', await habitRes.text());
      this.$router.push('/habit-not-found');  //I don't have a custom habit-not-found page, so this just defaults to
      return;                                 //the standard 404 not found page
    }
    this.habit = await habitRes.json();

    // Then fetch its logs from the correct route
    const logsRes = await fetch(`/api/habit-logs/${habitId}/logs`, {
      credentials: 'include'
    });
    if (!logsRes.ok) {
      console.error('Failed to fetch habit logs:', await logsRes.text());
      return;
    }
    this.logs = await logsRes.json();
  },
  methods: {
    openAddModal() {
      this.showModal = true;
      this.logBeingEdited = null;
    },
    openEditModal(log) {
      this.showModal = true;
      this.logBeingEdited = log;
    },
    closeModal() {
      this.showModal = false;
      this.logBeingEdited = null;
    },
    handleAdded(newLog) {
      this.logs.unshift(newLog);
      this.showModal = false;
    },
    handleEdited(updatedLog) {
      const index = this.logs.findIndex(l => l.id === updatedLog.id);
      if (index !== -1) this.logs.splice(index, 1, updatedLog);

      this.closeModal();
    },
    handleDeleted(logId) {
      this.logs = this.logs.filter(log => log.id !== logId);
    }
  }
};
</script>

<style>
/* Header title */
h1.text-2xl.font-bold.mb-6 {
  color: #4caf50;
  font-weight: 700;
  font-size: 2.25rem;
  text-align: center;
  text-shadow: 0 0 8px #4caf50aa;
  user-select: none;
}

/* No logs message */
.text-gray-500.text-center {
  color: #7a7a7a;
  font-style: italic;
  margin-top: 3rem;
  user-select: none;
}

/* Add button */
.add-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  font-size: 28px;
  padding: 14px 20px;
  border-radius: 50%;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px #4caf50cc;
  transition: background-color 0.3s ease, transform 0.2s ease;
  user-select: none;
}

.add-button:hover {
  background-color: #81c784;
  transform: scale(1.1);
}

.add-button:active {
  transform: scale(0.95);
}
</style>