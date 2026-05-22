import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PaymentHistory from '../components/PaymentHistory';

// Mock fetch
global.fetch = jest.fn();

// Mock sessionStorage
const mockUser = {
  email: 'member@stokvel.com',
  name: 'Test Member',
  surname: 'User',
  _id: 'user123'
};

beforeEach(() => {
  jest.clearAllMocks();
  Storage.prototype.getItem = jest.fn(() => JSON.stringify(mockUser));
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('PaymentHistory Component', () => {

  test('renders loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    render(<PaymentHistory user={mockUser} groupName="Test Group" groupId="123" />);
    
    expect(screen.getByText('Loading payment history...')).toBeInTheDocument();
  });

  test('handles missing user gracefully', async () => {
    render(<PaymentHistory user={null} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Loading payment history...')).toBeInTheDocument();
    });
  });
});
