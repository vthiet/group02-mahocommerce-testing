package nlu.fit.lab.vvthiet.selenium.tests;

import nlu.fit.lab.vvthiet.selenium.base.BaseTest;
import nlu.fit.lab.vvthiet.selenium.config.TestConfig;
import nlu.fit.lab.vvthiet.selenium.pages.AdminPromotionPage;
import nlu.fit.lab.vvthiet.selenium.support.TestFixtureClient;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminPromotionTest extends BaseTest {

    private AdminPromotionPage admin() {
        AdminPromotionPage page = new AdminPromotionPage(driver, wait);
        page.login(TestConfig.get("admin.user", "CHANGE_ME"),
                TestConfig.get("admin.password.value", "CHANGE_ME"));
        return page;
    }

    /**
     * Preconditions:
     * - An Admin account with Cart Price Rule permission is available.
     * - The account is logged out before the test begins.
     * - The Add New Rule form is reachable with configured Admin locators.
     */
    @Test(description = "Promo-23: admin form required-field validation")
    public void requiredFieldsValidation() {
        AdminPromotionPage admin = admin();
        admin.openNewRule();
        driver.findElement(By.cssSelector(TestConfig.get("admin.save"))).click();
        Assert.assertTrue(admin.pageContains("This is a required field"),
                "Required field validation should be shown");
    }

    /**
     * Preconditions:
     * - TEST_ACTIVE can be created or reset by the Admin test account.
     * - The rule is active before the edit and matches the prepared storefront cart.
     * - Fixture service can prepare a cart without unrelated active rules.
     */
    @Test(description = "Promo-24: change active promotion to inactive")
    public void deactivatePromotion() {
        AdminPromotionPage admin = admin();
        admin.prepareRule("TEST_ACTIVE", "10", null);
        admin.openRuleGrid();
        admin.openRuleForEdit("TEST_ACTIVE");
        admin.setRuleStatus("Inactive");
        TestFixtureClient.preparePromotionScenario("no-active-cart-rules");
        TestFixtureClient.prepareCart("100.00");
        openCart();
        Assert.assertFalse(cartPage.isDiscountDisplayed(),
                "Inactive promotion must not discount the storefront cart");
    }

    /**
     * Preconditions:
     * - DELETE_ME can be created or reset by the Admin test account.
     * - DELETE_ME is visible in the Admin rule grid and uses coupon code DELETE_ME.
     * - Fixture service can prepare a storefront cart without unrelated rules.
     */
    @Test(description = "Promo-25: delete active promotion rule")
    public void deletePromotion() {
        AdminPromotionPage admin = admin();
        admin.prepareRule("DELETE_ME", "10", "DELETE_ME");
        admin.openRuleGrid();
        admin.openRuleForEdit("DELETE_ME");
        admin.deleteCurrentRule();
        admin.openRuleGrid();
        Assert.assertFalse(admin.ruleExists("DELETE_ME"),
                "Deleted promotion must be removed from the Admin grid");
        TestFixtureClient.preparePromotionScenario("no-active-cart-rules");
        TestFixtureClient.prepareCart("100.00");
        openCart();
        couponPage.apply("DELETE_ME");
        Assert.assertTrue(couponPage.getMessage().toLowerCase().contains("not valid"),
                "Deleted coupon/rule should no longer be accepted");
    }
}
