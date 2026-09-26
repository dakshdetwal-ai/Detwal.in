/*
==================================================
DETwal — NEWS TRADING SUBSCRIPTION
==================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    const originalPrice = document.getElementById("originalPrice");
    const currentPrice = document.getElementById("currentPrice");

    const couponInput = document.getElementById("couponInput");
    const applyCouponBtn = document.getElementById("applyCouponBtn");
    const couponMessage = document.getElementById("couponMessage");

    const ctaTitle = document.getElementById("ctaTitle");
    const ctaText = document.getElementById("ctaText");

    const telegramSubscribeBtn =
        document.getElementById("telegramSubscribeBtn");


    /*
    ==============================================
    CURRENT COUPON STATE
    ==============================================
    */

    let appliedCoupon = "";
    let appliedPrice = 25;


    /*
    ==============================================
    DEFAULT PRICE
    ==============================================
    */

    function showNormalPrice() {

        appliedCoupon = "";
        appliedPrice = 25;

        if (originalPrice) {
            originalPrice.textContent = "$25";
        }

        if (currentPrice) {
            currentPrice.textContent = "$25";
        }

        if (ctaTitle) {
            ctaTitle.textContent = "Ready to subscribe?";
        }

        if (ctaText) {
            ctaText.textContent =
                "Continue through Telegram to complete your subscription.";
        }
    }


    /*
    ==============================================
    APPLY COUPON
    ==============================================
    */

    async function applyCoupon() {

        const code =
            String(couponInput?.value || "")
                .trim()
                .toUpperCase();


        // Nothing entered
        if (!code) {

            showNormalPrice();

            if (couponMessage) {
                couponMessage.textContent =
                    "Please enter a coupon code.";

                couponMessage.style.color = "#9298A8";
            }

            return;
        }


        // Disable button while checking
        if (applyCouponBtn) {
            applyCouponBtn.disabled = true;
            applyCouponBtn.textContent = "Checking...";
        }


        if (couponMessage) {
            couponMessage.textContent =
                "Checking coupon...";

            couponMessage.style.color = "#9298A8";
        }


        try {

            /*
            validateCoupon() comes from coupon.js
            */

            const result =
                await validateCoupon(code);


            console.log(
                "DETwal coupon validation result:",
                result
            );


            /*
            ======================================
            VALID COUPON
            ======================================
            */

            if (result.valid === true) {

                appliedCoupon =
                    String(
                        result.code || code
                    ).toUpperCase();

                appliedPrice =
                    Number(result.price);


                if (originalPrice) {
                    originalPrice.textContent = "$25";
                }


                if (currentPrice) {
                    currentPrice.textContent =
                        `$${appliedPrice}`;
                }


                if (couponMessage) {

                    couponMessage.textContent =
                        `✓ Coupon ${appliedCoupon} applied`;

                    couponMessage.style.color =
                        "#A78BFA";
                }


                if (ctaTitle) {
                    ctaTitle.textContent =
                        "Discount applied";
                }


                if (ctaText) {

                    ctaText.textContent =
                        `Your News Trading subscription price is now $${appliedPrice}. Continue through Telegram to complete your subscription.`;
                }


                return;
            }


            /*
            ======================================
            INVALID COUPON
            ======================================
            */

            appliedCoupon = "";
            appliedPrice = 25;


            if (currentPrice) {
                currentPrice.textContent = "$25";
            }


            if (couponMessage) {

                couponMessage.textContent =
                    "✕ Invalid or inactive coupon.";

                couponMessage.style.color =
                    "#9298A8";
            }


            if (ctaTitle) {
                ctaTitle.textContent =
                    "Ready to subscribe?";
            }


            if (ctaText) {

                ctaText.textContent =
                    "Continue through Telegram to complete your subscription.";
            }


        } catch (error) {

            console.error(
                "Coupon application error:",
                error
            );


            appliedCoupon = "";
            appliedPrice = 25;


            if (currentPrice) {
                currentPrice.textContent = "$25";
            }


            if (couponMessage) {

                couponMessage.textContent =
                    "Unable to verify coupon. Please try again.";

                couponMessage.style.color =
                    "#9298A8";
            }
        }


        /*
        ======================================
        RE-ENABLE BUTTON
        ======================================
        */

        if (applyCouponBtn) {

            applyCouponBtn.disabled = false;
            applyCouponBtn.textContent = "Apply";
        }
    }


    /*
    ==============================================
    APPLY BUTTON
    ==============================================
    */

    if (applyCouponBtn) {

        applyCouponBtn.addEventListener(
            "click",
            applyCoupon
        );
    }


    /*
    ==============================================
    ENTER KEY
    ==============================================
    */

    if (couponInput) {

        couponInput.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    applyCoupon();
                }
            }
        );
    }


    /*
    ==============================================
    TELEGRAM SUBSCRIBE
    ==============================================
    */

    if (telegramSubscribeBtn) {

        telegramSubscribeBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();


                /*
                ==================================
                NO COUPON
                ==================================
                */

                if (!appliedCoupon) {

                    window.location.href =
                        "https://t.me/detwalhelpbot?start=news_subscription";

                    return;
                }


                /*
                ==================================
                COUPON APPLIED
                ==================================
                */

                const telegramURL =
                    `https://t.me/detwalhelpbot?start=news_${encodeURIComponent(appliedCoupon)}`;


                console.log(
                    "Opening Telegram with coupon:",
                    appliedCoupon
                );


                window.location.href =
                    telegramURL;
            }
        );
    }


    /*
    ==============================================
    INITIAL STATE
    ==============================================
    */

    showNormalPrice();

});
