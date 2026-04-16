/**
 * Test data constants for role-based navigation tests
 */

export const TEST_USERS = {
    admin: {
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        role: 'admin',
        dashboardPath: '/admin/dashboard',
    },
    photographer: {
        email: 'photographer@example.com',
        password: 'PhotographerPassword123!',
        role: 'photographer',
        dashboardPath: '/photographer/dashboard',
    },
    client: {
        email: 'client@example.com',
        password: 'ClientPassword123!',
        role: 'client',
        dashboardPath: '/client/dashboard',
    },
};

export const PHOTOGRAPHER_USER = {
    id: 1,
    name: 'Test Photographer',
    email: 'test@moussawer.test',
    role: 'photographer',
};

export const CLIENT_USER = {
    id: 2,
    name: 'Test Client',
    email: 'client@moussawer.test',
    role: 'client',
};