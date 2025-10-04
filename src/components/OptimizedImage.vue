<template>
  <div class="image-container" :class="containerClass">
    <img
      v-if="!isLoading && !hasError"
      :src="optimizedSrc"
      :alt="alt"
      :class="imageClass"
      :style="imageStyle"
      @load="onLoad"
      @error="onError"
      loading="lazy"
    />
    
    <!-- Loading skeleton -->
    <div 
      v-if="isLoading" 
      :class="['image-skeleton', imageClass]"
      :style="imageStyle"
    >
      <div class="skeleton-content">
        <div class="skeleton-icon">📷</div>
      </div>
    </div>
    
    <!-- Error fallback -->
    <div 
      v-if="hasError" 
      :class="['image-error', imageClass]"
      :style="imageStyle"
    >
      <div class="error-content">
        <div class="error-icon">🖼️</div>
        <div v-if="showErrorText" class="error-text">ไม่สามารถโหลดรูปภาพได้</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  width: {
    type: [Number, String],
    default: null
  },
  height: {
    type: [Number, String],
    default: null
  },
  quality: {
    type: Number,
    default: 80,
    validator: (value) => value >= 1 && value <= 100
  },
  format: {
    type: String,
    default: 'auto',
    validator: (value) => ['auto', 'webp', 'jpeg', 'png'].includes(value)
  },
  placeholder: {
    type: String,
    default: 'blur'
  },
  containerClass: {
    type: String,
    default: ''
  },
  imageClass: {
    type: String,
    default: ''
  },
  showErrorText: {
    type: Boolean,
    default: false
  },
  lazy: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['load', 'error'])

const isLoading = ref(true)
const hasError = ref(false)

// Optimize image URL based on props
const optimizedSrc = computed(() => {
  if (!props.src) return ''
  
  // If it's already an optimized URL or external URL, return as is
  if (props.src.startsWith('http') && !props.src.includes('googleapis.com')) {
    return props.src
  }
  
  // For Google Photos or other optimizable URLs
  let optimizedUrl = props.src
  
  // Add size parameters if specified
  if (props.width || props.height) {
    const sizeParam = props.width && props.height 
      ? `=w${props.width}-h${props.height}` 
      : props.width 
        ? `=w${props.width}` 
        : `=h${props.height}`
    
    if (optimizedUrl.includes('googleapis.com')) {
      optimizedUrl = optimizedUrl.replace(/=.*$/, sizeParam)
    }
  }
  
  // Add quality parameter
  if (props.quality && props.quality !== 80) {
    const qualityParam = `-q${props.quality}`
    if (optimizedUrl.includes('googleapis.com')) {
      optimizedUrl = optimizedUrl.replace(/-q\d+/, qualityParam)
      if (!optimizedUrl.includes('-q')) {
        optimizedUrl += qualityParam
      }
    }
  }
  
  return optimizedUrl
})

// Image style based on dimensions
const imageStyle = computed(() => {
  const style = {}
  
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  return style
})

// Event handlers
const onLoad = () => {
  isLoading.value = false
  hasError.value = false
  emit('load')
}

const onError = () => {
  isLoading.value = false
  hasError.value = true
  emit('error')
}

// Watch for src changes
watch(() => props.src, () => {
  isLoading.value = true
  hasError.value = false
}, { immediate: true })

// Expose methods
defineExpose({
  reload: () => {
    isLoading.value = true
    hasError.value = false
  }
})
</script>

<style scoped>
.image-container {
  position: relative;
  overflow: hidden;
}

.image-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.skeleton-icon {
  font-size: 1.5rem;
  opacity: 0.5;
}

.image-error {
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.error-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.error-text {
  font-size: 0.75rem;
  text-align: center;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive image styles */
img {
  max-width: 100%;
  height: auto;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

/* Aspect ratio containers */
.image-container.aspect-square {
  aspect-ratio: 1 / 1;
}

.image-container.aspect-video {
  aspect-ratio: 16 / 9;
}

.image-container.aspect-portrait {
  aspect-ratio: 3 / 4;
}

/* Rounded corners */
.image-container.rounded {
  border-radius: 0.5rem;
  overflow: hidden;
}

.image-container.rounded-lg {
  border-radius: 0.75rem;
  overflow: hidden;
}

.image-container.rounded-xl {
  border-radius: 1rem;
  overflow: hidden;
}

.image-container.rounded-full {
  border-radius: 50%;
  overflow: hidden;
}
</style>
