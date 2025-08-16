import { ref, computed } from 'vue'

export function useLoading() {
  const loadingStates = ref(new Map())
  const globalLoading = ref(false)

  // Set loading state for a specific key
  const setLoading = (key, isLoading = true) => {
    loadingStates.value.set(key, isLoading)
  }

  // Get loading state for a specific key
  const isLoading = (key) => {
    return loadingStates.value.get(key) || false
  }

  // Clear loading state for a specific key
  const clearLoading = (key) => {
    loadingStates.value.delete(key)
  }

  // Set global loading state
  const setGlobalLoading = (isLoading = true) => {
    globalLoading.value = isLoading
  }

  // Check if any loading state is active
  const hasAnyLoading = computed(() => {
    return globalLoading.value || Array.from(loadingStates.value.values()).some(Boolean)
  })

  // Clear all loading states
  const clearAllLoading = () => {
    loadingStates.value.clear()
    globalLoading.value = false
  }

  return {
    loadingStates,
    globalLoading,
    setLoading,
    isLoading,
    clearLoading,
    setGlobalLoading,
    hasAnyLoading,
    clearAllLoading
  }
}
