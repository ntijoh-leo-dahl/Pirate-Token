<template>
  <div class="authwrap">
    <div class="authbox">
      <h1>🏴‍☠️ Pirate Token <span>Chest Simulator</span></h1>
      <v-card class="card auth" variant="flat">
        <h3>{{ isSignup ? 'Create your account' : 'Log in' }}</h3>
        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-3">{{ error }}</v-alert>
        <form @submit.prevent="submit" novalidate>
          <v-text-field v-if="isSignup" v-model="name" label="Username" autocomplete="username" variant="outlined" density="comfortable" maxlength="20" />
          <v-text-field v-model="loginuser" label="Username" type="user" :autocomplete="isSignup ? 'email' : 'username'" variant="outlined" density="comfortable" />
          <v-text-field v-model="password" label="Password" :type="show ? 'text' : 'password'" :autocomplete="isSignup ? 'new-password' : 'current-password'" variant="outlined" density="comfortable"
            :hint="isSignup ? 'At least 8 characters' : ''" :persistent-hint="isSignup" :append-inner-icon="show ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="show = !show" />
          <v-text-field v-if="isSignup" v-model="confirm" label="Confirm password" :type="show ? 'text' : 'password'" autocomplete="new-password" variant="outlined" density="comfortable" class="mt-3" />
          <div class="btns">
            <v-btn type="submit" class="p" variant="flat" :loading="busy" :disabled="busy">{{ isSignup ? 'Sign up' : 'Log in' }}</v-btn>
          </div>
        </form>
        <p class="alt mute">
          <template v-if="isSignup">Already have an account? <router-link :to="{ name: 'login' }">Log in</router-link></template>
          <template v-else>New here? <router-link :to="{ name: 'signup' }">Create an account</router-link></template>
        </p>
        <p class="alt mute small">Stub API: accounts live in memory only, so a reload signs you out. Try demo@pirate.te4 / pirate123.</p>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signup, login } from '../auth/auth.js'

const route = useRoute()
const router = useRouter()
const isSignup = computed(() => route.name === 'signup')
const name = ref(''), loginuser = ref(''), password = ref(''), confirm = ref('')
const show = ref(false), busy = ref(false), error = ref('')

async function submit() {
  error.value = ''
  busy.value = true
  console.log(loginuser.value, password.value)
  try {
    if (isSignup.value) {
      if (password.value !== confirm.value) throw new Error('The two passwords do not match.')
      await signup(name.value, loginuser.value, password.value)
    } else {
      await login(loginuser.value, password.value)
    }
    router.push({ name: 'home' })
  } catch (e) {
    error.value = e?.message ?? 'Something went wrong, please try again.'
  } finally {
    busy.value = false
  }
}
</script>
