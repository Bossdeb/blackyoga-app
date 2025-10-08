<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div class="max-w-md mx-auto px-6 py-5 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span class="text-indigo-500">❓</span> ช่วยเหลือ
          </h1>
          <p class="text-gray-500 text-sm mt-0.5">คำถามที่พบบ่อยและวิธีใช้งาน</p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-md mx-auto px-6 py-8 space-y-5">
      <!-- การจองคลาส -->
      <div class="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center gap-3 mb-3">
          <div class="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10m-12 8h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">การจองคลาส</h3>
        </div>
        <ul class="list-disc pl-5 text-gray-700 space-y-1 text-sm">
          <li>จองล่วงหน้าได้ไม่เกิน 7 วัน</li>
          <li>จองคลาสได้เมื่อสมาชิกยังไม่หมดอายุ</li>
          <li>ยกเลิกได้ล่วงหน้า 2 วันก่อนเริ่มคลาส</li>
        </ul>
      </div>


      <!-- ติดต่อเรา -->
      <div class="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center gap-3 mb-3">
          <div class="bg-green-100 text-green-600 p-2 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684L10.382 6H21a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">ติดต่อเรา</h3>
        </div>
        <p class="text-gray-700 text-sm leading-relaxed">
          หากพบปัญหา โปรดติดต่อผ่าน  
          <a href="#" class="text-green-600 font-medium hover:underline">LINE Official</a> ของเรา
        </p>ห
      </div>
    </main>
  </div>
</template>

<script setup>
</script>
