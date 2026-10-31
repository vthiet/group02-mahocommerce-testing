package nlu.fit.lab.vvthiet.selenium.tests;

import nlu.fit.lab.vvthiet.selenium.base.BaseTest;
import nlu.fit.lab.vvthiet.selenium.config.TestConfig;
import nlu.fit.lab.vvthiet.selenium.pages.AdminPromotionPage;
import org.testng.annotations.Test;

/** Seeds the admin rules required by AdminPromotionTest before the automation suite runs. */
public class AdminPromotionPreconditionsTest extends BaseTest {

    /**
     * Preconditions:
     * - An Admin account with permission to manage Cart Price Rules is configured.
     * - The Admin URL and locators match the installed Maho version.
     * - The browser can reach the Admin Panel and the fixture-bound storefront.
     */
    @Test(description = "Create deterministic rules used by admin promotion tests")
    public void prepareAdminPromotionRules() {
        AdminPromotionPage admin = new AdminPromotionPage(driver, wait);
        admin.login(TestConfig.get("admin.user", "CHANGE_ME"),
                TestConfig.get("admin.password.value", "CHANGE_ME"));

        // prepareRule replaces an existing rule with the same name, so this is safe to rerun.
        admin.prepareRule("TEST_ACTIVE", "10", null);
        admin.prepareRule("DELETE_ME", "10", "DELETE_ME");
    }
}
