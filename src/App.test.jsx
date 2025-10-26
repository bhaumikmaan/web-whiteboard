import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

test('opens help and shows instructions', () => {
  render(<App />)
  const helpBtn = screen.getByRole('button', { name: /open help|close help|^\?$/i })
  fireEvent.click(helpBtn)

  expect(screen.getByText('Help')).toBeInTheDocument()
  expect(screen.getByText('Draw: Left mouse / 1‑finger drag')).toBeInTheDocument()
})
