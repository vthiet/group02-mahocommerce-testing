package nlu.fit.lab.vvthiet.selenium.tests;

import nlu.fit.lab.vvthiet.selenium.base.BaseTest;
import nlu.fit.lab.vvthiet.selenium.support.Money;
import nlu.fit.lab.vvthiet.selenium.support.TestFixtureClient;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.math.BigDecimal;

public class CartPromotionTest extends BaseTest {

    @DataProvider(name = "thresholdBva")
    public Object[][] thresholdBva() {
        return new Object[][] {
                {"49.99", "0.00", "49.99", false, "Promo-1"},
                {"50.00", "10.00", "40.00", true, "Promo-2"},
                {"50.01", "10.00", "40.01", true, "Promo-3"}
        };
    }

    /**
     * Preconditions:
     * - The fixture configures the minimum-subtotal promotion for each data row.
     * - The browser session is bound to the same storefront session as the fixture.
     * - The cart starts empty and no unrelated promotion is active.
     */
    @Test(dataProvider = "thresholdBva", description = "Promo-1 to Promo-3: BVA minimum subtotal")
    public void minimumThresholdBva(String subtotal, String discount, String total,
                                    boolean discountExpected, String id) {
        TestFixtureClient.prepareCart(subtotal);
        openCart();

        Assert.assertEquals(cartPage.getSubtotal(), Money.of(subtotal), id + " subtotal");
        Assert.assertEquals(cartPage.isDiscountDisplayed(), discountExpected, id + " discount visibility");
        if (discountExpected) {
            Assert.assertEquals(cartPage.getDiscountAmount(), Money.of(discount), id + " discount amount");
        }
        Assert.assertEquals(cartPage.getGrandTotal(), Money.of(total), id + " grand total");
    }

    @DataProvider(name = "tierBoundaryBva")
    public Object[][] tierBoundaryBva() {
        return new Object[][] {
                {"199.99", "20.00", "179.99", "Promo-4"},
                {"200.00", "20.00", "180.00", "Promo-5"},
                {"200.01", "40.00", "160.01", "Promo-6"}
        };
    }

    /**
     * Preconditions:
     * - Tier 1 is active for 50.00 through 200.00 and Tier 2 is active above 200.00.
     * - The fixture prepares the requested boundary subtotal.
     * - The cart starts empty and totals use the configured store currency.
     */
    @Test(dataProvider = "tierBoundaryBva", description = "Promo-4 to Promo-6: BVA tier boundary")
    public void tierBoundaryBva(String subtotal, String discount, String total, String id) {
        TestFixtureClient.prepareCart(subtotal);
        openCart();

        Assert.assertEquals(cartPage.getSubtotal(), Money.of(subtotal), id + " subtotal");
        Assert.assertTrue(cartPage.isDiscountDisplayed(), id + " discount should be displayed");
        Assert.assertEquals(cartPage.getDiscountAmount(), Money.of(discount), id + " discount");
        Assert.assertEquals(cartPage.getGrandTotal(), Money.of(total), id + " grand total");
    }

    @DataProvider(name = "equivalencePartitions")
    public Object[][] equivalencePartitions() {
        return new Object[][] {
                {"20.00", "0.00", "20.00", false, "Promo-7"},
                {"100.00", "10.00", "90.00", true, "Promo-8"},
                {"350.00", "70.00", "280.00", true, "Promo-9"}
        };
    }

    /**
     * Preconditions:
     * - The fixture prepares the requested invalid, middle, or upper partition.
     * - The expected rule configuration is isolated for the data row.
     * - The browser opens an empty cart in the fixture-bound session.
     */
    @Test(dataProvider = "equivalencePartitions", description = "Promo-7 to Promo-9: EP")
    public void equivalencePartitions(String subtotal, String discount, String total,
                                      boolean discountExpected, String id) {
        TestFixtureClient.prepareCart(subtotal);
        openCart();

        Assert.assertEquals(cartPage.getSubtotal(), Money.of(subtotal), id + " subtotal");
        Assert.assertEquals(cartPage.isDiscountDisplayed(), discountExpected, id + " discount visibility");
        if (discountExpected) {
            Assert.assertEquals(cartPage.getDiscountAmount(), Money.of(discount), id + " discount");
        }
        Assert.assertEquals(cartPage.getGrandTotal(), Money.of(total), id + " grand total");
    }
}
