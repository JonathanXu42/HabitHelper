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
import { useUserStore } from '../stores/userStore';
import { useTimezoneStore } from '../stores/timezoneStore';

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
      emailConfirmation: '',
      userStore: null,
      signupTimezone: null
    };
  },
  created() {
    this.userStore = useUserStore();
    
    this.timezoneStore = useTimezoneStore();
    this.timezoneStore.initTimezones(); // ensure it’s only populated once
    this.timezones = this.timezoneStore.timezones;
    this.signupTimezone = this.timezoneStore.guessDefault();

    // Fill form from user data
    if (this.userStore.user) {
      this.firstName = this.userStore.user.firstName || '';
      this.lastName = this.userStore.user.lastName || '';
      this.timezone = this.timezones.find(tz => tz.name === this.userStore.user.timezone);
    }    
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
        
        // ✅ Update user in Pinia store
        this.userStore.user = result.user;

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
        // Clear user store and redirect
        this.userStore.logout();
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