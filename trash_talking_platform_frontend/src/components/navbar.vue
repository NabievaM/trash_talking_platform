<template>
  <div class="px-4 py-7 bg-white rounded-b-[24px]">
    <div
      class="flex items-center justify-between w-full pb-3 border-b-2"
      style="border-color: #f1f4f5"
    >
      <div class="flex items-center space-x-1">
        <img src="../assets/icons/logo.svg" alt="Logo" />
        <div class="font-lexend text-[20px] font-[700]">PTTA</div>
      </div>

      <img src="../assets/icons/notification.svg" alt="Notification" />
    </div>

    <div class="flex gap-3 mt-3">
      <div
        class="flex items-center gap-2 py-1 px-1.5 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200"
      >
        <img src="../assets/icons/camera.svg" alt="" />
        <span class="text-sm text-gray-800 font-medium">Photo/video</span>
      </div>

      <div
        class="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200"
      >
        <img src="../assets/icons/live-video.svg" alt="" />
        <span class="text-sm text-gray-800 font-medium">Live video</span>
      </div>

      <div
        class="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200"
      >
        <img src="../assets/icons/checkin.svg" alt="" />
        <span class="text-sm text-gray-800 font-medium">Check in</span>
      </div>
    </div>
  </div>
</template>
