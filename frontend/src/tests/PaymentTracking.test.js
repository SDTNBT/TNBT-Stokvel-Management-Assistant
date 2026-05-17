import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentTracking from '../Dashboard/PaymentTracking';


beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

const mockGroupId = '6a090b82d9d66577440cc5c';
const mockApiResponse = [
  {
    _id: 'member-row-1',
    name: 'Thabo',
    surname: 'Khumalo',
    email: 'thabo.khumalo@example.com',
    amount: 1000
  }
];

describe('PaymentTracking Component', () => {
  it('renders loading text state initially, then loads ledger rows dynamically', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    render(<PaymentTracking groupId={mockGroupId} />);

    
    expect(screen.getByText(/Loading tracking ledger data.../i)).toBeInTheDocument();

    
    await waitFor(() => {
      expect(screen.getByText('Thabo Khumalo')).toBeInTheDocument();
    });

    
    expect(screen.getByText('R 1 000')).toBeInTheDocument();
    expect(screen.getByText(`Group Reference Code: ${mockGroupId}`)).toBeInTheDocument();
  });

  it('displays an error window message if the API fetch request fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to load group database ledger'));

    render(<PaymentTracking groupId={mockGroupId} />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to load group database ledger/i)).toBeInTheDocument();
    });
  });

  it('updates the custom toast alert string cleanly when a user changes status parameters', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    
    const { container } = render(<PaymentTracking groupId={mockGroupId} />);

    await waitFor(() => {
      expect(screen.getByText('Thabo Khumalo')).toBeInTheDocument();
    });

    
    const statusSelect = container.querySelector('.status-select');
    
    
    expect(statusSelect).toBeInTheDocument();
    expect(statusSelect.value).toBe('pending');

    
    fireEvent.change(statusSelect, { target: { value: 'paid' } });

    
    expect(screen.getByText('Thabo Khumalo set to paid')).toBeInTheDocument();
  });
});