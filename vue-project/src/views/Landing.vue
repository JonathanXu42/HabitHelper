<template>
  <Header></Header>
  <div class="landing">
    <div>
      <h1> Welcome, {{ userStore.user.firstName + " " +  userStore.user.lastName }}! </h1>
    </div>
  </div>

  <button class="add-button" @click="openAddModal">+</button>

  <!-- Grid of Habits -->
  <div class="habit-grid-wrapper" v-if="habits.length">
    <draggable
      v-model="habits"
      item-key="id"
      animation="200"
      ghost-class="drag-ghost"
      chosen-class="drag-chosen"
      class="habit-grid"
    >
      <template #item="{ element }">
        <HabitCard :habit="element" @edit="openEditModal" />
      </template>
    </draggable>
  </div>

  <HabitModal v-if="showModal" :editMode="editMode" :habitData="habitToEdit" @close="closeModal" @created="fetchHabits" @deleted="fetchHabits" />
</template>

<script>
import Header from '../components/Header.vue'
import HabitCard from '../components/HabitCard.vue'
import HabitModal from '../components/HabitModal.vue'
import { useUserStore } from '../stores/userStore'
import draggable from 'vuedraggable'

export default {
  name: 'Landing',
  components: { 
    Header,
    HabitModal,
    HabitCard,
    draggable
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

.habit-grid-wrapper {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.habit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px; /* Increased spacing between habit cards */
}

/* Visual feedback */
.drag-ghost {
  opacity: 0.5;
}
.drag-chosen {
  transform: rotate(1deg);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
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