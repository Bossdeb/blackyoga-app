<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">BLACK YOGA</h1>
        <p class="text-gray-500">เข้าสู่ระบบเพื่อจองคลาสโยคะ</p>
      </div>

      <!-- Login Form -->
      <div class="space-y-6">
        <!-- LINE Login Button -->
        <button 
          @click="handleLineLogin"
          :disabled="loading"
          class="w-full bg-lineGreen hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
        >
          <span class="text-2xl">📱</span>
          <span>{{ loading ? 'กำลังโหลด...' : 'เข้าสู่ระบบด้วย LINE' }}</span>
        </button>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">หรือ</span>
          </div>
        </div>

        <!-- Demo Login -->
        <button 
          @click="loginAsDemo"
          :disabled="loading"
          class="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 border border-gray-200"
        >
          <span class="text-2xl">🎯</span>
          <span>เข้าสู่ระบบ Demo</span>
        </button>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-4">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-lineGreen"></div>
          <p class="text-gray-500 mt-2">กำลังเข้าสู่ระบบ...</p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {{ error }}
        </div>

        <!-- Info Message -->
        <div v-if="info" class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          {{ info }}
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-sm text-gray-500">
          การเข้าสู่ระบบหมายถึงคุณยอมรับ
          <a href="#" class="text-lineGreen hover:underline">เงื่อนไขการใช้งาน</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { isInLineApp, isLiffAvailable } from '../config/liff.js'

const router = useRouter()
const { login, loginWithLine, loading, forceLineLogin } = useAuth()
const error = ref('')
const info = ref('')

const handleLineLogin = async () => {
  error.value = ''
  info.value = ''
  
  try {
    // Check if we're in LINE environment
    if (isInLineApp()) {
      console.log('In LINE app, using forceLineLogin...')
      const success = await forceLineLogin()
      if (success) {
        router.push('/')
      } else {
        error.value = 'ไม่สามารถเข้าสู่ระบบด้วย LINE ได้ กรุณาลองใช้ Demo Login'
      }
    } else {
      console.log('Not in LINE app, using regular loginWithLine...')
      const success = await loginWithLine()
      if (success) {
        router.push('/')
      } else {
        error.value = 'ไม่สามารถเข้าสู่ระบบด้วย LINE ได้ กรุณาลองใช้ Demo Login'
      }
    }
  } catch (err) {
    console.error('LINE login error:', err)
    error.value = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ LINE กรุณาลองใช้ Demo Login'
  }
}

const loginAsDemo = async () => {
  error.value = ''
  info.value = ''
  
  try {
    const success = await login('demo@blackyoga.com', 'demo123')
    if (success) {
      router.push('/')
    } else {
      error.value = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    }
  } catch (err) {
    error.value = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ' + err.message
  }
}

onMounted(() => {
  // Check if we're in LINE environment
  if (isInLineApp()) {
    info.value = 'กำลังเข้าสู่ระบบด้วย LINE...'
    handleLineLogin()
  } else {
    info.value = 'คุณสามารถใช้ Demo Login เพื่อทดสอบแอปพลิเคชัน'
  }
})
</script> 
