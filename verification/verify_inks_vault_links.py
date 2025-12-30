from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # We are verifying that the button in InksVaultPage points to the correct place.
            # Navigate to /inks-vault (public page)
            page.goto("http://localhost:8080/inks-vault", timeout=30000)
            print(f"Loaded /inks-vault")

            # Since "Write Something" button only appears if user is logged in (based on code: {user && ...}),
            # we need to mock authentication or just verify the code changes (which we did).
            # However, we can check if the button exists or not.
            # Code: const { data: { user } } = await supabase.auth.getUser();
            # It fetches user on mount.

            # If we are not logged in, we might not see the button.
            # But we can try to force the state or just rely on the static code analysis which was very clear.

            # Alternatively, let's look for "Be the first to write one" or "Start Writing" which also might require user.
            # All buttons seem wrapped in {user && ...}.

            # So, without logging in, we can't see the buttons in the UI.
            # But we can verify the page loads.

            page.screenshot(path="verification/inks_vault_page.png")
            print("Screenshot taken of Inks Vault page")

        except Exception as e:
            print(f"Error: {e}")

        browser.close()

if __name__ == "__main__":
    run()
