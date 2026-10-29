import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('shows the placeholder page', () => {
    render(<App />)
    expect(screen.getByText(/CRM Prototype/i)).toBeInTheDocument()
  })
})
