from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        # 1. Governance Page
        print("Navigating to Governance...")
        page.goto("http://localhost:8080/governance")
        page.wait_for_selector("text=Union Structure")

        # Click Committees
        page.click("button:has-text('Committees')")
        page.wait_for_selector("text=Legislative Committees")
        page.wait_for_selector("text=Executive Committees")

        # Screenshot Governance
        page.screenshot(path="/home/jules/verification/governance_accordions.png")
        print("Captured governance_accordions.png")

        # 2. Committee Detail (Direct Navigation)
        print("Navigating to Committee Detail...")
        page.goto("http://localhost:8080/governance/committee/student-welfare-board")
        page.wait_for_selector("h1:has-text('Student Welfare Board')")

        # Screenshot Detail
        page.screenshot(path="/home/jules/verification/committee_detail.png")
        print("Captured committee_detail.png")

        # 3. Navbar Halls Link
        print("Checking Navbar...")
        page.goto("http://localhost:8080/")
        page.hover("text=Community")
        page.wait_for_selector("a[href='/halls']")

        # Screenshot Navbar Dropdown
        page.screenshot(path="/home/jules/verification/navbar_halls.png")
        print("Captured navbar_halls.png")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
