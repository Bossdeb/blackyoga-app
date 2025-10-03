<template>
	<div class="min-h-screen bg-gray-50">
		<header class="bg-white text-gray-900 shadow-sm border-b border-gray-200 sticky top-0 z-10">
			<div class="max-w-3xl mx-auto px-4 sm:px-6 py-4">
				<div class="flex items-center justify-between gap-3">
					<div>
						<h1 class="text-xl sm:text-2xl font-bold">👤 รายละเอียดผู้ใช้</h1>
						<p class="text-gray-500 text-xs sm:text-sm">ดูข้อมูล โปรไฟล์ พอยต์ และประวัติการทำรายการ</p>
					</div>
					<router-link to="/admin/users" class="text-sm text-gray-600 hover:text-gray-800">ย้อนกลับ</router-link>
				</div>
			</div>
		</header>

	<main class="max-w-3xl mx-auto px-4 sm:px-6 py-4 pb-24">
		<div v-if="loading" class="space-y-3">
			<div class="h-24 rounded-2xl border border-gray-200 animate-pulse"></div>
			<div class="h-24 rounded-2xl border border-gray-200 animate-pulse"></div>
		</div>
		<div v-else class="space-y-4">
			<!-- Profile card -->
			<div class="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
				<div class="flex items-center gap-4">
					<img v-if="target.pictureUrl" :src="target.pictureUrl" class="w-16 h-16 rounded-full object-cover" />
					<div v-else class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">👤</div>
					<div class="min-w-0">
						<div class="text-lg font-semibold truncate">{{ displayName(target) }}</div>
						<div class="text-sm text-gray-500">สิทธิ์: {{ target.role || 'member' }}</div>
					</div>
					<div class="ml-auto text-right">
						<div class="text-2xl font-bold text-gray-900">{{ target.points || 0 }}</div>
						<div class="text-gray-500 text-sm">พอยต์</div>
					</div>
				</div>
			</div>

			<!-- Expiry controls -->
			<div class="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
				<div class="flex items-center justify-between gap-3 flex-wrap">
					<div>
						<div class="font-medium text-gray-900">วันหมดอายุพอยต์</div>
						<div v-if="expireAt" class="text-sm mt-1" :class="isExpired ? 'text-red-600' : 'text-gray-600'">
							{{ formatDate(expireAt) }}
						</div>
						<div v-else class="text-sm mt-1 text-gray-400">ยังไม่ตั้งวันหมดอายุ</div>
					</div>
					<div class="flex items-center gap-2">
						<input v-model="expireInput" type="date" class="border border-gray-300 rounded-lg px-3 py-2" />
						<button @click="saveExpiry" class="bg-lineGreen text-white rounded-lg px-3 py-2">บันทึก</button>
						<button @click="clearExpiry" class="bg-gray-200 rounded-lg px-3 py-2">ลบวันหมดอายุ</button>
					</div>
				</div>
				<div v-if="isExpired" class="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
					พอยต์ของผู้ใช้นี้หมดอายุแล้ว จะไม่สามารถใช้จองคลาสได้
				</div>
			</div>

			<!-- Transactions -->
			<div class="bg-white rounded-2xl border border-gray-200">
				<div class="p-4 sm:p-6 border-b">
					<h3 class="text-lg font-semibold text-gray-900">ประวัติการทำรายการพอยต์</h3>
				</div>
				<div class="p-4 sm:p-6 space-y-3">
					<div v-if="txLoading" class="space-y-2">
						<div v-for="i in 5" :key="i" class="h-16 rounded-lg border border-gray-200 animate-pulse"></div>
					</div>
					<div v-else>
						<div v-if="transactions.length === 0" class="text-center text-gray-500 py-8">ไม่มีประวัติการทำรายการ</div>
						<div v-else class="space-y-3">
							<div v-for="t in transactions" :key="t.id" class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<div class="text-2xl">{{ t.emoji || '💰' }}</div>
										<div>
											<div class="text-gray-900 font-medium">{{ t.description || '-' }}</div>
											<div class="text-sm text-gray-500">{{ formatDate(t.createdAt) }}</div>
										</div>
									</div>
									<div class="text-right">
										<div :class="t.type === 'added' ? 'text-green-600' : 'text-red-600'" class="text-lg font-bold">
											{{ t.type === 'added' ? '+' : '-' }}{{ t.points }}
										</div>
										<div class="text-xs text-gray-400">{{ t.type === 'added' ? 'ได้รับ' : 'ใช้ไป' }}</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFirebase } from '../composables/useFirebase.js'

const route = useRoute()
const userId = computed(() => route.params.id)

const { getUserById, getPointsHistoryByUser, setUserPointsExpiry } = useFirebase()

const loading = ref(true)
const txLoading = ref(true)
const target = ref(null)
const transactions = ref([])

const expireAt = computed(() => target.value?.pointsExpireAt || null)
const isExpired = computed(() => {
	const ts = expireAt.value
	if (!ts) return false
	const d = ts.toDate ? ts.toDate() : new Date(ts)
	return new Date() > d
})

const expireInput = ref('')

const load = async () => {
	loading.value = true
	try {
		target.value = await getUserById(userId.value)
		if (target.value?.pointsExpireAt) {
			const d = target.value.pointsExpireAt.toDate ? target.value.pointsExpireAt.toDate() : new Date(target.value.pointsExpireAt)
			expireInput.value = d.toISOString().slice(0,10)
		} else {
			expireInput.value = ''
		}
	} finally {
		loading.value = false
	}
}

const loadTx = async () => {
	txLoading.value = true
	try {
		transactions.value = await getPointsHistoryByUser(userId.value)
	} finally {
		txLoading.value = false
	}
}

const saveExpiry = async () => {
	if (!userId.value) return
	await setUserPointsExpiry(userId.value, expireInput.value ? new Date(expireInput.value) : null)
	await load()
}

const clearExpiry = async () => {
	if (!userId.value) return
	await setUserPointsExpiry(userId.value, null)
	expireInput.value = ''
	await load()
}

const displayName = (u) => {
	if (!u) return ''
	const n = u.nickname || ''
	const f = u.firstName || ''
	const name = (n + (f ? ' ' + f : '')).trim()
	return name || 'ไม่มีชื่อ'
}

const formatDate = (timestamp) => {
	if (!timestamp) return ''
	const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
	return date.toLocaleDateString('th-TH', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

onMounted(async () => {
	await Promise.all([load(), loadTx()])
})
</script>

<style scoped>
</style>


