import { render, screen } from '@testing-library/react'
import App from './App'

test('shows controls panel', () => {
  render(<App />)
  expect(screen.getByText('Controls')).toBeInTheDocument()
})
