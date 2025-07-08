import { defineStore } from 'pinia'
import moment from 'moment-timezone'

export const useTimezoneStore = defineStore('timezone', {
  state: () => ({
    timezones: []
  }),
  actions: {
    initTimezones() {
      if (this.timezones.length > 0) return; // ✅ Already populated

      this.timezones = moment.tz.names().map(tz => {
        const offsetMinutes = moment.tz(tz).utcOffset();
        const sign = offsetMinutes >= 0 ? '+' : '-';
        const hours = Math.floor(Math.abs(offsetMinutes) / 60).toString().padStart(2, '0');
        const minutes = (Math.abs(offsetMinutes) % 60).toString().padStart(2, '0');
        const offset = `UTC${sign}${hours}:${minutes}`;
        return {
          name: tz,
          label: `${tz} (${offset})`
        };
      });
    },
    guessDefault() {
      const name = moment.tz.guess();
      return this.timezones.find(tz => tz.name === name) || null;
    }
  },
  persist: {
    storage: localStorage
  }
});