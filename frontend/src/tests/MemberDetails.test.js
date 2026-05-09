import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MemberDetails from '../Dashboard/MemberDetails'; // Corrected Path

const mockOnClose = jest.fn();
const mockOnRemove = jest.fn();

test('renders member details correctly', () => {
  const mockMember = {
    _id: '2',
    fullName: 'Bob Mokoena',
    userEmail: 'bob@test.com',
    memberType: 'Member',
    joiningDate: '2026-04-18'
  };

  render(
    // Added future flags to silence the warnings you were seeing
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <MemberDetails member={mockMember} onClose={mockOnClose} onRemove={mockOnRemove} />
    </BrowserRouter>
  );

  // Assertions
  expect(screen.getByRole('heading', { name: /Bob Mokoena/i })).toBeInTheDocument();
  expect(screen.getByText(/bob@test.com/i)).toBeInTheDocument();
  // Matching the DD/MM/YYYY format of toLocaleDateString('en-GB')
  expect(screen.getByText(/18\/04\/2026/i)).toBeInTheDocument();
});