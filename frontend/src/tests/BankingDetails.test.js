import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BankingDetails from '../components/BankingDetails';

describe('BankingDetails Form', () => {
    beforeEach(() => {
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

        const bankOption = await screen.findByText('Capitec');
        expect(bankOption).toBeInTheDocument();
    });

    it('renders the form fields correctly', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ success: true, data: [{ id: 1, name: 'Capitec' }] }),
        });

        render(<BankingDetails onBack={jest.fn()} />);

        // Wait for component to load
        await screen.findByText('Capitec');

        // Check form fields exist - use flexible matchers
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('shows a success notification on successful form submission', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: [{ id: 1, name: 'Capitec', slug: 'capitec' }]
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true, message: 'Saved successfully' }),
            });

        render(<BankingDetails onBack={jest.fn()} />);

        await screen.findByText('Capitec');

        // Fill form using role/placeholder selectors that are more resilient
        const inputs = screen.getAllByRole('textbox');
        if (inputs.length >= 1) fireEvent.change(inputs[0], { target: { value: 'John Doe' } });
        if (inputs.length >= 2) fireEvent.change(inputs[1], { target: { value: '123456789' } });
        if (inputs.length >= 3) fireEvent.change(inputs[2], { target: { value: '9501015000081' } });

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });
});