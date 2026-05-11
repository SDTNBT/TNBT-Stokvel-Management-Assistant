import { render, screen, fireEvent } from '@testing-library/react';
import PaymentPreview from '../Dashboard/PaymentPreview'; // Fixed Path
import '@testing-library/jest-dom';

describe('PaymentPreview Component', () => {
  const mockProps = {
    groupName: 'Siyakhula Stokvel',
    amount: '500.00',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  test('renders component with correct props and current date', () => {
    render(<PaymentPreview {...mockProps} />);

    // Verify props render correctly
    expect(screen.getByText(/Siyakhula Stokvel/i)).toBeInTheDocument();
    expect(screen.getByText(/R 500.00/i)).toBeInTheDocument();

    // Check for the South African date format (en-ZA)
    const today = new Date().toLocaleDateString('en-ZA');
    expect(screen.getByText(today)).toBeInTheDocument();
  });

  test('uses default values when props are missing', () => {
    render(<PaymentPreview onConfirm={jest.fn()} onCancel={jest.fn()} />);

    // Check fallback logic: {groupName || "General Fund"}
    expect(screen.getByText(/General Fund/i)).toBeInTheDocument();
    // Check fallback logic: {amount || "0.00"}
    expect(screen.getByText(/R 0.00/i)).toBeInTheDocument();
  });

  test('calls onConfirm when "Proceed to Pay" is clicked', () => {
    render(<PaymentPreview {...mockProps} />);
    
    const payButton = screen.getByText(/Proceed to Pay/i);
    fireEvent.click(payButton);

    expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when "Cancel" is clicked', () => {
    render(<PaymentPreview {...mockProps} />);
    
    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);

    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });
});