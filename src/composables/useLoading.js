import { ref, computed, watch } from 'vue'

export function useLoading() {
  const loadingStates = ref(new Map())
  const globalLoading = ref(false)
  const loadingQueue = ref(new Set())

  // Set loading state for a specific key
  const setLoading = (key, isLoading = true) => {
    if (isLoading) {
      loadingStates.value.set(key, true)
      loadingQueue.value.add(key)
    } else {
      loadingStates.value.delete(key)
      loadingQueue.value.delete(key)
    }
  }

  // Get loading state for a specific key
  const isLoading = (key) => {
    return loadingStates.value.get(key) || false
  }

  // Clear loading state for a specific key
  const clearLoading = (key) => {
    loadingStates.value.delete(key)
    loadingQueue.value.delete(key)
  }

  // Set global loading state
  const setGlobalLoading = (isLoading = true) => {
    globalLoading.value = isLoading
  }

  // Check if any loading state is active
  const hasAnyLoading = computed(() => {
    return globalLoading.value || loadingStates.value.size > 0
  })

  // Get current loading keys
  const currentLoadingKeys = computed(() => {
    return Array.from(loadingStates.value.keys())
  })

  // Get loading queue size
  const queueSize = computed(() => {
    return loadingQueue.value.size
  })

  // Clear all loading states
  const clearAllLoading = () => {
    loadingStates.value.clear()
    loadingQueue.value.clear()
    globalLoading.value = false
  }

  // Loading with timeout
  const loadingWithTimeout = (key, timeoutMs = 10000) => {
    setLoading(key, true)
    
    const timeout = setTimeout(() => {
      if (isLoading(key)) {
        console.warn(`Loading timeout for key: ${key}`)
        clearLoading(key)
      }
    }, timeoutMs)
    
    return () => {
      clearTimeout(timeout)
      clearLoading(key)
    }
  }

  // Batch loading operations
  const batchLoading = async (operations) => {
    const keys = operations.map((_, index) => `batch_${Date.now()}_${index}`)
    
    // Start all operations
    keys.forEach(key => setLoading(key, true))
    
    try {
      const results = await Promise.allSettled(operations)
      return results
    } finally {
      // Clear all batch loading states
      keys.forEach(key => clearLoading(key))
    }
  }

  // Watch for loading state changes
  const onLoadingChange = (callback) => {
    return watch(hasAnyLoading, callback, { immediate: true })
  }

  // Watch for specific loading key changes
  const onKeyLoadingChange = (key, callback) => {
    return watch(() => isLoading(key), callback, { immediate: true })
  }

  // Loading progress (for operations with known steps)
  const createProgressLoader = (key, totalSteps = 1) => {
    const currentStep = ref(0)
    const progress = computed(() => (currentStep.value / totalSteps) * 100)
    
    const start = () => {
      setLoading(key, true)
      currentStep.value = 0
    }
    
    const step = () => {
      currentStep.value = Math.min(currentStep.value + 1, totalSteps)
    }
    
    const complete = () => {
      currentStep.value = totalSteps
      setTimeout(() => clearLoading(key), 100) // Small delay for visual feedback
    }
    
    const reset = () => {
      currentStep.value = 0
      clearLoading(key)
    }
    
    return {
      currentStep,
      progress,
      start,
      step,
      complete,
      reset
    }
  }

  // Debounced loading (useful for search operations)
  const debouncedLoading = (key, delay = 300) => {
    let timeoutId = null
    
    const start = () => {
      if (timeoutId) clearTimeout(timeoutId)
      setLoading(key, true)
    }
    
    const stop = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        clearLoading(key)
      }, delay)
    }
    
    const immediateStop = () => {
      if (timeoutId) clearTimeout(timeoutId)
      clearLoading(key)
    }
    
    return { start, stop, immediateStop }
  }

  return {
    loadingStates,
    globalLoading,
    loadingQueue,
    setLoading,
    isLoading,
    clearLoading,
    setGlobalLoading,
    hasAnyLoading,
    currentLoadingKeys,
    queueSize,
    clearAllLoading,
    loadingWithTimeout,
    batchLoading,
    onLoadingChange,
    onKeyLoadingChange,
    createProgressLoader,
    debouncedLoading
  }
}
