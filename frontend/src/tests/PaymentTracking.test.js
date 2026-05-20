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
  {
    _id: 'member-row-1',
    name: 'Thabo',
    surname: 'Khumalo',
    email: 'thabo.khumalo@example.com',
    amount: 1000,
    status: 'pending'
  },
  {
    _id: 'member-row-2',
    name: 'Naledi',
    surname: 'Zulu',
    email: 'naledi.zulu@example.com',
    amount: 1500,
    status: 'missed'
  }
];

const renderAndMountComponent = async (groupId = mockGroupId) => {
  const utils = render(<PaymentTracking groupId={groupId} />);
  
  await waitFor(() => {
    const primaryNames = screen.getAllByText(/Thabo Khumalo/i);
    expect(primaryNames.length).toBeGreaterThan(0);
  });
  
  return utils;
};

describe('PaymentTracking Component', () => {
  
  
  it('renders loading text state initially, then loads ledger rows dynamically', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    render(<PaymentTracking groupId={mockGroupId} />);

    expect(screen.getByText(/Loading tracking ledger data.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/Thabo Khumalo/i)[0]).toBeInTheDocument();
    });

    expect(screen.getAllByText('R 1 000')[0]).toBeInTheDocument();
    expect(screen.getAllByText('R 1 500')[0]).toBeInTheDocument();
    expect(screen.getByText(`Group Reference Code: ${mockGroupId}`)).toBeInTheDocument();
  });

  
  it('displays an error window message if the API fetch request fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to load group database ledger'));

    render(<PaymentTracking groupId={mockGroupId} />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to load group database ledger/i)).toBeInTheDocument();
    });
  });

  it('displays an error window message if the provided group ID is falsy', async () => {
    render(<PaymentTracking groupId="" />);
    expect(screen.getByText(/Error: No group ID provided./i)).toBeInTheDocument();
  });

  
  it('updates the custom toast alert string cleanly when a user changes status parameters successfully', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse })
      .mockResolvedValueOnce({ ok: true }); 

    const { container } = await renderAndMountComponent();

    const statusSelect = container.querySelector('.status-select');
    expect(statusSelect.value).toBe('pending');

    fireEvent.change(statusSelect, { target: { value: 'paid' } });

    const toastAlert = await screen.findByText(/Thabo Khumalo set to paid/i);
    expect(toastAlert).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/groups/${mockGroupId}/contributions/member-row-1`),
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ status: 'paid' }) })
    );
  });

  it('reverts the UI selection state back if the backend status sync PATCH call errors out', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse })
      .mockResolvedValueOnce({ ok: false }); 

    const { container } = await renderAndMountComponent();

    const statusSelect = container.querySelector('.status-select');
    fireEvent.change(statusSelect, { target: { value: 'paid' } });

    await waitFor(() => {
      expect(screen.getByText(/Error updating database field:/i)).toBeInTheDocument();
    });
    expect(statusSelect.value).toBe('pending'); 
  });

  
  it('optimistically flags a user profile when the flag icon button is pressed', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse })
      .mockResolvedValueOnce({ ok: true });

    const { container } = await renderAndMountComponent();

    const flagButtons = container.querySelectorAll('.flag-btn');
    fireEvent.click(flagButtons[0]); 

    const toastAlert = await screen.findByText(/Thabo Khumalo flagged/i);
    expect(toastAlert).toBeInTheDocument();
  });

  it('reverts optimistic view if flag PATCH synchronization fails', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse })
      .mockRejectedValueOnce(new Error('Network Timeout'));

    const { container } = await renderAndMountComponent();

    const flagButtons = container.querySelectorAll('.flag-btn');
    fireEvent.click(flagButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Error saving flag status: Network Timeout/i)).toBeInTheDocument();
    });
  });

  
  it('filters member account profiles based on client search queries matching input fields', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse });

    const { container } = await renderAndMountComponent();

    const searchInput = screen.getByPlaceholderText(/Search by name or email.../i);
    fireEvent.change(searchInput, { target: { value: 'Naledi' } });

    const memberNames = container.querySelectorAll('.member-name');
    expect(memberNames.length).toBe(1);
    expect(memberNames[0].textContent).toContain('Naledi');
  });

  it('filters the list elements dynamically when selecting a specific status value option', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse });

    const { container } = await renderAndMountComponent();

    const filterSelect = container.querySelector('.filter-select') || screen.getAllByRole('combobox')[0];
    fireEvent.change(filterSelect, { target: { value: 'missed' } });

    const memberNames = container.querySelectorAll('.member-name');
    expect(memberNames.length).toBe(1);
    expect(memberNames[0].textContent).toContain('Naledi');
  });

  it('shows an empty view message if the search input filters out all database rows', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse });

    await renderAndMountComponent();

    const searchInput = screen.getByPlaceholderText(/Search by name or email.../i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentMemberName' } });

    expect(screen.getByText(/No matching database records found./i)).toBeInTheDocument();
  });


  it('fires individual notification pings when clicking the reminder icon button on outstanding rows', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse });

    const { container } = await renderAndMountComponent();

    const remindBtn = container.querySelector('.remind-btn');
    fireEvent.click(remindBtn);

    const toastAlert = await screen.findByText(/Reminder alert generated for Naledi/i);
    expect(toastAlert).toBeInTheDocument();
  });

  it('triggers bulk reminders via top dispatch actions and outstanding sidebar panel operations', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse });

    await renderAndMountComponent();

    const emailOutstandingBtn = screen.getByRole('button', { name: /Email Outstanding/i });
    fireEvent.click(emailOutstandingBtn);

    const toastAlert = screen.getByText((content, element) => {
      const hasText = (node) => /Dispatched reminders to 1 outstanding accounts/i.test(node.textContent);
      const nodeHasText = hasText(element);
      const childrenDontHaveText = Array.from(element.children).every(child => !hasText(child));
      return nodeHasText && childrenDontHaveText;
    });

    expect(toastAlert).toBeInTheDocument();
  });

 
  it('clears away the global toast monitor status banner after its timeout clock cycle ticks down', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse });

    await renderAndMountComponent();

    jest.useFakeTimers();

    const emailBtn = screen.getByRole('button', { name: /Email Outstanding/i });
    fireEvent.click(emailBtn);

    const toastAlert = await screen.findByText(/Dispatched reminders to/i);
    expect(toastAlert).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2500);
    });

    expect(toastAlert).not.toBeInTheDocument();
  });
});