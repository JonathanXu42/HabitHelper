<template>
  <div class="settings">
  <Header></Header>
    <form @submit.prevent="changeUserSettings">
      <TextInput type="firstName" v-model="firstName" placeholder="First Name" autocomplete="given-name" />
      <TextInput type="lastName" v-model="lastName" placeholder="Last Name" autocomplete="family-name" />
      
      <label for="timezone">Timezone</label>
      <multiselect
        id="timezone"
        v-model="timezone"
        :options="timezones"
        track-by="name"
        label="label"
        placeholder="Select your timezone"
        required
      />

      <button type="submit">Submit</button>
    </form>

    <button @click="showDeleteModal = true" class="danger-button">Delete Account</button>

    <dialog v-if="showDeleteModal" open class="delete-modal">
      <p>Type your email to confirm account deletion:</p>
      <input v-model="emailConfirmation" type="email" placeholder="Your email" />
      <button @click="deleteAccount">Delete</button>
      <button @click="showDeleteModal = false">Cancel</button>
    </dialog>
  </div>
</template>

<script>
import Header from '../components/Header.vue';
import TextInput from '../components/TextInput.vue';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import moment from 'moment-timezone';

export default {
  name: 'Settings',
  components: {
    Header,
    TextInput,
    Multiselect
  },
  data() {
    return {
      firstName: '',
      lastName: '',
      timezone: null,
      timezones: [],
      showDeleteModal: false,
      emailConfirmation: ''
    };
  },
  mounted() {
    // Populate timezone list with offsets
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

    const guessedName = moment.tz.guess();

    // Find the full object in timezones that matches the guessed timezone name
    this.timezone = this.timezones.find(tz => tz.name === guessedName) || null;
  },
  methods: {
    async changeUserSettings() {
      try {
        const response = await fetch('http://localhost:3000/user-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            firstName: this.firstName,
            lastName: this.lastName,
            timezone: this.timezone.name
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Unknown error');
        }

        const result = await response.json();
        alert('Settings updated successfully');
        console.log(result.user); // updated user data (optional)
        
      } catch (error) {
        console.error(error)
        alert("Couldn't update user settings")
      }
    },
    async deleteAccount() {
      try {
        const response = await fetch('http://localhost:3000/user-settings/delete-account', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: this.emailConfirmation
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete account');
        }

        alert('Account deleted successfully');
        this.$router.push('/');

      } catch (error) {
        console.error(error);
        alert("Couldn't delete account: " + error.message);
      } finally {
        this.showDeleteModal = false;
        this.emailConfirmation = '';
      }
    }
  }    
};
</script>

<style>
</style>