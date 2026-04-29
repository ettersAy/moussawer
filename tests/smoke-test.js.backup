async (page) => {
  const BASE = "http://localhost:4000";
  const PASSWORD = "password";

  const errors = [];
  let passed = 0;

  function check(description, condition) {
    if (!condition) {
      const msg = `FAIL: ${description}`;
      errors.push(msg);
      console.error(msg);
    } else {
      passed++;
      console.log(`PASS: ${description}`);
    }
  }

  async function go(url) {
    await page.goto(url, { waitUntil: "load", timeout: 10000 });
    await page.waitForTimeout(500);
  }

  /** Login via API (bypasses React controlled-input issues) */
  async function loginAs(email) {
    const tokened = await page.evaluate(async ({ e, p }) => {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e, password: p })
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error?.message };
      localStorage.setItem("moussawer_token", data.data.token);
      return { ok: true, role: data.data.user.role };
    }, { e: email, p: PASSWORD });

    if (!tokened.ok) throw new Error(`Login failed: ${tokened.error}`);

    // Navigate to dashboard to pick up the token
    await go(BASE + "/dashboard");
    return tokened.role;
  }

  /** Logout via native click (Playwright.click doesn't trigger React handler) */
  async function logout() {
    await page.evaluate(() => {
      const buttons = document.querySelectorAll("button");
      for (const btn of buttons) {
        if (btn.textContent.includes("Sign out")) {
          btn.click();
          break;
        }
      }
    });
    await page.waitForTimeout(1500);
  }

  // ─── 0. Clear stale auth ─────────────────────────────────────────────
  await page.evaluate(() => localStorage.clear());
  await go(BASE);

  // ─── 1. Homepage ─────────────────────────────────────────────────────
  console.log("\n── 1. Homepage ──");
  check("title is Moussawer", (await page.title()) === "Moussawer");
  check('brand visible', await page.getByText("Moussawer").count() > 0);
  check('Log in link', await page.getByRole("link", { name: /log in/i }).count() > 0);
  check('Join link', await page.getByRole("link", { name: /join/i }).count() > 0);

  // ─── 2. Unauthenticated redirect ─────────────────────────────────────
  console.log("\n── 2. Redirect ──");
  for (const p of ["/dashboard", "/messages", "/admin"]) {
    await go(BASE + p);
    // Wait a bit more for React to process auth state and redirect
    await page.waitForTimeout(1000);
    check(`${p} redirects to /login`, page.url().includes("/login"));
  }

  // ─── 3. Login as client ──────────────────────────────────────────────
  console.log("\n── 3. Client login ──");
  const role = await loginAs("client@example.com");
  check("redirected to /dashboard", page.url().includes("/dashboard"));
  check("logged in as CLIENT", role === "CLIENT");

  // ─── 4. Nav visibility ──────────────────────────────────────────────
  console.log("\n── 4. Nav ──");
  check("Dashboard nav", await page.getByRole("link", { name: /dashboard/i }).count() > 0);
  check("Messages nav", await page.getByRole("link", { name: /messages/i }).count() > 0);
  check("Cases nav", await page.getByRole("link", { name: /cases/i }).count() > 0);
  check("Admin nav NOT visible", await page.getByRole("link", { name: "Admin" }).count() === 0);
  check("Sign out visible", await page.getByText("Sign out").count() > 0);
  check("Log in NOT visible", await page.getByRole("link", { name: /log in/i }).count() === 0);

  // ─── 5. Role-based redirect ─────────────────────────────────────────
  console.log("\n── 5. Role redirect ──");
  await go(BASE + "/admin");
  await page.waitForTimeout(1000);
  check("client redirected from /admin", page.url().includes("/dashboard"));

  // ─── 6. Logout ──────────────────────────────────────────────────────
  console.log("\n── 6. Logout ──");
  await logout();
  check("left /dashboard after logout", !page.url().includes("/dashboard"));
  check("Log in visible after logout", await page.getByRole("link", { name: /log in/i }).count() > 0);

  // ─── 7. Login as admin ──────────────────────────────────────────────
  console.log("\n── 7. Admin login ──");
  const adminRole = await loginAs("admin@example.com");
  check("admin redirected to /dashboard", page.url().includes("/dashboard"));
  check("logged in as ADMIN", adminRole === "ADMIN");

  // ─── 8. Admin nav ───────────────────────────────────────────────────
  console.log("\n── 8. Admin nav ──");
  check("Admin nav IS visible", await page.getByRole("link", { name: "Admin" }).count() > 0);

  // ─── 9. Admin page ──────────────────────────────────────────────────
  console.log("\n── 9. Admin page ──");
  // Also use native click for Admin nav link
  await page.evaluate(() => {
    const links = document.querySelectorAll("a");
    for (const link of links) {
      if (link.textContent.includes("Admin") && link.getAttribute("href") === "/admin") {
        link.click();
        break;
      }
    }
  });
  await page.waitForTimeout(1500);
  check("on /admin page", page.url().includes("/admin"));
  check("page rendered", await page.getByText("Moussawer").count() > 0);

  const total = passed + errors.length;
  console.log(`\n── ${errors.length} fail(s), ${passed}/${total} passed ──`);
  if (errors.length > 0) throw new Error(`Smoke test failed:\n${errors.join("\n")}`);
  console.log("All smoke tests passed!");
}
