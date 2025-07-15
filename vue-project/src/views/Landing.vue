<template>
  <Header></Header>
  <div class="landing">

    <h1>Hello World</h1>
    <div v-if="userStore.isLoggedIn">
      Welcome, {{ userStore.user.firstName + " " +  userStore.user.lastName }}!
    </div>
  </div>

  <button class="add-button" @click="openAddModal">+</button>

  <!-- Grid of Habits -->
  <div class="habit-grid" v-if="habits.length">
    <HabitCard v-for="habit in habits" :key="habit.id" :habit="habit" @edit="openEditModal" />
  </div>

  <HabitModal v-if="showModal" :editMode="editMode" :habitData="habitToEdit" @close="closeModal" @created="fetchHabits" @deleted="fetchHabits" />
</template>

<script>
import Header from '../components/Header.vue'
import HabitCard from '../components/HabitCard.vue'
import HabitModal from '../components/HabitModal.vue'
import { useUserStore } from '../stores/userStore'

export default {
  name: 'Landing',
  components: { 
    Header,
    HabitModal,
    HabitCard
  },
  data() {
    return {
      userStore: null,
      showModal: false,
      editMode: false,
      habitToEdit: null,
      habits: []
    }
  },
  async created() {
    this.userStore = useUserStore();
    await this.fetchHabits();
  },
  methods: {
    async fetchHabits() {
      try {
        const response = await fetch('http://localhost:3000/api/habits', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch habits');
        this.habits = await response.json();
      } catch (err) {
        console.error(err);
      }
    },
    openAddModal() {
      this.habitToEdit = null;
      this.editMode = false;

      // Force nextTick to let HabitModal start fresh
      this.$nextTick(() => {
        this.showModal = true;
      });
    },
    openEditModal(habit) {
      this.habitToEdit = habit;
      this.editMode = true;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.habitToEdit = null;
      this.editMode = false;
    }
  }
};
</script>

<style scoped>
.landing {
  text-align: center;
  margin: 40px auto;
  max-width: 800px;
  padding: 0 20px;
}

.habit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

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