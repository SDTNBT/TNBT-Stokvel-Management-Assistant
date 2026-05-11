import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentGateway from '../Dashboard/PaymentGateway'; // Adjust path if needed
import '@testing-library/jest-dom';

// 1. Mock Stripe Hooks and Elements
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div>{children}</div>,
  CardNumberElement: () => <div data-testid="card-number" />,
  CardExpiryElement: () => <div data-testid="card-expiry" />,
  CardCvcElement: () => <div data-testid="card-cvc" />,
  useStripe: () => ({
    confirmCardPayment: jest.fn().mockResolvedValue({
      paymentIntent: { status: 'succeeded', id: 'pi_123' },
      error: null,
    }),
  }),
  useElements: () => ({
    getElement: jest.fn(),
  }),
}));

// 2. Mock loadStripe to prevent it from trying to connect to the internet
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn().mockResolvedValue({}),
}));

describe('PaymentGateway & CheckoutForm', () => {
  const mockProps = {
    amount: '250',
    groupName: 'Unity Stokvel',
    userEmail: 'test@wits.ac.za',
    userId: 'user_99',
    onBack: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the global fetch for API calls
    global.fetch = jest.fn((url) => {
      if (url.includes('create-payment-intent')) {
        return Promise.resolve({
          json: () => Promise.resolve({ clientSecret: 'secret_123' }),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true }),
      });
    });
    // Mock alert
    global.alert = jest.fn();
  });

  test('renders form with correct amount and group', () => {
    render(<PaymentGateway {...mockProps} />);
    
    expect(screen.getByText(/Paying R 250 to Unity Stokvel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cardholder's Name/i)).toBeInTheDocument();
  });

  test('shows alert for invalid ZIP code', async () => {
    render(<PaymentGateway {...mockProps} />);
    
    // Fill in name but short ZIP
    fireEvent.change(screen.getByPlaceholderText(/Enter full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/12345/i), { target: { value: '123' } });
    
    const payButton = screen.getByRole('button', { name: /Pay R250/i });
    fireEvent.click(payButton);

    expect(global.alert).toHaveBeenCalledWith("Please enter a valid 5-digit ZIP code.");
  });

  test('successful payment flow calls API and onSuccess', async () => {
    render(<PaymentGateway {...mockProps} />);
    
    // Fill in valid data
    fireEvent.change(screen.getByPlaceholderText(/Enter full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/12345/i), { target: { value: '20017' } });
    
    const payButton = screen.getByRole('button', { name: /Pay R250/i });
    fireEvent.click(payButton);

    // Wait for the async process to finish
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('create-payment-intent'), expect.any(Object));
      expect(mockProps.onSuccess).toHaveBeenCalledWith('pi_123');
    });
  });

  test('calls onBack when back button is clicked', () => {
    render(<PaymentGateway {...mockProps} />);
    
    const backButton = screen.getByText(/Back/i);
    fireEvent.click(backButton);

    expect(mockProps.onBack).toHaveBeenCalled();
  });
});