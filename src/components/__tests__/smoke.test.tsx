import { describe, it, expect } from 'vitest'

describe('Navbar', () => {
  it('can be imported', async () => {
    const mod = await import('../sections/Navbar')
    expect(mod.default).toBeDefined()
  })
})
