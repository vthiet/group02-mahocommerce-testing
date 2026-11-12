package nlu.fit.lab.vvthiet.selenium.tests;

import nlu.fit.lab.vvthiet.selenium.base.BaseTest;
import nlu.fit.lab.vvthiet.selenium.support.Money;
import nlu.fit.lab.vvthiet.selenium.support.TestFixtureClient;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PromotionCombinationTest extends BaseTest {

    /**
     * Preconditions:
     * - Rule A has priority 1, gives 10.00 off, and stops further rules.
     * - Rule B has priority 2, gives 5.00 off, and matches the same cart.
     * - No unrelated cart rule is active.
     */
    @Test(description = "Promo-21: Stop Further Rules prevents lower-priority rule")
    public void exclusivePromotions() {
        TestFixtureClient.preparePromotionScenario("exclusive-priority-stop-further");
        TestFixtureClient.prepareCart("100.00");
        openCart();

        Assert.assertEquals(cartPage.getDiscountAmount(), Money.of("10.00"),
                "Only priority-1 rule should be applied");
        Assert.assertEquals(cartPage.getGrandTotal(), Money.of("90.00"));
    }

    /**
     * Preconditions:
     * - Product A has a 100.00 price and a 10 percent product promotion.
     * - A separate stackable cart rule gives 5.00 off.
     * - The fixture prepares the cart without tax or shipping changes.
     */
    @Test(description = "Promo-22: stackable product rule and cart rule")
    public void stackableProductAndCartRules() {
        TestFixtureClient.preparePromotionScenario("stackable-product-cart");
        TestFixtureClient.prepareCart("100.00");
        openCart();

        Assert.assertEquals(cartPage.getSubtotal(), Money.of("90.00"),
                "Product rule reduces item A from $100 to $90");
        Assert.assertEquals(cartPage.getDiscountAmount(), Money.of("5.00"),
                "Stackable cart rule takes an additional $5 off");
        Assert.assertEquals(cartPage.getGrandTotal(), Money.of("85.00"));
    }
}
