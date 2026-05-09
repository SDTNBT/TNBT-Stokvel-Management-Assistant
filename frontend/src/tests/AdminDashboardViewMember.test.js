import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from '../Dashboard/newAdminDashboard';
import { useGroupData } from '../Dashboard/useGroupData';

jest.mock('../Dashboard/useGroupData');

describe('AdminDashboard Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.sessionStorage.setItem('user', JSON.stringify({ email: 'admin@test.com' }));

        useGroupData.mockReturnValue({
            members: [{ 
                _id: '1', 
                displayName: 'Alice', 
                userEmail: 'alice@test.com', 
                memberType: 'Admin',
                joiningDate: '2026-04-18' 
            }],
            group: { 
                groupName: 'Test Stokvel', 
                creationDate: '2026-04-18T00:00:00.000Z' 
            },
            setMembers: jest.fn()
        });
    });

    const renderDashboard = () => {
        return render(
            <MemoryRouter 
                initialEntries={['/admin-dashboard/123']}
                future={{ 
                    v7_startTransition: true, 
                    v7_relativeSplatPath: true 
                }}
            >
                <Routes>
                    <Route path="/admin-dashboard/:groupId" element={<AdminDashboard />} />
                    <Route path="/home" element={<main>Home Page</main>} /> 
                </Routes>
            </MemoryRouter>
        );
    };

    test('navigates to View Members tab when clicked', async () => {
        renderDashboard();
        
        const groupMgmtTrigger = screen.getByText(/Group Management/i);
        await userEvent.click(groupMgmtTrigger);
        
        const viewMemberBtn = screen.getByText(/View Member/i);
        await userEvent.click(viewMemberBtn);
        
        const groupName = await screen.findByText(/Test Stokvel/i, {}, { timeout: 3000 });
        expect(groupName).toBeInTheDocument();
    });
});