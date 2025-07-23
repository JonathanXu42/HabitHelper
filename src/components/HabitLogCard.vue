<template>
  <ConfirmDialog ref="confirmDialog" />
  <div class="habit-log-card" @click="toggleExpanded">
    <div class="header-row">
      <h3 class="date-time">
        {{ formatDateTime(log.date) }}
      </h3>
      <div class="badge-row">
        <span
          class="status-badge"
          :class="log.completed ? 'completed' : 'missed'"
        >
          {{ log.completed ? 'Completed' : 'Missed' }}
        </span>
        <span class="toggle-icon" :class="{ rotated: expanded }">▶</span>
      </div>
    </div>

    <transition
      @before-enter="beforeEnter"
      @enter="enter"
      @leave="leave"
    >
      <div v-show="expanded" class="entry-body">
        <p v-if="log.progress !== null" class="progress">
          Progress: {{ log.progress }}
        </p>
        <p v-if="log.notes" class="notes">
          {{ log.notes }}
        </p>

        <div class="actions" @click.stop>
          <button class="edit-btn" @click="$emit('edit', log)">✏️ Edit Log</button>
          <button class="delete-btn" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { fetchWithCsrf } from '@/stores/csrfStore';
import { useToast } from 'vue-toastification';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

export default {
  name: 'HabitLogCard',
  components: { ConfirmDialog },
  props: {
    log: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      expanded: true,
      toast: null
    };
  },
  created() {
    this.toast = useToast();
  },
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
    formatDateTime(dateStr) {
      const date = new Date(dateStr);
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
      const confirmed = await this.$refs.confirmDialog.show(
        'Are you sure you want to delete this habit log?'
      );

      if (!confirmed) return;

      try {
        const response = await fetchWithCsrf(`/api/habit-logs/${this.log.habitId}/logs/${this.log.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to delete habit log');
        this.$emit('deleted', this.log.id);
      } catch (err) {
        this.toast.error(err.message);
      }
    },
    beforeEnter(el) {
      el.style.height = '0';
      el.style.opacity = '0';
    },
    enter(el) {
      el.style.transition = 'all 0.3s ease';
      el.style.height = el.scrollHeight + 'px';
      el.style.opacity = '1';
    },
    leave(el) {
      el.style.transition = 'all 0.3s ease';
      el.style.height = el.scrollHeight + 'px';
      el.offsetHeight;
      el.style.height = '0';
      el.style.opacity = '0';
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
  cursor: pointer;
  user-select: none;
}

.habit-log-card:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 28px rgba(76, 175, 80, 0.7);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
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

.toggle-icon {
  font-size: 1.1rem;
  color: #4caf50;
  transition: transform 0.35s ease, color 0.2s ease;
}

.toggle-icon.rotated {
  transform: rotate(90deg);
}

.entry-body {
  font-size: 1rem;
  margin-top: 12px;
  line-height: 1.6;
  color: #b0b0b0;
  padding-left: 8px;
  border-left: 3px solid #4caf50;
  user-select: text;
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
  margin-top: 0.5rem;
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