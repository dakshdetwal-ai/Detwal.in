const COUPON_API =
    "https://detwal-help-bot.dakshdetwal10.workers.dev/subscription-coupon";

const NORMAL_PRICE = 25;


/*
========================================
CHECK COUPON
========================================
*/

async function validateCoupon(code) {
    const cleanCode = String(code || "")
        .trim()
        .toUpperCase();

    if (!cleanCode) {
        return {
            valid: false,
            price: NORMAL_PRICE
        };
    }

    try {
        const response = await fetch(
            `${COUPON_API}?code=${encodeURIComponent(cleanCode)}`
        );

        if (!response.ok) {
            throw new Error("Coupon API request failed.");
        }

        const data = await response.json();

        if (data.success && data.valid) {
            return {
                valid: true,
                code: data.code,
                price: Number(data.price)
            };
        }

        return {
            valid: false,
            price: NORMAL_PRICE
        };

    } catch (error) {
        console.error("Coupon validation error:", error);

        return {
            valid: false,
            price: NORMAL_PRICE,
            error: true
        };
    }
}
