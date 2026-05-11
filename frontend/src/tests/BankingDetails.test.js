import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BankingDetails from '../components/BankingDetails';

describe('BankingDetails Form', () => {
  beforeEach(() => {
    // Reset mocks and clear storage before each test
    jest.resetAllMocks();
    global.fetch = jest.fn();
    localStorage.setItem('token', 'fake-token');
  });

  it('loads and displays the list of banks from the API', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [{ id: 1, name: 'Capitec' }] }),
    });

    render(<BankingDetails onBack={jest.fn()} />);

    // Using findByText is cleaner for async elements
    const bankOption = await screen.findByText('Capitec');
    expect(bankOption).toBeInTheDocument();
  });

  it('shows a success notification on successful form submission', async () => {
    // 1. Mock Bank List Fetch (Initial load)
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        data: [{ id: 1, name: 'Capitec', slug: 'capitec' }] 
      }),
    });

    // 2. Mock Save API Call (On submit)
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'Saved successfully' }),
    });

    render(<BankingDetails onBack={jest.fn()} />);

    // Wait for banks to load so the select isn't empty
    await screen.findByText('Capitec');

    // Fill in ALL required fields to satisfy browser/React validation
    fireEvent.change(screen.getByLabelText(/Bank Name/i), { 
      target: { value: 'Capitec' } 
    });
    fireEvent.change(screen.getByLabelText(/Account Holder Name/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByLabelText(/Account Number/i), { 
      target: { value: '123456789' } 
    });
    
    // CRITICAL: Fill in the RSA ID Number (it's required in your HTML)
    fireEvent.change(screen.getByLabelText(/RSA ID Number/i), { 
      target: { value: '9501015000081' } 
    });

    // Submit the form
    const saveButton = screen.getByText(/Save Banking Details/i);
    fireEvent.click(saveButton);

    // Assert that the success message appears
    await waitFor(() => {
      expect(screen.getByText(/Saved successfully/i)).toBeInTheDocument();
    });
  });
});