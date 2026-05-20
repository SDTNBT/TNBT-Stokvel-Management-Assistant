import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentTracking from '../Dashboard/PaymentTracking';

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

const mockGroupId = '6a090b82d9d66577440cc5c';
const mockApiResponse = [
  { _id: 'member-row-1', firstName: 'Thabo', lastName: 'Khumalo', email: 'thabo.khumalo@example.com', amount: 1000, status: 'pending' },
  { _id: 'member-row-2', firstName: 'Naledi', lastName: 'Zulu', email: 'naledi.zulu@example.com', amount: 1500, status: 'missed' }
];

const renderAndMountComponent = async (groupId = mockGroupId) => {
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse });
  const utils = render(<PaymentTracking groupId={groupId} />);
  await waitFor(() => expect(screen.getByText(/Thabo Khumalo/i)).toBeInTheDocument());
  return utils;
};

describe('PaymentTracking Component', () => {
  
  it('renders loading text state initially, then loads ledger rows dynamically', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse });
    render(<PaymentTracking groupId={mockGroupId} />);
    expect(screen.getByText(/Loading tracking ledger data.../i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText(/Thabo Khumalo/i)[0]).toBeInTheDocument());
  });

  it('updates the custom toast alert string cleanly when a user changes status parameters', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse }) // Init
      .mockResolvedValueOnce({ ok: true }); // Patch

    const { container } = await renderAndMountComponent();
    const statusSelect = container.querySelector('.status-select');
    fireEvent.change(statusSelect, { target: { value: 'paid' } });

    // Matches hardcoded string: "Thabo Khumalo set to paid"
    const toastAlert = await screen.findByText(/Thabo Khumalo set to paid/i);
    expect(toastAlert).toBeInTheDocument();
  });

  it('fires individual notification pings', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse }) // Init
      .mockResolvedValueOnce({ ok: true }); // Ping

    const { container } = await renderAndMountComponent();
    const remindBtn = container.querySelector('.remind-btn');
    fireEvent.click(remindBtn);

    // Matches hardcoded string: "notification sent successfully"
    const toastAlert = await screen.findByText(/notification sent successfully/i);
    expect(toastAlert).toBeInTheDocument();
  });

  it('triggers bulk reminders via top dispatch actions', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse }) // Init
      .mockResolvedValueOnce({ ok: true }); // Bulk POST

    await renderAndMountComponent();
    const emailOutstandingBtn = screen.getByRole('button', { name: /Email Outstanding/i });
    fireEvent.click(emailOutstandingBtn);

    const toastAlert = await screen.findByText(/Dispatched reminders to 1 outstanding accounts/i);
    expect(toastAlert).toBeInTheDocument();
  });

  it('clears away the global toast monitor status banner after its timeout', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse })
      .mockResolvedValueOnce({ ok: true });

    jest.useFakeTimers();
    await renderAndMountComponent();

    const emailBtn = screen.getByRole('button', { name: /Email Outstanding/i });
    fireEvent.click(emailBtn);

    const toastAlert = await screen.findByText(/Dispatched reminders to/i);
    expect(toastAlert).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(2500); });
    expect(toastAlert).not.toBeInTheDocument();
  });
});