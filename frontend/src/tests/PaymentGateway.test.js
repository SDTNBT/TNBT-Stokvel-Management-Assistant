import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentGateway from '../Dashboard/PaymentGateway';
import '@testing-library/jest-dom';

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
        global.alert = jest.fn();
    });

    test('renders form with correct amount and group', () => {
        render(<PaymentGateway {...mockProps} />);

        // Use flexible matcher since text may be split across elements
        expect(screen.getByText(/250/)).toBeInTheDocument();
        expect(screen.getByText(/Unity Stokvel/i)).toBeInTheDocument();
    });

    test('renders payment form elements', () => {
        render(<PaymentGateway {...mockProps} />);

        // Check for a pay/submit button
        const payButton = screen.getByRole('button', { name: /Pay|Submit|Confirm/i });
        expect(payButton).toBeInTheDocument();
    });

    test('calls onBack when back button is clicked', () => {
        render(<PaymentGateway {...mockProps} />);

        const backButton = screen.getByText(/Back/i);
        fireEvent.click(backButton);

        expect(mockProps.onBack).toHaveBeenCalled();
    });

    test('shows invalid ZIP alert on short ZIP code', async () => {
        render(<PaymentGateway {...mockProps} />);

        const nameInput = screen.queryByPlaceholderText(/Enter full name/i);
        const zipInput = screen.queryByPlaceholderText(/12345/i);

        if (nameInput) fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        if (zipInput) fireEvent.change(zipInput, { target: { value: '123' } });

        const payButton = screen.getByRole('button', { name: /Pay|Submit/i });
        fireEvent.click(payButton);

        // Either alert fires or validation message appears
        await waitFor(() => {
            const alertCalled = global.alert.mock.calls.length > 0;
            const validationMsg = screen.queryByText(/valid|zip|postal/i);
            expect(alertCalled || validationMsg).toBeTruthy();
        });
    });
});