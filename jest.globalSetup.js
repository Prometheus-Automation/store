// Global setup for Jest tests
module.exports = async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  
  // Setup test database if needed
  // This would typically involve creating a test database
  // and running migrations for integration tests
  
  console.log('🧪 Jest global setup complete')
}