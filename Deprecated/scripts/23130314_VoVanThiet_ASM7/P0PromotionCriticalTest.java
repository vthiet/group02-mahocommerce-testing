package nlu.fit.lab.vvthiet.selenium.tests;

import nlu.fit.lab.vvthiet.selenium.base.BaseTest;
import nlu.fit.lab.vvthiet.selenium.pages.AdminPromotionPage;
import nlu.fit.lab.vvthiet.selenium.support.Money;
import nlu.fit.lab.vvthiet.selenium.support.MahoRestClient;
import nlu.fit.lab.vvthiet.selenium.support.TestFixtureClient;
import org.testng.Assert;
import org.testng.SkipException;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * P0 release-gate coverage for promotion money and abuse-prevention rules.
 *
 * P0-01 through P0-06 can run in manual setup mode with rules prepared in
 * Admin UI, or in API setup mode with a configured Maho REST v2 token.
 * P0-07 through P0-12 remain explicit skips until the environment exposes the
 * required authenticated order, concurrency, cancellation, refund, and audit
 * workflow; these cases must not be replaced by weaker UI assertions.
 */
public class P0PromotionCriticalTest extends BaseTest {
    private final List<String> createdCouponIds = new ArrayList<>();

    private String setupMode() {
        return System.getenv().getOrDefault("P0_SETUP_MODE",
                nlu.fit.lab.vvthiet.selenium.config.TestConfig.get("p0.setup.mode", "manual"))
                .trim().toLowerCase();
    }

    private String cartSetupMode() {
        return System.getenv().getOrDefault("P0_CART_SETUP_MODE",
                nlu.fit.lab.vvthiet.selenium.config.TestConfig.get("p0.cart.setup.mode", "manual"))
                .trim().toLowerCase();
    }

    private void prepareCart(String expectedSubtotal) {
        if ("manual".equals(cartSetupMode())) {
            // Manual mode uses a cart prepared in the storefront by the operator.
            // Verify its actual subtotal before executing the promotion assertions.
            openCart();
            Assert.assertEquals(cartPage.getSubtotal(), Money.of(expectedSubtotal),
                    "Prepare the storefront cart to the required subtotal before running this P0 case");
            return;
        }
        if ("ui".equals(cartSetupMode())) {
            prepareCartThroughUi(expectedSubtotal);
            return;
        }
        if (!"fixture".equals(cartSetupMode())) {
            throw new IllegalArgumentException("Unsupported P0_CART_SETUP_MODE='" + cartSetupMode()
                    + "'. Use manual, ui, or fixture.");
        }
        TestFixtureClient.prepareCart(expectedSubtotal);
    }

    /**
     * Prepares the cart using only storefront UI and an existing product.
     * The product price and target subtotal must produce an integer quantity.
     */
    private void prepareCartThroughUi(String expectedSubtotal) {
        BigDecimal target = Money.of(expectedSubtotal);
        String username = nlu.fit.lab.vvthiet.selenium.config.TestConfig.get("admin.user", "CHANGE_ME");
        String password = nlu.fit.lab.vvthiet.selenium.config.TestConfig.get("admin.password.value", "CHANGE_ME");
        Assert.assertNotEquals(username, "CHANGE_ME", "Set ADMIN_USER for Admin UI product setup");
        Assert.assertNotEquals(password, "CHANGE_ME", "Set ADMIN_PASSWORD_VALUE for Admin UI product setup");
        AdminPromotionPage admin = new AdminPromotionPage(driver, wait);
        admin.login(username, password);
        String sku = "P0-" + System.currentTimeMillis();
        adminProductPage.createSimpleProduct("P0 Test Product " + sku, sku, target.toPlainString());
        openCart();
        cartPage.clearItems();
        productPage.addProductBySku(sku);
        openCart();
        Assert.assertEquals(cartPage.getSubtotal(), target.setScale(2, RoundingMode.HALF_UP),
                "UI-prepared cart subtotal");
    }

    @AfterMethod(alwaysRun = true)
    public void cleanFixtureData() {
        for (String id : createdCouponIds) {
            MahoRestClient.deleteCoupon(id);
        }
        createdCouponIds.clear();
        // Do not mask the original test failure with a second failure from a
        // fixture reset that is incompatible with the target Maho schema.
        if ("fixture".equals(cartSetupMode())) {
            try {
                TestFixtureClient.reset();
            } catch (IllegalStateException cleanupFailure) {
                System.err.println("Fixture cleanup failed: " + cleanupFailure.getMessage());
            }
        }
    }

    /**
     * Preconditions:
     * - The p0-min-spend rule is active for the current website/customer group.
     * - The rule gives 20.00 off when subtotal is at least 100.00.
     * - The cart is empty and no unrelated rule is active.
     */
    @Test(description = "P0-01: apply fixed discount at exact minimum spend")
    public void fixedDiscountAtMinimumSpend() {
        createCoupon("P0_MIN", "{\"code\":\"P0_MIN\",\"discountType\":\"cart_fixed\",\"discountAmount\":20,"
                + "\"minimumSubtotal\":100,\"isActive\":true,\"fromDate\":\"2026-01-01\",\"toDate\":\"2027-12-31\"}");
        prepareCart("100.00");
        openCart();
        couponPage.apply("P0_MIN");

        Assert.assertEquals(cartPage.getSubtotal(), Money.of("100.00"));
        Assert.assertEquals(cartPage.getDiscountAmount(), Money.of("20.00"));
        Assert.assertEquals(cartPage.getGrandTotal(), Money.of("80.00"));
    }

    /**
     * Preconditions:
     * - The p0-min-spend rule requires a subtotal of at least 100.00.
     * - The cart subtotal can be prepared as 99.99.
     * - No unrelated promotion is active.
     */
    @Test(description = "P0-02: reject cart below minimum spend")
    public void fixedDiscountBelowMinimumSpend() {
        createCoupon("P0_MIN", "{\"code\":\"P0_MIN\",\"discountType\":\"cart_fixed\",\"discountAmount\":20,"
                + "\"minimumSubtotal\":100,\"isActive\":true,\"fromDate\":\"2026-01-01\",\"toDate\":\"2027-12-31\"}");
        prepareCart("99.99");
        openCart();
        couponPage.apply("P0_MIN");

        Assert.assertFalse(cartPage.isDiscountDisplayed(),
                "Discount must not be displayed below the minimum spend");
        Assert.assertEquals(cartPage.getGrandTotal(), Money.of("99.99"));
    }

    /**
     * Preconditions:
     * - A 50-percent promotion with a maximum discount of 50.00 is active.
     * - The cart can be prepared with a subtotal of 1,000.00.
     * - No other promotion changes the total.
     */
    @Test(description = "P0-03: enforce maximum discount cap")
    public void percentageDiscountRespectsCap() {
        createCoupon("P0_CAP", "{\"code\":\"P0_CAP\",\"discountType\":\"percent\",\"discountAmount\":50,"
                + "\"maximumDiscount\":50,\"isActive\":true,\"fromDate\":\"2026-01-01\",\"toDate\":\"2027-12-31\"}");
        prepareCart("1000.00");
        openCart();
        couponPage.apply("P0_CAP");

        Assert.assertEquals(cartPage.getDiscountAmount(), Money.of("50.00"),
                "50% promotion must be capped at 50.00");
        Assert.assertEquals(cartPage.getGrandTotal(), Money.of("950.00"));
    }

    /**
     * Preconditions:
     * - A 100-percent or fixed-over-value promotion is active.
     * - The cart value is 10.00.
     * - The environment supports a zero-total checkout or configured minimum.
     */
    @Test(description = "P0-04: prevent negative payable totals")
    public void discountCannotCreateNegativeTotal() {
        createCoupon("P0_ZERO", "{\"code\":\"P0_ZERO\",\"discountType\":\"cart_fixed\",\"discountAmount\":20,"
                + "\"isActive\":true,\"fromDate\":\"2026-01-01\",\"toDate\":\"2027-12-31\"}");
        prepareCart("10.00");
        openCart();
        couponPage.apply("P0_ZERO");

        Assert.assertTrue(cartPage.isDiscountDisplayed());
        Assert.assertEquals(cartPage.getGrandTotal(), Money.of("0.00"),
                "A discount greater than the cart value must floor at zero");
        Assert.assertFalse(cartPage.getGrandTotal().signum() < 0,
                "Payable total must never be negative");
    }

    /**
     * Preconditions:
     * - Coupons P0A and P0B are active and each gives 10 percent off.
     * - Promotion policy permits only one coupon in a cart.
     * - The cart subtotal is 100.00 and starts without a coupon.
     */
    @Test(description = "P0-05: prevent unauthorized percentage coupon stacking")
    public void percentageCouponsDoNotStackUnexpectedly() {
        createCoupon("P0A", "{\"code\":\"P0A\",\"discountType\":\"percent\",\"discountAmount\":10,\"isActive\":true}");
        createCoupon("P0B", "{\"code\":\"P0B\",\"discountType\":\"percent\",\"discountAmount\":10,\"isActive\":true}");
        prepareCart("100.00");
        openCart();

        couponPage.apply("P0A");
        couponPage.apply("P0B");

        Assert.assertEquals(cartPage.getDiscountAmount(), Money.of("10.00"),
                "Only one 10% coupon may affect the cart");
        Assert.assertEquals(cartPage.getGrandTotal(), Money.of("90.00"));
    }

    /**
     * Preconditions:
     * - Rule A has priority 1, gives 10.00 off, and stops further rules.
     * - Rule B has priority 2 and gives 5.00 off.
     * - Both rules match a 100.00 cart and no unrelated rule is active.
     */
    @Test(description = "P0-06: enforce priority and stop-further-rules behavior")
    public void unsupportedPromotionCombinationIsNotApplied() {
        createCoupon("P0_PRIORITY_A", "{\"code\":\"P0_PRIORITY_A\",\"discountType\":\"cart_fixed\",\"discountAmount\":10,"
                + "\"priority\":1,\"stopFurtherRules\":true,\"isActive\":true}");
        createCoupon("P0_PRIORITY_B", "{\"code\":\"P0_PRIORITY_B\",\"discountType\":\"cart_fixed\",\"discountAmount\":5,"
                + "\"priority\":2,\"isActive\":true}");
        prepareCart("100.00");
        openCart();
        couponPage.apply("P0_PRIORITY_A");
        couponPage.apply("P0_PRIORITY_B");

        Assert.assertEquals(cartPage.getDiscountAmount(), Money.of("10.00"),
                "The priority rule must prevent the lower-priority discount");
        Assert.assertEquals(cartPage.getGrandTotal(), Money.of("90.00"));
    }

    /**
     * Preconditions:
     * - Customer A exists and is eligible for the promotion.
     * - P0_PER_CUSTOMER gives 10 percent off and allows one use per customer.
     * - Customer A has no previous usage of the coupon.
     */
    @Test(description = "P0-07: enforce one-use-per-customer limit")
    public void oneUsePerCustomerIsEnforced() {
        backendP0NotAvailable("customer-authenticated order workflow through REST API");
    }

    /**
     * Preconditions:
     * - P0_GLOBAL gives 10 percent off and has one global use remaining.
     * - Customer A and customer B are separate eligible accounts.
     * - Neither account has an unrelated active coupon in its cart.
     */
    @Test(description = "P0-08: enforce global coupon usage budget")
    public void globalCouponUsageLimitIsEnforced() {
        backendP0NotAvailable("global usage consumption through REST order workflow");
    }

    /**
     * Preconditions:
     * - P0_RACE has exactly one global usage remaining.
     * - Two independent customer sessions and eligible carts are available.
     * - The fixture provides an atomic concurrent-consumption endpoint.
     */
    @Test(description = "P0-09: prevent usage-budget overrun under concurrency")
    public void concurrentOrdersCannotOverrunGlobalUsageBudget() {
        backendP0NotAvailable("atomic concurrent coupon-consumption endpoint");
    }

    /**
     * Preconditions:
     * - An unpaid order can be created with a limited-use coupon.
     * - The environment exposes cancellation and coupon-usage restoration data.
     * - The documented cancellation policy is available to the test.
     */
    @Test(description = "P0-10: restore coupon usage after cancellation")
    public void cancellationRestoresCouponUsageAccordingToSpecification() {
        backendP0NotAvailable("order cancellation and coupon-usage restoration endpoint");
    }

    /**
     * Preconditions:
     * - A paid order exists with original value 100.00, discount 20.00, and
     *   captured total 80.00.
     * - The environment exposes refund transaction data.
     * - The refund policy for discounted orders is documented.
     */
    @Test(description = "P0-11: calculate refunds from amount actually paid")
    public void refundUsesDiscountedPaidAmount() {
        backendP0NotAvailable("refund calculation endpoint");
    }

    /**
     * Preconditions:
     * - An eligible promotion and customer are available.
     * - The order, invoice, Admin, API, and database records can be inspected.
     * - Promotion usage starts at zero.
     */
    @Test(description = "P0-12: persist promotion totals and usage consistently")
    public void promotionTotalsAndUsageArePersistedConsistently() {
        backendP0NotAvailable("order/invoice/Admin audit endpoint");
    }

    private void backendP0NotAvailable(String capability) {
        throw new SkipException("P0 backend contract is not available: " + capability
                + ". Configure Maho REST v2 credentials/endpoints before enabling this release-gate test.");
    }

    private void createCoupon(String code, String jsonBody) {
        if ("manual".equals(setupMode())) {
            // The coupon/rule must already exist and be configured in Admin UI.
            // This mode needs no REST token and does not modify backend data.
            return;
        }
        if (!"api".equals(setupMode())) {
            throw new SkipException("Unsupported P0_SETUP_MODE='" + setupMode()
                    + "'. Use 'manual' or 'api'.");
        }
        MahoRestClient.Response response = MahoRestClient.createCoupon(jsonBody);
        if (response.isProtocolDisabled()) {
            throw new SkipException("Maho REST v2 is disabled on the target instance. "
                    + "Enable the API protocol or configure an Admin-UI setup path before running P0 API cases. "
                    + "Response: " + response.body());
        }
        Assert.assertTrue(response.isSuccess(),
                "Maho REST coupon creation failed for " + code + ": " + response.body());

        Matcher matcher = Pattern.compile("\\\"id\\\"\\s*:\\s*(\\d+)").matcher(response.body());
        if (!matcher.find()) {
            throw new IllegalStateException("Maho REST coupon response did not contain an id: "
                    + response.body());
        }
        createdCouponIds.add(matcher.group(1));
    }
}
