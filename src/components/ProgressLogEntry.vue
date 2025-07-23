<template>
    <div class="progress-log-entry">
        <div class="entry-header" @click="toggleExpanded">
            <span class="entry-date">{{ date }}</span>
            <span class="toggle-icon" :class="{ rotated: expanded }">▶</span>
        </div>

        <transition
            @before-enter="beforeEnter"
            @enter="enter"
            @leave="leave"
        >
            <div v-show="expanded" class="entry-body">
                <slot></slot>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: "ProgressLogEntry",
    props: {
        date: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            expanded: false
        }
    },
    methods: {
        toggleExpanded() {
            this.expanded = !this.expanded;
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
            el.offsetHeight; // force reflow
            el.style.height = '0';
            el.style.opacity = '0';
        }
    }
}
</script>

<style scoped>
.progress-log-entry {
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  background-color: #121212;
  box-shadow: 0 4px 14px rgba(0, 128, 0, 0.3);
  color: #ddd;
  user-select: none;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.4rem;
  color: #4caf50; /* green accent */
  text-shadow: 0 0 6px #4caf50aa;
}

.entry-date {
  margin-right: 16px;
}

.toggle-icon {
  display: inline-block;
  transition: transform 0.35s ease, color 0.3s ease;
  font-size: 1.2rem;
  color: #4caf50;
}

.toggle-icon:hover {
  color: #81c784;
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
</style>