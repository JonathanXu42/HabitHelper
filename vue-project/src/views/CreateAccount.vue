<template>
    <div class="create-account">
        <form @submit.prevent="handleInitialSubmit">
            <input type="firstName" v-model="signupFirstName" placeholder="First Name" autocomplete="given-name" />
            <input type="lastName" v-model="signupLastName" placeholder="Last Name" autocomplete="family-name" />
            <input type="email" v-model="signupEmail" placeholder="Email" autocomplete="email" required />
            <input type="password" v-model="signupPassword" placeholder="Password" autocomplete="new-password" required />
            <input type="password" v-model="signupConfirm" placeholder="Confirm password" autocomplete="new-password" required />

            <label for="timezone">Timezone</label>
            <multiselect
                id="timezone"
                v-model="signupTimezone"
                :options="timezones"
                track-by="name"
                label="label"
                placeholder="Select your timezone"
                required
            />

            <button type="submit">Submit</button>
        </form>

        <form v-if="codeSent" @submit.prevent="verifyCode">
            <input
                type="text"
                v-model="enteredCode"
                placeholder="Enter 6-digit code"
                required
            />
            <button type="submit">Verify</button>
        </form>
    </div>
</template>

<script>
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import { useTimezoneStore } from '../stores/timezoneStore';

export default {
    name: 'Create-Account',
        components: {
        Multiselect
    },
    data() {
        return {
            signupFirstName: '',
            signupLastName: '',
            signupEmail: '',
            signupPassword: '',
            signupTimezone: null,
            signupConfirm: '',
            signupTimezone: null,
            timezoneStore: null,
            timezones: [],
            codeSent: false,
            enteredCode: '',
            codeVerified: false
        };
    },
    created() {
        this.timezoneStore = useTimezoneStore();
        this.timezoneStore.initTimezones();
        this.timezones = this.timezoneStore.timezones;
        this.signupTimezone = this.timezoneStore.guessDefault();
    },
    methods: {
        async handleInitialSubmit() {
            if (this.signupPassword !== this.signupConfirm) {
                return alert('Passwords do not match');
            }

            if (!this.signupEmail.includes('@')) {
                return alert('Please enter a valid email address.');
            }

            try {
                const checkRes = await fetch('http://localhost:3000/auth/check-existing-account', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.signupEmail })
                });

                const checkResult = await checkRes.json();
                if (!checkResult.success) {
                    return alert(checkResult.message || 'Email is already registered');
                }
            } catch (err) {
                console.error('Error checking email:', err);
                return alert('Failed to check email availability');
            }

            try {
                const response = await fetch('/api/send-verification-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.signupEmail })
                });

                const result = await response.json();
                if (result.success) {
                    this.codeSent = true;
                    alert(`Verification code sent to ${this.signupEmail}`);
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('Error sending verification code:', error);
                alert('There was a problem sending the verification code.');
            }
        },

        async verifyCode() {
            try {
                const response = await fetch('/api/verify-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        email: this.signupEmail,
                        code: this.enteredCode
                    })
                });

                const result = await response.json();

                if (result.success) {
                    alert('Verification successful!');
                    this.codeVerified = true;
                    this.createAccount();
                } else {
                    alert(result.message || 'Verification failed');
                }
            } catch (error) {
                console.error('Verification failed:', error);
                alert('Verification failed');
            }
        },
        async createAccount() {
            try {
                const response = await fetch('http://localhost:3000/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', 
                    body: JSON.stringify({
                        firstName: this.signupFirstName,
                        lastName: this.signupLastName,
                        email: this.signupEmail,
                        password: this.signupPassword,
                        timezone: this.signupTimezone.name
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    return alert(error.error || 'Signup failed');
                }

                const user = await response.json();
                this.$router.push('/landing');
            } catch (err) {
                console.error('Signup request failed:', err)
                alert('Signup request failed');
            }
        }
    }
}
</script>

<style>
</style>