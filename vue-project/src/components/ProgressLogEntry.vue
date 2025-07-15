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
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  background-color: #0a0a0a;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 24px;
}

.entry-date {
  margin-right: 12px;
}

.toggle-icon {
  display: inline-block;
  transition: transform 0.4s ease;
  font-size: 1rem;
}

.toggle-icon.rotated {
  transform: rotate(90deg);
}

.entry-body {
  font-size: 16px;
  margin-top: 10px;
  line-height: 1.5;
}
</style>