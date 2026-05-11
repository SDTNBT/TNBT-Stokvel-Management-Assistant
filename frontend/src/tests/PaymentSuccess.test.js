import { render, screen, fireEvent } from '@testing-library/react';
import PaymentSuccess from '../Dashboard/PaymentSuccess'; // Adjust path if needed
import '@testing-library/jest-dom';

describe('PaymentSuccess Component', () => {
  const mockOnReturn = jest.fn();
  const transactionId = 'pi_test_123456789';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // We need to mock window.location.reload for the fallback test
    delete window.location;
    window.location = { reload: jest.fn() };
  });

  test('renders the success message and transaction ID correctly', () => {
    render(<PaymentSuccess transactionId={transactionId} onReturn={mockOnReturn} />);

    expect(screen.getByText(/Payment Successful!/i)).toBeInTheDocument();
    expect(screen.getByText(transactionId)).toBeInTheDocument();
    expect(screen.getByText(/Thank you for your contribution/i)).toBeInTheDocument();
  });

  test('calls onReturn when the button is clicked', () => {
    render(<PaymentSuccess transactionId={transactionId} onReturn={mockOnReturn} />);

    const returnButton = screen.getByRole('button', { name: /Return to Payment dashboard/i });
    fireEvent.click(returnButton);

    expect(mockOnReturn).toHaveBeenCalledTimes(1);
  });

  test('falls back to window.location.reload if onReturn is not a function', () => {
    // Render without passing onReturn
    render(<PaymentSuccess transactionId={transactionId} />);

    const returnButton = screen.getByRole('button', { name: /Return to Payment dashboard/i });
    fireEvent.click(returnButton);

    // This checks the "else" branch in your handleReturn function
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
});