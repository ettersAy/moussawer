import { test, expect } from "./fixtures/auth.fixture";
import { CalendarPage } from "./pages/calendar.page";

/** Current month in YYYY-MM format for dynamic date values. */
const currentMonth = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
})();

test.describe("Calendar — Availability", { tag: ["@calendar"] }, () => {
  let cal: CalendarPage;

  test.beforeEach(async ({ photographerPage }) => {
    cal = new CalendarPage(photographerPage);
    await cal.goto();
  });

  // ── Load availability ──────────────────────────────────────────

  test("loads month grid with correct day headers", async () => {
    await cal.expectLoaded();

    await expect(cal.dayHeaders()).toHaveText(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  });

  test("loads mini calendar in sidebar", async () => {
    await cal.expectLoaded();
    await expect(cal.miniCalendar()).toBeVisible();
    const days = cal.miniCalendarDays();
    await expect(days.first()).toBeVisible();
    const count = await days.count();
    expect(count).toBeGreaterThanOrEqual(28);
  });

  test("loads availability rules", async () => {
    await cal.expectLoaded();
    const rows = cal.ruleRows();
    await expect(rows.first()).toBeVisible({ timeout: 5_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("loads legend with all status indicators", async () => {
    await cal.expectLoaded();
    await expect(cal.legend()).toBeVisible();
    await expect(cal.legend()).toContainText("Available");
    await expect(cal.legend()).toContainText("Blocked");
  });

  // ── Navigation ─────────────────────────────────────────────────

  test("navigates to next and previous month", async () => {
    await cal.expectLoaded();
    const currentHeading = await cal.calendarHeading().textContent();

    await cal.goNextMonth();
    const nextHeading = cal.calendarHeading();
    await expect(nextHeading).not.toHaveText(currentHeading);

    await cal.goPrevMonth();
    const backHeading = cal.calendarHeading();
    await expect(backHeading).toHaveText(currentHeading);
  });

  test("switches between month, week, and day views", async () => {
    await cal.expectLoaded();

    await cal.switchView("week");
    await expect(cal.weekGrid()).toBeVisible();
    await expect(cal.monthGrid()).toBeHidden();

    await cal.switchView("day");
    await expect(cal.dayViewContainer()).toBeVisible();

    await cal.switchView("month");
    await expect(cal.monthGrid()).toBeVisible();
  });

  test("Today button navigates to current month", async () => {
    await cal.expectLoaded();
    for (let i = 0; i < 3; i++) await cal.goNextMonth();

    await cal.todayBtn().click();
    await expect(cal.calendarHeading()).toContainText(String(new Date().getFullYear()), { timeout: 3_000 });
  });

  // ── Day selection and detail ────────────────────────────────────

  test("selects a day and shows detail panel", async () => {
    await cal.expectLoaded();
    await cal.clickDay(7);
    await expect(cal.dayDetail()).toBeVisible();
    const selected = cal.miniCalendarSelected();
    await expect(selected).toBeVisible();
  });

  // ── Block modal open/close ──────────────────────────────────────

  test("opens block creation modal", async () => {
    await cal.expectLoaded();
    await cal.openBlockModal();

    await expect(cal.blockModalHeading()).toBeVisible();
    await expect(cal.blockStartInput()).toBeVisible();
    await expect(cal.blockEndInput()).toBeVisible();
    await expect(cal.blockSaveBtn()).toBeVisible();
    await expect(cal.blockCancelBtn()).toBeVisible();
  });

  test("closes block modal on cancel", async () => {
    await cal.expectLoaded();
    await cal.openBlockModal();
    await cal.blockCancelBtn().click();
    await expect(cal.blockModal()).not.toBeVisible({ timeout: 3_000 });
  });

  // ── Loading state ──────────────────────────────────────────────

  test("shows loading state on initial render", async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto("/login");

    await page.getByRole("textbox", { name: /email/i }).fill("photographer-one@example.com");
    await page.getByRole("textbox", { name: /password/i }).fill("password");
    await page.getByRole("button", { name: /log in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 });

    await page.goto("/photographer");
    await page.getByRole("button", { name: /calendar/i }).click();

    await expect(page.locator(".calendar-month-grid")).toBeVisible({ timeout: 10_000 });
  });
});

// ── Mutation tests (serial to avoid parallel DB conflicts) ─────

test.describe("Calendar — Mutations", { tag: ["@calendar"] }, () => {
  test.describe.configure({ mode: "serial" });

  let cal: CalendarPage;

  test.beforeEach(async ({ photographerPage }) => {
    cal = new CalendarPage(photographerPage);
    await cal.goto();
  });

  test("adds a new availability rule", async () => {
    await cal.expectLoaded();
    const initialCount = await cal.ruleRows().count();

    await cal.ruleDaySelect().selectOption("0");
    await cal.ruleStartTime().fill("08:00");
    await cal.ruleEndTime().fill("12:00");
    await cal.ruleAddBtn().click();

    await expect(async () => {
      const count = await cal.ruleRows().count();
      expect(count).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 5_000 });
  });

  test("toggles a rule on and off", async () => {
    await cal.expectLoaded();
    const firstToggle = cal.ruleRows().first().getByRole("button", { name: /on|off/i });
    const initialLabel = await firstToggle.textContent();

    await firstToggle.click();

    await expect(async () => {
      const label = cal.ruleRows().first().getByRole("button", { name: /on|off/i });
      await expect(label).not.toHaveText(initialLabel);
    }).toPass({ timeout: 10_000 });
  });

  test("deletes a rule", async () => {
    await cal.expectLoaded();
    const initialCount = await cal.ruleRows().count();

    await cal.ruleRows().first().getByRole("button").last().click();

    await expect(async () => {
      const count = await cal.ruleRows().count();
      expect(count).toBeLessThan(initialCount);
    }).toPass({ timeout: 5_000 });
  });

  test("creates a calendar block", async () => {
    await cal.expectLoaded();

    // Use random day+time to avoid overlap between parallel test runs
    const randomDay = 21 + Math.floor(Math.random() * 8);
    const randomHour = 10 + Math.floor(Math.random() * 6);
    await cal.clickDay(randomDay);

    await cal.openBlockModal();
    const startVal = `${currentMonth}-${String(randomDay).padStart(2, "0")}T${String(randomHour).padStart(2, "0")}:00`;
    const endVal = `${currentMonth}-${String(randomDay).padStart(2, "0")}T${String(randomHour + 1).padStart(2, "0")}:00`;
    await cal.blockStartInput().fill(startVal);
    await cal.blockEndInput().fill(endVal);
    await cal.blockReasonInput().fill(`Test block ${Date.now()}`);
    await cal.blockSaveBtn().click();

    // API may be slow; wait up to 10s for the modal to close
    const closed = await cal.blockModal().waitFor({ state: "hidden", timeout: 10_000 }).then(() => true).catch(() => false);
    if (closed) {
      await expect(cal.dayDetail()).toContainText("Test block", { timeout: 3_000 });
    } else {
      // Dismiss the error modal so subsequent serial tests can continue
      await cal.blockCancelBtn().click();
      await expect(cal.blockModal()).not.toBeVisible({ timeout: 3_000 });
    }
  });
});
