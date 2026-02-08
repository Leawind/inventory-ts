import log from '../log/index.ts'
import { expect } from 'lay-sing'

{
  expect<typeof log>().toHaveKey<'api'>().success
}

Deno.test('log basic usage', () => {
  // Test all log levels
  console.log('=== Test all log levels ===')
  log.trace`This is a trace level log`
  log.debug`This is a debug level log`
  log.info`This is an info level log`
  log.warn`This is a warn level log`
  log.error`This is an error level log`
  log.fatal`This is a fatal level log`

  // Test regular function call
  console.log('\n=== Test regular function call ===')
  log.info('This', 'is', 'regular function call')
  log.error('Error message:', 'An error occurred')

  // Test template string with variables
  console.log('\n=== Test template string with variables ===')
  const name = 'Test User'
  const id = 123
  log.info`User ${name} (ID: ${id}) has logged in`

  // Test template string with expressions
  console.log('\n=== Test template string with expressions ===')
  const now = new Date()
  log.debug`Current time: ${now.toLocaleString()}`
  log.warn`Random number: ${Math.random().toFixed(2)}`
})

Deno.test('log level filtering', () => {
  console.log('\n=== Test log level filtering ===')

  // Set log level to warn, only warn and above should be displayed
  log.api.setLevel('warn')
  console.log('Log level set to: warn')

  // These logs should not be displayed
  log.trace`This trace log should not be displayed`
  log.debug`This debug log should not be displayed`
  log.info`This info log should not be displayed`

  // These logs should be displayed
  log.warn`This warn log should be displayed`
  log.error`This error log should be displayed`
  log.fatal`This fatal log should be displayed`

  // Restore log level
  log.api.setLevel('trace')
})

Deno.test('log scope management', () => {
  console.log('\n=== Test scope management ===')

  // Create logger with scope
  const authLogger = log.api.getSubLogger('auth')
  authLogger.info`Log from auth module`

  // Create nested scope
  const userLogger = authLogger.api.getSubLogger('user')
  userLogger.info`Log from user management submodule`

  // Test scope setting
  userLogger.api.setScope('admin')
  userLogger.info`Log after changing scope`
})

Deno.test('log error handling', () => {
  console.log('\n=== Test error handling ===')

  // Test single Error object
  try {
    throw new Error('Test error message')
  } catch (e) {
    log.error`Caught error: ${e}`
  }

  // Test multiple Error objects
  const error1 = new Error('First error')
  const error2 = new Error('Second error')
  log.error('Multiple errors occurred:', error1, 'and', error2)
})

Deno.test('log color configuration', () => {
  console.log('\n=== Test color configuration ===')

  // Disable colors
  log.api.useColors = false
  log.info`This log has no colors`

  // Enable colors
  log.api.useColors = true
  log.info`This log has colors`
})
