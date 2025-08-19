// LIFF Configuration
export const LIFF_CONFIG = {
  // ⚠️ IMPORTANT: Replace this with your actual LIFF Channel ID from LINE Developers Console
  // Go to https://developers.line.biz/console/
  // Create a new Channel or use existing one
  // Add a LIFF app and copy the LIFF ID (not Channel ID)
  CHANNEL_ID: '2007882550-gB0lXQvK', // Replace with your actual LIFF ID
  
  // LIFF App URL (optional, for reference)
  APP_URL: 'https://liff.line.me/2007882550-gB0lXQvK',
  
  // Features to enable
  FEATURES: {
    PROFILE: true,
    LOGIN: true,
    LOGOUT: true
  }
}

// Helper function to check if LIFF is available
export const isLiffAvailable = () => {
  return typeof window !== 'undefined' && typeof window.liff !== 'undefined'
}

// Helper function to check if we're in LINE app
export const isInLineApp = () => {
  return isLiffAvailable() && window.liff.isInClient()
}
