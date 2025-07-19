<template>
  <Header></Header>
  <div class="settings">
    <form @submit.prevent="changeUserSettings">
      <div class="input-row">
        <label>First Name</label>
        <input class="text-input" type="firstName" v-model="firstName" placeholder="First Name" autocomplete="given-name" />
      </div>

      <div class="input-row">
        <label>Last Name</label>
        <input class="text-input" type="lastName" v-model="lastName" placeholder="Last Name" autocomplete="family-name" />
      </div>

      <div class="input-row">
        <label>Email</label>
        <input class="text-input" type="email" v-model="email" autocomplete="email" />
      </div>
      
      <div class="timezone-row">
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
      </div>

      <div class="button-row">
        <button class="submit-button" type="submit">Submit</button>
        <button class="cancel-button" type="button" @click="goBack">Cancel</button>
        <button class="delete-button" type="button" @click="deleteAccount">Delete Account</button>
      </div>
    </form>

    <div v-if="awaitingNewEmailVerification" class="verification-block">
      <label for="newEmailCode">Enter verification code to change your email:</label>
      <input class="text-input" v-model="newEmailVerificationCode" id="newEmailVerificationCode" placeholder="6-digit code" />
      <button class="verify-button" @click.prevent="verifyNewEmailCode">Verify</button>
    </div>

    <div v-if="awaitingDeleteVerification" class="verification-block">
      <label for="deleteCode">Enter verification code to delete your account:</label>
      <input class="text-input" v-model="deleteVerificationCode" type="text" id="deleteCode" placeholder="6-digit code" />
      <button class="verify-button" @click.prevent="verifyDeleteCode">Verify</button>
    </div>
  </div>
</template>

<script>
import Header from '../components/Header.vue';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import { useUserStore } from '../stores/userStore';
import { fetchWithCsrf } from '../stores/csrfStore';
import { useTimezoneStore } from '../stores/timezoneStore';
import { useToast } from 'vue-toastification';

export default {
  name: 'Settings',
  components: {
    Header,
    Multiselect
  },
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      originalEmail: '',
      timezone: null,
      timezones: [],
      awaitingNewEmailVerification: false,
      newEmailCodeVerified: false,
      newEmailVerificationCode: '',
      awaitingDeleteVerification: false,
      deleteCodeVerified: false,
      deleteVerificationCode: '',
      userStore: null,
      toast: null
    };
  },
  created() {
    this.userStore = useUserStore();
    this.timezoneStore = useTimezoneStore();
    this.timezoneStore.initTimezones(); // ensure it’s only populated once
    this.timezones = this.timezoneStore.timezones;

    // Fill form from user data
    if (this.userStore.user) {
      this.firstName = this.userStore.user.firstName || '';
      this.lastName = this.userStore.user.lastName || '';
      this.email = this.userStore.user.email;
      this.originalEmail = this.userStore.user.email;
      this.timezone = this.timezones.find(tz => tz.name === this.userStore.user.timezone);
    }
    
    this.toast = useToast();
  },
  methods: {
    async changeUserSettings() {
      if (this.email !== this.originalEmail && !this.newEmailCodeVerified) {
        try {
          const response = await fetchWithCsrf('/api/send-verification-code', {
            method: 'POST',
            body: JSON.stringify({ email: this.email })
          });

          const result = await response.json();

          if (response.status === 429) {
            this.toast.warning(result.message); // "Too many attempts. Please wait a minute and try again."
            return;
          }

          if (!result.success) throw new Error(result.message);

          this.awaitingNewEmailVerification = true;
          this.toast.success('A verification code has been sent to your new email. Please enter it below.');
        
        } catch (err) {
            console.error(err);
            this.toast.error('Failed to send verification code: ' + err.message);
        }

        return; //Stop submission for now
      }

      // Continue with actual update
      try {
        const response = await fetchWithCsrf('/user-settings', {
          method: 'POST',
          body: JSON.stringify({
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            timezone: this.timezone.name
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Unknown error');
        }

        const result = await response.json();
        this.toast.success('Settings updated successfully');

        this.userStore.user = result.user;
        this.originalEmail = this.email;
        this.awaitingNewEmailVerification = false;
        this.newEmailCodeVerified = false;
        this.newEmailVerificationCode = '';

      } catch (error) {
        console.error(error);
        this.toast.error("Couldn't update user settings");
      }
    },
    async verifyNewEmailCode() {
      try {
        const response = await fetchWithCsrf('/api/verify-code', {
          method: 'POST',
          body: JSON.stringify({
            code: this.newEmailVerificationCode,
            email: this.email
          })
        });

        const result = await response.json();

        if (response.status === 429) {
          this.toast.warning(result.message); // "Too many attempts. Please wait a minute and try again."
          return;
        }

        if (!result.success) throw new Error(result.message);

        this.newEmailCodeVerified = true;
        this.awaitingNewEmailVerification = false;
        this.toast.success('Email verified! You can now resubmit your settings.');

      } catch (err) {
        console.error(err);
        this.toast.error('Verification failed: ' + err.message);
      }
    },
    goBack() {
        this.$router.push('/landing'); // or a fallback route like '/dashboard'     
    },
    async deleteAccount() {
      if (!this.deleteCodeVerified) {
        // Step 1: send verification code
        try {
          const response = await fetchWithCsrf('/api/send-verification-code', {
            method: 'POST',
            body: JSON.stringify({ email: this.originalEmail })
          });

          const result = await response.json();

          if (response.status === 429) {
            this.toast.warning(result.message); // "Too many attempts. Please wait a minute and try again."
            return;
          }

          if (!result.success) throw new Error(result.message);

          this.awaitingDeleteVerification = true;
          this.toast.success('A verification code has been sent to your email. Enter it below to confirm deletion.');
        } catch (error) {
          console.error(error);
          this.toast.error("Failed to send verification code: " + error.message);
        }

        return; // Stop until verified
      }

      // Step 2: actually delete account
      try {
        const response = await fetchWithCsrf('/user-settings/delete-account', {
          method: 'DELETE',
          body: JSON.stringify({
            email: this.originalEmail
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete account');
        }

        this.toast.success('Account deleted successfully');
        this.userStore.logout();
        this.$router.push('/');

      } catch (error) {
        console.error(error);
        this.toast.error("Couldn't delete account: " + error.message);
      }
    },
    async verifyDeleteCode() {
      try {
        const response = await fetchWithCsrf('/api/verify-code', {
          method: 'POST',
          body: JSON.stringify({
            code: this.deleteVerificationCode,
            email: this.originalEmail
          })
        });

        const result = await response.json();

        if (response.status === 429) {
          this.toast.warning(result.message); // "Too many attempts. Please wait a minute and try again."
          return;
        }

        if (!result.success) throw new Error(result.message);

        this.deleteCodeVerified = true;
        this.awaitingDeleteVerification = false;
        this.toast.success('Verification successful. You may now press "Delete Account" again to complete account deletion.');
      } catch (err) {
        console.error(err);
        this.toast.error('Verification failed: ' + err.message);
      }
    }    
  }    
};
</script>

<style>
.settings {
  padding-top: 30px;
  font-size: 20px;
}

.input-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 10px; /* increase this number for more spacing */
}

.input-row label {
  white-space: nowrap;
  width: 100px; /* or whatever fixed width works visually */
}

.text-input {
  height: 40px;
  width: 275px;
  font-size: 16px;
  border-radius: 16px;
}

.timezone-row {
  display: flex;
  align-items: center;
  width: 500px;
  gap: 24px; /* Adjust spacing between label and dropdown */
  margin-bottom: 1rem; /* Optional: for spacing from other fields */
}

.timezone-row label {
  white-space: nowrap; /* Prevent label from wrapping */
}

.button-row {
  display: flex;
  gap: 10px; /* space between buttons */
  margin-top: 1rem; /* spacing from fields */
}

.button-row button {
  padding: 0.5rem 1rem;
}

.submit-button,
.verify-button {
  background-color: #0BDA51;
  width: 250px;
  height: 50px;
  transition-duration: 0.4s;
  border-radius: 12px;
  padding: 10px;
  font-size: 18px;
  cursor: pointer;
}

.submit-button:hover,
.verify-button:hover {
  background-color: green;
  color: white;  
}

/* Adds a "pressed" effect on click */
.submit-button:active,
.verify-button:active { 
  background-color: #3e8e41;
  box-shadow: 0 5px #666;
  transform: translateY(4px);
}

.cancel-button {
  background-color: #e7dcd9;
  width: 250px;
  height: 50px;
  transition-duration: 0.4s;
  border-radius: 12px;
  padding: 10px;
  font-size: 18px;
  cursor: pointer;
}

.delete-button:hover{
  background-color: #f1e1e3;
  color: white;  
}

.delete-button {
  background-color: #EE4B2B;
  width: 250px;
  height: 50px;
  transition-duration: 0.4s;
  border-radius: 12px;
  padding: 10px;
  font-size: 18px;
  cursor: pointer;
}

.delete-button:hover{
  background-color: #C41E3A;
  color: white;  
}

/* Adds a "pressed" effect on click */
.delete-button:active { 
  background-color: 	#DC143C;
  box-shadow: 0 5px #666;
  transform: translateY(4px);
}

.verification-block {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 18px;
}
</style>