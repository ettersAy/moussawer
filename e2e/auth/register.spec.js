import { test, expect } from '../fixtures/index.js';
import { PHOTOGRAPHER_USER, CLIENT_USER } from '../fixtures/test-data.js';

/**
 * Registration E2E Tests
 *
 * Tests the full registration flow from UI to post-registration behavior.
 * All tests use mocked API responses to simulate various scenarios.
 */
test.describe('Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  // -----------------------------------------------------------------------
  // Page Rendering
  // -----------------------------------------------------------------------

  test('renders registration page with all required fields', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Join Moussawer');
    
    // Check form fields
    await expect(page.getByText('Full Name', { exact: true })).toBeVisible();
    await expect(page.getByText('Email Address', { exact: true })).toBeVisible();
    await expect(page.getByText('I am a', { exact: true })).toBeVisible();
    await expect(page.getByText('Password', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Confirm Password', { exact: true })).toBeVisible();

    // Check role options exist
    const select = page.locator('select');
    const options = select.locator('option');
    const optionValues = await options.evaluateAll((opts) => opts.map((o) => o.value));
    expect(optionValues).toContain('client');
    expect(optionValues).toContain('photographer');
  });

  test('renders submit button', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
    await expect(submitBtn).toContainText('Create Account');
  });

  test('renders link to login page', async ({ page }) => {
    const loginLink = page.locator('a.auth-footer-link[href="/login"]');
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toContainText('Sign in here');
  });

  // -----------------------------------------------------------------------
  // Form Interactions (UI validation)
  // -----------------------------------------------------------------------

  test('allows typing in all form fields', async ({ page }) => {
    await page.locator('input[placeholder="Your full name"]').fill('John Photographer');
    await page.locator('input[placeholder="you@example.com"]').fill('john@example.com');
    await page.locator('select').selectOption('photographer');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('SecurePass123');
    await page.locator('input[placeholder="Repeat your password"]').fill('SecurePass123');

    await expect(page.locator('input[placeholder="Your full name"]')).toHaveValue('John Photographer');
    await expect(page.locator('input[placeholder="you@example.com"]')).toHaveValue('john@example.com');
    await expect(page.locator('select')).toHaveValue('photographer');
    await expect(page.locator('input[placeholder="Minimum 8 characters"]')).toHaveValue('SecurePass123');
    await expect(page.locator('input[placeholder="Repeat your password"]')).toHaveValue('SecurePass123');
  });

  // -----------------------------------------------------------------------
  // Client-Side Validation
  // -----------------------------------------------------------------------

  test('displays browser validation for missing required fields', async ({ page }) => {
    // Try to submit with empty form
    await page.locator('button[type="submit"]').click();

    // Browser HTML5 validation should prevent submission
    const nameInput = page.locator('input[placeholder="Your full name"]');
    const validity = await nameInput.evaluate((el) => el.validity.valid);
    expect(validity).toBe(false);
  });

  test('displays browser validation for invalid email', async ({ page }) => {
    await page.locator('input[placeholder="Your full name"]').fill('Test User');
    await page.locator('input[placeholder="you@example.com"]').fill('not-an-email');
    await page.locator('select').selectOption('client');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('Password123');
    await page.locator('input[placeholder="Repeat your password"]').fill('Password123');

    await page.locator('button[type="submit"]').click();

    const emailInput = page.locator('input[placeholder="you@example.com"]');
    const validity = await emailInput.evaluate((el) => el.validity.valid);
    expect(validity).toBe(false);
  });

  // -----------------------------------------------------------------------
  // Server Validation Errors
  // -----------------------------------------------------------------------

  test('displays duplicate email error from server', async ({ page }) => {
    // Mock the API to return duplicate email error
    await page.route('/api/register', (route) =>
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Please correct the errors below.',
          errors: {
            email: ['This email address is already registered.'],
          },
        }),
      })
    );

    await page.locator('input[placeholder="Your full name"]').fill('Duplicate Test');
    await page.locator('input[placeholder="you@example.com"]').fill('existing@example.com');
    await page.locator('select').selectOption('client');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('Password123');
    await page.locator('input[placeholder="Repeat your password"]').fill('Password123');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('This email address is already registered')).toBeVisible();
  });

  test('displays multiple validation errors from server', async ({ page }) => {
    await page.route('/api/register', (route) =>
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Please correct the errors below.',
          errors: {
            email: ['The email has already been taken.'],
            password: ['The password must be at least 8 characters.'],
          },
        }),
      })
    );

    await page.locator('input[placeholder="Your full name"]').fill('Test User');
    await page.locator('input[placeholder="you@example.com"]').fill('test@example.com');
    await page.locator('select').selectOption('photographer');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('short');
    await page.locator('input[placeholder="Repeat your password"]').fill('short');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('The email has already been taken.')).toBeVisible();
    await expect(page.getByText('The password must be at least 8 characters.')).toBeVisible();
  });

  test('displays generic error on server failure', async ({ page }) => {
    await page.route('/api/register', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Registration failed. Please try again.',
        }),
      })
    );

    await page.locator('input[placeholder="Your full name"]').fill('Fail User');
    await page.locator('input[placeholder="you@example.com"]').fill('fail@example.com');
    await page.locator('select').selectOption('client');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('Password123');
    await page.locator('input[placeholder="Repeat your password"]').fill('Password123');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('Registration failed. Please try again.')).toBeVisible();
  });

  test('submit button shows loading state', async ({ page }) => {
    // Slow down network to catch loading state
    await page.route('/api/register', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'client' },
          token: 'test-token-123',
        }),
      });
    });

    await page.locator('input[placeholder="Your full name"]').fill('Test User');
    await page.locator('input[placeholder="you@example.com"]').fill('test@example.com');
    await page.locator('select').selectOption('client');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('Password123');
    await page.locator('input[placeholder="Repeat your password"]').fill('Password123');

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Button should be disabled and show loading text
    await expect(submitBtn).toBeDisabled();
    await expect(submitBtn).toContainText('Creating Account...');

    await page.unrouteAll();
  });

  // -----------------------------------------------------------------------
  // Successful Registration & Post-Registration Flow
  // -----------------------------------------------------------------------

  test('photographer registration redirects to photographer dashboard', async ({ page }) => {
    const uniqueEmail = `photographer-${Date.now()}@example.com`;

    // Mock the registration API
    await page.route('/api/register', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 10, name: 'John Photographer', email: uniqueEmail, role: 'photographer' },
          token: 'test-token-photographer',
        }),
      })
    );

    // Mock /api/user for dashboard auth check
    await page.route('**/api/user', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 10, name: 'John Photographer', email: uniqueEmail, role: 'photographer' },
        }),
      })
    );

    // Mock /api/logout for layout
    await page.route('**/api/logout', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Logged out' }),
      })
    );

    // Mock catch-all for other API calls during dashboard render
    await page.route('**/api/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {} }),
      })
    );

    await page.locator('input[placeholder="Your full name"]').fill('John Photographer');
    await page.locator('input[placeholder="you@example.com"]').fill(uniqueEmail);
    await page.locator('select').selectOption('photographer');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('PhotoPass123');
    await page.locator('input[placeholder="Repeat your password"]').fill('PhotoPass123');
    await page.locator('button[type="submit"]').click();

    // Should redirect to photographer dashboard
    await page.waitForURL(/\/photographer\/dashboard/, { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Photographer Dashboard');

    // Auth token should be stored
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBe('test-token-photographer');

    // Auth user should be stored
    const user = await page.evaluate(() => JSON.parse(localStorage.getItem('auth_user')));
    expect(user.role).toBe('photographer');
  });

  test('client registration redirects to client dashboard', async ({ page }) => {
    const uniqueEmail = `client-${Date.now()}@example.com`;

    // Mock the registration API
    await page.route('/api/register', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 11, name: 'Jane Client', email: uniqueEmail, role: 'client' },
          token: 'test-token-client',
        }),
      })
    );

    // Mock /api/user for dashboard auth check
    await page.route('**/api/user', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 11, name: 'Jane Client', email: uniqueEmail, role: 'client' },
        }),
      })
    );

    // Mock /api/logout for layout
    await page.route('**/api/logout', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Logged out' }),
      })
    );

    // Mock catch-all for other API calls during dashboard render
    await page.route('**/api/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {} }),
      })
    );

    await page.locator('input[placeholder="Your full name"]').fill('Jane Client');
    await page.locator('input[placeholder="you@example.com"]').fill(uniqueEmail);
    await page.locator('select').selectOption('client');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('ClientPass123');
    await page.locator('input[placeholder="Repeat your password"]').fill('ClientPass123');
    await page.locator('button[type="submit"]').click();

    // Should redirect to client dashboard
    await page.waitForURL(/\/client\/dashboard/, { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Client Dashboard');

    // Auth token should be stored
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBe('test-token-client');
  });

  // -----------------------------------------------------------------------
  // Post-Registration: Profile & Availability Access
  // -----------------------------------------------------------------------

  test('photographer can access profile page without existing Photographer record', async ({ page }) => {
    // Simulate a freshly registered photographer who hasn't created their profile yet

    // Set up localStorage auth state as if registration just happened
    await page.evaluate((userData) => {
      localStorage.setItem('auth_token', 'test-token-123');
      localStorage.setItem('auth_user', JSON.stringify(userData));
    }, PHOTOGRAPHER_USER);

    // Mock /api/user for auth guard
    await page.route('**/api/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: PHOTOGRAPHER_USER }),
      });
    });

    // Mock /api/logout
    await page.route('**/api/logout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Logged out' }),
      });
    });

    // Mock the profile endpoint to return null data (no profile record exists yet)
    await page.route('**/api/photographer/profile', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: null,
            message: 'Photographer profile not found. Please create one.',
          }),
        });
      } else if (request.method() === 'POST') {
        // Simulate successful profile creation
        const body = JSON.parse(request.postData() || '{}');
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              id: 1,
              user_id: PHOTOGRAPHER_USER.id,
              bio: body.bio,
              portfolio_url: body.portfolio_url,
              hourly_rate: body.hourly_rate,
              availability_status: body.availability_status,
              user: PHOTOGRAPHER_USER,
            },
          }),
        });
      }
    });

    // Navigate to profile page
    await page.goto('/photographer/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Should show the profile form (not an error page)
    // The form should be in "create" mode since noProfile=true
    await expect(page.locator('h1')).toContainText('My Profile');
    await expect(page.getByText('Set up your photographer profile')).toBeVisible();

    // The button should say "Create Profile"
    await expect(page.getByText('Create Profile')).toBeVisible();

    // Fill in profile data and submit
    await page.locator('#bio').fill('Professional photographer with 10 years of experience');
    await page.locator('#portfolio_url').fill('https://myportfolio.com');
    await page.locator('#hourly_rate').fill('150');
    await page.locator('#availability_status').selectOption('available');
    await page.getByText('Create Profile').click();

    // Should show success message
    await expect(page.getByText('Profile created successfully!')).toBeVisible();
  });

  test('photographer can access availability page without existing Photographer record', async ({ page }) => {
    // Simulate a freshly registered photographer who hasn't created their profile yet

    // Set up localStorage auth state
    await page.evaluate((userData) => {
      localStorage.setItem('auth_token', 'test-token-123');
      localStorage.setItem('auth_user', JSON.stringify(userData));
    }, PHOTOGRAPHER_USER);

    // Mock /api/user for auth guard
    await page.route('**/api/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: PHOTOGRAPHER_USER }),
      });
    });

    // Mock /api/logout
    await page.route('**/api/logout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Logged out' }),
      });
    });

    // Mock the availability calendar endpoint to return 404 (no profile)
    await page.route('**/api/photographer/availability/calendar**', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Photographer profile not found.',
        }),
      });
    });

    // Wait for page to load and check for user-friendly error message
    await page.goto('/photographer/availability');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Should show a helpful message telling the user to create their profile first
    await expect(page.getByText(/create your photographer profile first/i)).toBeVisible();
  });

  test('registered photographer can create profile then access availability', async ({ page }) => {
    // Simulate the full flow: register -> redirected to dashboard -> create profile -> access availability

    // Set up localStorage auth state
    await page.evaluate((userData) => {
      localStorage.setItem('auth_token', 'test-token-123');
      localStorage.setItem('auth_user', JSON.stringify(userData));
    }, PHOTOGRAPHER_USER);

    // Mock /api/user for auth guard
    await page.route('**/api/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: PHOTOGRAPHER_USER }),
      });
    });

    // Mock /api/logout
    await page.route('**/api/logout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Logged out' }),
      });
    });

    // Mock photographer profile - first return null (no profile), then return the created profile
    let profileCreated = false;
    await page.route('**/api/photographer/profile', async (route, request) => {
      if (request.method() === 'GET') {
        if (!profileCreated) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: null,
              message: 'Photographer profile not found. Please create one.',
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                id: 1,
                user_id: PHOTOGRAPHER_USER.id,
                bio: 'My photography bio',
                portfolio_url: 'https://portfolio.com',
                hourly_rate: 100,
                availability_status: 'available',
                user: PHOTOGRAPHER_USER,
              },
            }),
          });
        }
      } else if (request.method() === 'POST') {
        profileCreated = true;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              id: 1,
              user_id: PHOTOGRAPHER_USER.id,
              bio: 'My photography bio',
              portfolio_url: 'https://portfolio.com',
              hourly_rate: 100,
              availability_status: 'available',
              user: PHOTOGRAPHER_USER,
            },
          }),
        });
      }
    });

    // Mock the availability calendar endpoint - once profile exists, return valid calendar data
    await page.route('**/api/photographer/availability/calendar**', async (route) => {
      const url = new URL(route.request().url());
      const month = url.searchParams.get('month') || '2026-04';
      const [year, monthNum] = month.split('-').map(Number);
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      const days = [];
      const today = new Date().toISOString().split('T')[0];

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${month}-${String(day).padStart(2, '0')}`;
        days.push({
          date: dateStr,
          day_of_week: new Date(dateStr + 'T00:00:00').getDay(),
          is_today: dateStr === today,
          is_past: dateStr < today,
          total_slots: 0,
          available: 0,
          unavailable: 0,
          booked: 0,
          has_slots: false,
        });
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ year, month: monthNum, days }),
      });
    });

    // Mock availability slots endpoint
    await page.route('**/api/photographer/availability?from=**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    // Step 1: Visit profile page (no profile exists yet)
    await page.goto('/photographer/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page.getByText('Set up your photographer profile')).toBeVisible();

    // Step 2: Create the profile
    await page.locator('#bio').fill('My photography bio');
    await page.locator('#portfolio_url').fill('https://portfolio.com');
    await page.locator('#hourly_rate').fill('100');
    await page.locator('#availability_status').selectOption('available');
    await page.getByText('Create Profile').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Profile created successfully!')).toBeVisible();

    // Step 3: Navigate to availability page (should now work since profile exists)
    await page.goto('/photographer/availability');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Should show the calendar title, not an error
    await expect(page.locator('.availability-calendar__title')).toContainText('Availability Calendar');
  });
});
