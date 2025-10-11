import { render } from '@testing-library/react'
import React from 'react'
import Navbar from '../sections/Navbar'

test('renders brand', () => {
  const { getByText } = render(<Navbar locale="th" />)
  expect(getByText('SOQ.')).toBeTruthy()
})
