package nlu.fit.lab.vvthiet.selenium.tests;

import nlu.fit.lab.vvthiet.selenium.base.BaseTest;
import nlu.fit.lab.vvthiet.selenium.support.Money;
import nlu.fit.lab.vvthiet.selenium.support.TestFixtureClient;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class CouponTest extends BaseTest {

    @AfterMethod(alwaysRun = true)
    public void restoreSystemDate() {
        TestFixtureClient.resetSystemDate();
    }

    /**
     * Preconditions:
     * - Customer A exists and has no previous ONETIME usage.
     * - ONETIME is active, gives 10 percent off, and allows one use per customer.
     * - The fixture-bound cart can be prepared at 60.00.
     */
    @Test(description = "Promo-10: coupon first use by registered customer")
    public void couponFirstUse() {
        TestFixtureClient.prepareCoupon("ONETIME", "2026-01-01", "2027-12-31", "1", "customerA");
        TestFixtureClient.loginCustomer("customerA");
        TestFixtureClient.prepareCart("60.00");
        openCart();
        couponPage.apply("ONETIME");
        Assert.assertTrue(couponPage.getMessage().contains("applied successfully"));
        Assert.assertTrue(cartPage.isDiscountDisplayed());
        Assert.assertEquals(cartPage.getDiscountAmount(), Money.of("6.00"), "10% coupon discount");
        Assert.assertEquals(cartPage.getGrandTotal(), Money.of("54.00"), "total after coupon");
    }

    /**
     * Preconditions:
     * - Customer A has one completed order recorded against ONETIME.
     * - ONETIME remains active but its per-customer limit is one.
     * - A new eligible 60.00 cart is available for the same customer.
     */
    @Test(description = "Promo-11: reject same coupon after maximum uses")
    public void couponSecondUseRejected() {
        TestFixtureClient.prepareCoupon("ONETIME", "2026-01-01", "2027-12-31", "1", "customerA");
        TestFixtureClient.loginCustomer("customerA");
        TestFixtureClient.completeOrderUsingCoupon("customerA", "ONETIME");
        TestFixtureClient.prepareCart("60.00");
        openCart();
        couponPage.apply("ONETIME");
        Assert.assertTrue(couponPage.getMessage().contains("already been used maximum allowed times"));
        Assert.assertFalse(cartPage.isDiscountDisplayed());
        Assert.assertEquals(cartPage.getGrandTotal(), Money.of("60.00"), "total stays unchanged");
    }

    @DataProvider(name = "couponDateCases")
    public Object[][] couponDateCases() {
        return new Object[][] {
                {"2026-05-31", "Coupon code is not active yet", false, "Promo-12"},
                {"2026-06-01", null, true, "Promo-13"},
                {"2026-06-04", null, true, "Promo-14"},
                {"2026-06-07", null, true, "Promo-15"},
                {"2026-06-08", "Coupon code has expired", false, "Promo-16"}
        };
    }

    /**
     * Preconditions:
     * - SUMMER is active from 2026-06-01 through 2026-06-07 inclusive.
     * - The fixture can set and restore the virtual system date.
     * - Each data row starts with an isolated 60.00 cart.
     */
    @Test(dataProvider = "couponDateCases", description = "Promo-12 to Promo-16: coupon validity dates")
    public void couponValidityDates(String systemDate, String expectedMessage,
                                    boolean expectedSuccess, String id) {
        TestFixtureClient.prepareCoupon("SUMMER", "2026-06-01", "2026-06-07", "0", "guest");
        TestFixtureClient.setSystemDate(systemDate);
        TestFixtureClient.prepareCart("60.00");
        openCart();
        couponPage.apply("SUMMER");
        String actualMessage = couponPage.getMessage();

        if (expectedSuccess) {
            Assert.assertTrue(actualMessage.toLowerCase().contains("success"), id + " success message");
            Assert.assertTrue(cartPage.isDiscountDisplayed(), id + " discount should be displayed");
            Assert.assertEquals(cartPage.getDiscountAmount(), Money.of("6.00"), id + " discount amount");
            Assert.assertEquals(cartPage.getGrandTotal(), Money.of("54.00"), id + " discounted total");
        } else {
            Assert.assertTrue(actualMessage.contains(expectedMessage), id + " error message");
            Assert.assertFalse(cartPage.isDiscountDisplayed(), id + " discount should not be displayed");
            Assert.assertEquals(cartPage.getGrandTotal(), Money.of("60.00"), id + " unchanged total");
        }
    }

    @DataProvider(name = "couponStringCases")
    public Object[][] couponStringCases() {
        return new Object[][] {
                {"SUMMER2026", true, "Promo-17"},
                {"summer2026", true, "Promo-18"},
                {"INVALID999", false, "Promo-19"}
        };
    }

    /**
     * Preconditions:
     * - SUMMER2026 is active for the valid-code rows.
     * - INVALID999 is absent from the coupon/rule data.
     * - Each data row starts with no applied coupon and a 60.00 cart.
     */
    @Test(dataProvider = "couponStringCases", description = "Promo-17 to Promo-19: coupon string validation")
    public void couponStringValidation(String code, boolean expectedSuccess, String id) {
        TestFixtureClient.prepareCoupon("SUMMER2026", "2026-01-01", "2027-12-31", "0", "guest");
        TestFixtureClient.prepareCart("60.00");
        openCart();
        couponPage.apply(code);
        String message = couponPage.getMessage();

        if (expectedSuccess) {
            Assert.assertTrue(message.toLowerCase().contains("success"), id + " success message");
            Assert.assertTrue(cartPage.isDiscountDisplayed(), id + " discount should be applied");
            Assert.assertEquals(cartPage.getDiscountAmount(), Money.of("6.00"), id + " discount amount");
            Assert.assertEquals(cartPage.getGrandTotal(), Money.of("54.00"), id + " discounted total");
        } else {
            Assert.assertTrue(message.contains("INVALID999") || message.contains("not valid"),
                    id + " invalid coupon message");
            Assert.assertFalse(cartPage.isDiscountDisplayed(), id + " discount should not be applied");
            Assert.assertEquals(cartPage.getGrandTotal(), Money.of("60.00"), id + " unchanged total");
        }
    }

    /**
     * Preconditions:
     * - The cart page contains an eligible item.
     * - No coupon is applied before the test starts.
     * - The cart total can be read before and after the empty submission.
     */
    @Test(description = "Promo-20: empty coupon code")
    public void emptyCouponCode() {
        TestFixtureClient.prepareCart("60.00");
        openCart();
        var totalBefore = cartPage.getGrandTotal();
        couponPage.apply("");
        Assert.assertTrue(couponPage.getMessage().contains("Please enter a coupon code"));
        Assert.assertEquals(cartPage.getGrandTotal(), totalBefore, "empty coupon must not change total");
    }
}
