import { ref, onMounted, onUnmounted } from 'vue'

// Performance metrics
const metrics = ref({
  pageLoadTime: 0,
  firstContentfulPaint: 0,
  largestContentfulPaint: 0,
  firstInputDelay: 0,
  cumulativeLayoutShift: 0,
  memoryUsage: 0,
  networkSpeed: 'unknown'
})

// Performance monitoring composable
export function usePerformance() {
  const isSupported = ref(false)
  const observer = ref(null)

  // Check if Performance API is supported
  const checkSupport = () => {
    isSupported.value = typeof window !== 'undefined' && 
      'performance' in window && 
      'PerformanceObserver' in window
  }

  // Get basic performance metrics
  const getBasicMetrics = () => {
    if (!isSupported.value) return

    try {
      const navigation = performance.getEntriesByType('navigation')[0]
      if (navigation) {
        metrics.value.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart
      }

      // Get memory usage if available
      if ('memory' in performance) {
        metrics.value.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024 // MB
      }

      // Get network speed if available
      if ('connection' in navigator) {
        const connection = navigator.connection
        metrics.value.networkSpeed = connection.effectiveType || 'unknown'
      }
    } catch (error) {
      console.warn('Failed to get basic performance metrics:', error)
    }
  }

  // Setup Performance Observer for Core Web Vitals
  const setupPerformanceObserver = () => {
    if (!isSupported.value) return

    try {
      observer.value = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                metrics.value.firstContentfulPaint = entry.startTime
              }
              break
            
            case 'largest-contentful-paint':
              metrics.value.largestContentfulPaint = entry.startTime
              break
            
            case 'first-input':
              metrics.value.firstInputDelay = entry.processingStart - entry.startTime
              break
            
            case 'layout-shift':
              if (!entry.hadRecentInput) {
                metrics.value.cumulativeLayoutShift += entry.value
              }
              break
          }
        }
      })

      // Observe different entry types
      observer.value.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (error) {
      console.warn('Failed to setup Performance Observer:', error)
    }
  }

  // Measure function execution time
  const measureFunction = (fn, name = 'function') => {
    return (...args) => {
      const start = performance.now()
      const result = fn(...args)
      const end = performance.now()
      
      console.log(`${name} execution time: ${(end - start).toFixed(2)}ms`)
      return result
    }
  }

  // Measure async function execution time
  const measureAsyncFunction = async (fn, name = 'async-function') => {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    
    console.log(`${name} execution time: ${(end - start).toFixed(2)}ms`)
    return result
  }

  // Get current metrics
  const getMetrics = () => {
    getBasicMetrics()
    return { ...metrics.value }
  }

  // Get performance score based on metrics
  const getPerformanceScore = () => {
    const scores = {
      fcp: metrics.value.firstContentfulPaint <= 1800 ? 100 : 
           metrics.value.firstContentfulPaint <= 3000 ? 75 : 
           metrics.value.firstContentfulPaint <= 4000 ? 50 : 25,
      
      lcp: metrics.value.largestContentfulPaint <= 2500 ? 100 : 
           metrics.value.largestContentfulPaint <= 4000 ? 75 : 
           metrics.value.largestContentfulPaint <= 6000 ? 50 : 25,
      
      fid: metrics.value.firstInputDelay <= 100 ? 100 : 
           metrics.value.firstInputDelay <= 300 ? 75 : 
           metrics.value.firstInputDelay <= 500 ? 50 : 25,
      
      cls: metrics.value.cumulativeLayoutShift <= 0.1 ? 100 : 
           metrics.value.cumulativeLayoutShift <= 0.25 ? 75 : 
           metrics.value.cumulativeLayoutShift <= 0.4 ? 50 : 25
    }

    const overallScore = Math.round((scores.fcp + scores.lcp + scores.fid + scores.cls) / 4)
    
    return {
      overall: overallScore,
      breakdown: scores,
      grade: overallScore >= 90 ? 'A' : 
             overallScore >= 80 ? 'B' : 
             overallScore >= 70 ? 'C' : 
             overallScore >= 60 ? 'D' : 'F'
    }
  }

  // Log performance report
  const logPerformanceReport = () => {
    const score = getPerformanceScore()
    const currentMetrics = getMetrics()
    
    console.group('🚀 Performance Report')
    console.log('Overall Score:', `${score.overall}/100 (${score.grade})`)
    console.log('Breakdown:', score.breakdown)
    console.log('Metrics:', currentMetrics)
    console.groupEnd()
    
    return { score, metrics: currentMetrics }
  }

  // Monitor resource loading
  const monitorResources = () => {
    if (!isSupported.value) return

    const resources = performance.getEntriesByType('resource')
    const resourceStats = {
      total: resources.length,
      images: resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)).length,
      scripts: resources.filter(r => r.name.match(/\.js$/i)).length,
      stylesheets: resources.filter(r => r.name.match(/\.css$/i)).length,
      fonts: resources.filter(r => r.name.match(/\.(woff|woff2|ttf|otf)$/i)).length,
      totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
    }

    console.log('📊 Resource Statistics:', resourceStats)
    return resourceStats
  }

  // Setup monitoring
  const startMonitoring = () => {
    checkSupport()
    if (isSupported.value) {
      setupPerformanceObserver()
      getBasicMetrics()
      
      // Log report after page load
      setTimeout(() => {
        logPerformanceReport()
        monitorResources()
      }, 2000)
    }
  }

  // Cleanup
  const stopMonitoring = () => {
    if (observer.value) {
      observer.value.disconnect()
      observer.value = null
    }
  }

  // Auto-start monitoring
  onMounted(() => {
    startMonitoring()
  })

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    metrics,
    isSupported,
    getMetrics,
    getPerformanceScore,
    logPerformanceReport,
    monitorResources,
    measureFunction,
    measureAsyncFunction,
    startMonitoring,
    stopMonitoring
  }
}

// Export metrics for global access
export { metrics }
