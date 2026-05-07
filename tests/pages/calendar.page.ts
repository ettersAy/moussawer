import { type Page, expect } from "@playwright/test";

/**
 * Page Object Model for the Photographer Calendar (availability) view.
 *
 * All locators use user-facing attributes (roles, labels, text) where possible;
 * CSS classes are used only for structural containers with no accessible role.
 */
export class CalendarPage {
  readonly page: Page;

  // ── Tab & heading ──
  readonly calendarTab = () => this.page.getByRole("button", { name: /calendar/i });
  readonly heading = () => this.page.getByRole("heading", { name: /availability calendar/i });
  readonly calendarHeading = () => this.page.locator(".calendar-main").getByRole("heading");

  // ── View toggle ──
  readonly monthViewBtn = () => this.page.getByRole("button", { name: /^month$/i });
  readonly weekViewBtn = () => this.page.getByRole("button", { name: /^week$/i });
  readonly dayViewBtn = () => this.page.getByRole("button", { name: /^day$/i });

  // ── Navigation ──
  readonly prevBtn = () => this.page.locator(".calendar-main").getByRole("button").first();
  readonly nextBtn = () => this.page.locator(".calendar-main").getByRole("button").nth(1);

  // ── Month grid ──
  readonly monthGrid = () => this.page.locator(".calendar-month-grid");
  readonly dayHeaders = () => this.monthGrid().locator(".calendar-day-header");

  // ── Week grid ──
  readonly weekGrid = () => this.page.locator(".calendar-week-grid");

  // ── Day view ──
  readonly dayViewContainer = () => this.page.locator(".calendar-day-view");

  // ── Sidebar ──
  readonly miniCalendar = () => this.page.locator(".mini-calendar");
  readonly miniCalendarDays = () => this.miniCalendar().locator(".mini-calendar-day");
  readonly miniCalendarSelected = () => this.miniCalendar().locator(".mini-calendar-day.selected");

  // ── Rules ──
  readonly rulesList = () => this.page.locator(".rules-compact-list");
  readonly ruleRows = () => this.rulesList().locator(".rule-compact-row");
  readonly ruleDaySelect = () => this.page.locator(".calendar-sidebar select");
  readonly ruleStartTime = () => this.page.locator(".calendar-sidebar").getByRole("textbox").first();
  readonly ruleEndTime = () => this.page.locator(".calendar-sidebar").getByRole("textbox").nth(1);
  readonly ruleAddBtn = () => this.page.locator(".calendar-sidebar .solid-button.compact").first();

  // ── Actions ──
  readonly addBlockBtn = () => this.page.getByRole("button", { name: /add block/i });
  readonly todayBtn = () => this.page.getByRole("button", { name: /^today$/i });

  // ── Block modal ──
  readonly blockModal = () => this.page.locator(".modal-card");
  readonly blockModalHeading = () => this.blockModal().getByRole("heading", { name: /block/i });
  readonly blockStartInput = () => this.blockModal().getByLabel(/start/i);
  readonly blockEndInput = () => this.blockModal().getByLabel(/end/i);
  readonly blockReasonInput = () => this.blockModal().getByPlaceholder(/vacation/i);
  readonly blockSaveBtn = () => this.blockModal().getByRole("button", { name: /create|update/i });
  readonly blockCancelBtn = () => this.blockModal().getByRole("button", { name: /cancel/i });

  // ── Day detail ──
  readonly dayDetail = () => this.page.locator(".calendar-day-detail");

  // ── Legend ──
  readonly legend = () => this.page.locator(".calendar-legend");

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to the photographer workspace and select the Calendar tab. */
  async goto() {
    await this.page.goto("/photographer");
    await this.calendarTab().click();
    await this.monthGrid().waitFor({ state: "visible", timeout: 10_000 });
  }

  /** Click a specific day cell by its number. Targets current-month cells preferentially. */
  async clickDay(dayNumber: number) {
    const cell = this.monthGrid()
      .locator(".calendar-day-cell:not(.other-month)")
      .filter({ has: this.page.locator(`.calendar-day-number:text-is("${dayNumber}")`) })
      .first();
    await cell.waitFor({ state: "visible", timeout: 3_000 });
    await cell.click();
  }

  /** Navigate to next month and wait for the grid to settle. */
  async goNextMonth() {
    const currentHeading = await this.calendarHeading().textContent();
    await this.nextBtn().click();
    await expect(this.calendarHeading()).not.toHaveText(currentHeading!, { timeout: 3_000 });
  }

  /** Navigate to previous month and wait for the grid to settle. */
  async goPrevMonth() {
    const currentHeading = await this.calendarHeading().textContent();
    await this.prevBtn().click();
    await expect(this.calendarHeading()).not.toHaveText(currentHeading!, { timeout: 3_000 });
  }

  /** Switch to a different view. */
  async switchView(view: "month" | "week" | "day") {
    const btn = view === "month" ? this.monthViewBtn()
      : view === "week" ? this.weekViewBtn()
      : this.dayViewBtn();
    await btn.click();
    // Wait for the target view container to appear
    if (view === "month") await this.monthGrid().waitFor({ state: "visible", timeout: 3_000 });
    else if (view === "week") await this.weekGrid().waitFor({ state: "visible", timeout: 3_000 });
    else await this.dayViewContainer().waitFor({ state: "visible", timeout: 3_000 });
  }

  /** Open the block creation modal. */
  async openBlockModal() {
    await this.addBlockBtn().click();
    await this.blockModal().waitFor({ state: "visible", timeout: 5_000 });
  }

  /** Fill and submit the block creation form. */
  async createBlock(opts: { startAt: string; endAt: string; reason?: string }) {
    await this.openBlockModal();
    await this.blockStartInput().fill(opts.startAt);
    await this.blockEndInput().fill(opts.endAt);
    if (opts.reason) await this.blockReasonInput().fill(opts.reason);
    await this.blockSaveBtn().click();
    // Wait for the modal to close, or if it stays open (error), return false
    try {
      await this.blockModal().waitFor({ state: "hidden", timeout: 10_000 });
      return true;
    } catch {
      return false;
    }
  }

  /** Assert the calendar page is fully loaded. */
  async expectLoaded() {
    await this.heading().waitFor({ state: "visible" });
    await this.monthGrid().waitFor({ state: "visible" });
    await this.miniCalendar().waitFor({ state: "visible" });
    await this.legend().waitFor({ state: "visible" });
  }
}
