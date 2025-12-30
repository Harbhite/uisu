from playwright.sync_api import sync_playwright

def verify_inks_editor():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Note: In a real environment, we'd need to mock the auth check in useAdminCheck
        # However, for this verification, we are assuming the dev server runs and we can hit the route directly.
        # But wait, the component has a redirect if !user or !isStaff.
        # This makes it hard to test without mocking the auth hook or logging in.

        # Strategy: Since I can't easily modify the running backend state to "log in" via Playwright
        # without a full auth flow (which might be complex with Supabase),
        # I will rely on the fact that I built the component.
        # BUT, to verify the UI, I should try to bypass the check or simulate it.

        # Actually, let's just try to hit the page. If it redirects to /auth, I'll know.
        # I'll create a script that tries to screenshot the editor page.

        page = browser.new_page()
        try:
            # We need to start the server first. I'll assume the user/agent will run this script
            # while the server is running in another tab.
            # Wait, I need to start the server myself in the background.

            page.goto("http://localhost:5173/admin/inks-vault/new")

            # Allow time for loading/redirects
            page.wait_for_timeout(3000)

            # Take a screenshot
            page.screenshot(path="verification/inks_editor.png", full_page=True)
            print("Screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_inks_editor()
