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
      />
    </div>

     <HabitLogModal
      v-if="showModal"
      :habit-id="habit.id"
      @close="showModal = false"
      @added="handleLogAdded"
    />

    <button class="add-button" @click="showModal = true">+</button>
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
    const habitRes = await fetch(`/api/habits/${habitId}`);
    if (!habitRes.ok) {
      console.error('Failed to fetch habit:', await habitRes.text());
      this.$router.push('/habit-not-found');  //I don't have a custom habit-not-found page, so this just defaults to
      return;                                 //the standard 404 not found page
    }
    this.habit = await habitRes.json();

    // Then fetch its logs from the correct route
    const logsRes = await fetch(`/api/habit-logs/${habitId}/logs`);
    if (!logsRes.ok) {
      console.error('Failed to fetch habit logs:', await logsRes.text());
      return;
    }
    this.logs = await logsRes.json();
  },
  methods: {
    handleLogAdded(newLog) {
      this.logs.unshift(newLog);
      this.showModal = false;
    }
  }
};
</script>

<style>
.add-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  font-size: 24px;
  padding: 12px 18px;
  border-radius: 50%;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}
</style>