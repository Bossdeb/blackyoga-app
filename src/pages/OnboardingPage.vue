<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-6 py-4">
        <h1 class="text-xl font-bold text-gray-900">ยืนยันข้อมูลสมาชิก</h1>
        <p class="text-gray-500 text-sm">เพิ่มข้อมูลที่จำเป็นเพื่อใช้งานระบบ</p>
      </div>
    </header>

    <main class="max-w-md mx-auto px-6 py-6">
      <div class="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div class="flex items-center gap-3">
          <img v-if="form.pictureUrl" :src="form.pictureUrl" class="w-12 h-12 rounded-full border border-gray-200" />
          <div>
            <div class="text-gray-900 font-semibold">{{ form.displayName || 'LINE User' }}</div>
            <div class="text-sm text-gray-500">{{ form.email }}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">ชื่อเล่น</label>
            <input v-model="form.nickname" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lineGreen" placeholder="เช่น โจ้" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">ชื่อจริง</label>
              <input v-model="form.firstName" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lineGreen" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">นามสกุล</label>
              <input v-model="form.lastName" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lineGreen" />
            </div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">เบอร์โทร</label>
            <input v-model="form.phone" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lineGreen" placeholder="เช่น 0812345678" />
          </div>
        </div>

        <button @click="save" class="w-full bg-lineGreen hover:bg-green-600 text-white rounded-xl py-3 font-semibold">บันทึกและเริ่มใช้งาน</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const savedUser = JSON.parse(localStorage.getItem('black-yoga-user') || '{}')

const form = reactive({
  displayName: savedUser.displayName || savedUser.name,
  email: savedUser.email,
  pictureUrl: savedUser.pictureUrl,
  nickname: savedUser.nickname || '',
  firstName: savedUser.firstName || '',
  lastName: savedUser.lastName || '',
  phone: savedUser.phone || ''
})

async function save() {
  try {
    const token = localStorage.getItem('black-yoga-token')
    if (!token) {
      alert('ไม่พบ token กรุณาเข้าสู่ระบบใหม่')
      router.push('/login')
      return
    }

    const resp = await fetch('/api/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        nickname: form.nickname,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone
      })
    })

    if (!resp.ok) {
      if (resp.status === 401) {
        alert('Token หมดอายุ กรุณาเข้าสู่ระบบใหม่')
        localStorage.removeItem('black-yoga-token')
        localStorage.removeItem('black-yoga-user')
        router.push('/login')
        return
      }
      const error = await resp.json()
      alert(`บันทึกไม่สำเร็จ: ${error.message || 'Unknown error'}`)
      return
    }

    const updatedUser = await resp.json()
    localStorage.setItem('black-yoga-user', JSON.stringify(updatedUser))
    router.push('/')
  } catch (e) {
    console.error('Save error:', e)
    alert('เกิดข้อผิดพลาดในการบันทึก โปรดลองอีกครั้ง')
  }
}
</script>


