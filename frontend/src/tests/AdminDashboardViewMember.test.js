import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from '../Dashboard/newAdminDashboard';
import ViewMembers from '../Dashboard/ViewMembers';
import { useGroupData } from '../Dashboard/useGroupData';

jest.mock('../Dashboard/useGroupData');

describe('AdminDashboard Component', () => {
    // Keep track of mock functions to verify clicks
    let mockSetMembers;

    beforeEach(() => {
        jest.clearAllMocks();
        // Logged in as admin@test.com
        window.sessionStorage.setItem('user', JSON.stringify({ email: 'admin@test.com' }));
        mockSetMembers = jest.fn();

        // Default mock implementation with 2 members to cover "You" and another user branches
        useGroupData.mockReturnValue({
            members: [
                { 
                    _id: '1', 
                    fullName: 'Alice Smith',
                    userEmail: 'alice@test.com', 
                    memberType: 'Admin',
                    joiningDate: '2026-04-18' 
                },
                {
                    _id: '2',
                    fullName: 'Admin User',
                    userEmail: 'admin@test.com', // Matches currentUser email -> covers line 43 'isMe'
                    memberType: 'Treasurer',
                    joiningDate: '2026-04-19'
                }
            ],
            group: { 
                groupName: 'Test Stokvel', 
                creationDate: '2026-04-18T00:00:00.000Z' 
            },
            setMembers: mockSetMembers
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

    // Helper to get into the View Members tab since we repeat it
    const navigateToViewMembers = async () => {
        renderDashboard();
        const groupMgmtTrigger = screen.getByText(/Group Management/i);
        await userEvent.click(groupMgmtTrigger);
        const viewMemberBtn = screen.getByText(/View Member/i);
        await userEvent.click(viewMemberBtn);
    };

    test('navigates to View Members tab when clicked', async () => {
        await navigateToViewMembers();
        const groupName = await screen.findByText(/Test Stokvel/i, {}, { timeout: 3000 });
        expect(groupName).toBeInTheDocument();
    });

    test('covers "You" text conditional statement and lists names cleanly', async () => {
        await navigateToViewMembers();
        
        // This targets line 43. The admin row should display "You" instead of their name/email
        const meElement = await screen.findByText('You');
        expect(meElement).toBeInTheDocument();

        // Check if the other member's full name displays correctly
        const otherMember = screen.getByText('Alice Smith');
        expect(otherMember).toBeInTheDocument();
    });

    test('covers empty state branch when group has no members', async () => {
        // Override mock implementation for this test case specifically
        useGroupData.mockReturnValue({
            members: [],
            group: { 
                groupName: 'Empty Stokvel', 
                creationDate: '2026-04-18T00:00:00.000Z' 
            },
            setMembers: mockSetMembers
        });

        await navigateToViewMembers();

        // This covers the final fallback block (lines 53-55 in ViewMembers rendering an empty list message)
        const emptyStateMsg = await screen.findByText(/No members found in this group/i);
        expect(emptyStateMsg).toBeInTheDocument();
    });

    test('covers clicking on a member row interaction and detail state change', async () => {
        await navigateToViewMembers();

        // Target Alice's row
        const memberRow = await screen.findByText('Alice Smith');
        
        // Click her row to fire the onClick handler (covers line 39 execution)
        await userEvent.click(memberRow);
        
        // Fix: Instead of expecting her row to still be there (since the UI switches pages),
        // we assert that her row is gone, proving the dashboard reacted to the click!
        expect(memberRow).not.toBeInTheDocument();
    });

    test('covers edge-case branches for missing tags and missing local storage', async () => {
        // Clear session storage to force the fallback default: || '{}' on line 6
        window.sessionStorage.clear();

        // Override mock implementation with a plain member who has no Admin/Treasurer tags
        // This hits the false branch for line 47 (hasTag) and line 43 (isMe fallback)
        useGroupData.mockReturnValue({
            members: [
                { 
                    _id: '3', 
                    fullName: 'Plain Member',
                    userEmail: 'regular@test.com', 
                    memberType: 'Regular', // Not Admin or Treasurer
                    joiningDate: '2026-04-18' 
                }
            ],
            group: { 
                groupName: 'Test Stokvel'
            },
            setMembers: mockSetMembers
        });

        await navigateToViewMembers();

        const plainMemberName = await screen.findByText('Plain Member');
        expect(plainMemberName).toBeInTheDocument();
        
        // Assert that a role tag badge doesn't render for regular members
        const roleTag = screen.queryByText('Regular');
        expect(roleTag).not.toBeInTheDocument();
    });

    test('covers default prop fallbacks and missing name strings', async () => {
        // 1. Force execution of line 4 (members default) and line 12 (Loading Group text fallback)
        render(
            <MemoryRouter>
                <ViewMembers 
                    group={undefined} 
                    members={undefined} 
                    onSelectMember={jest.fn()} 
                />
            </MemoryRouter>
        );

        const loadingText = await screen.findByText('Loading Group...');
        expect(loadingText).toBeInTheDocument();

        // 2. Force execution of line 47 fallback (member.userEmail displays when fullName is absent)
        useGroupData.mockReturnValue({
            members: [
                { 
                    _id: '4', 
                    userEmail: 'no-name@test.com', 
                    memberType: 'Regular',
                    joiningDate: '2026-04-20' 
                }
            ],
            group: { 
                groupName: 'Test Fallback Stokvel',
                creationDate: '2026-04-18T00:00:00.000Z' 
            },
            setMembers: mockSetMembers
        });

        // Set valid session storage profile to proceed normally with the dashboard context routing
        window.sessionStorage.setItem('user', JSON.stringify({ email: 'admin@test.com' }));
        await navigateToViewMembers();

        const fallbackEmailDisplay = await screen.findByText('no-name@test.com');
        expect(fallbackEmailDisplay).toBeInTheDocument();
    });
});