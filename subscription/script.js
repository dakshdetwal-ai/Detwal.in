/*
==================================================
DETwal — NEWS TRADING SUBSCRIPTION
==================================================
*/

document.addEventListener("DOMContentLoaded", async () => {

    /*
    ==============================================
    SUPABASE
    ==============================================
    */

    const SUPABASE_URL =
        "https://evsnwenvmwhrohyzrjgq.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_Vfy2VLbqRYB_DOsK13iuqA_9-pk4Q5t";

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    /*
    ==============================================
    ACCOUNT BUTTON
    ==============================================
    */

    const accountBtn =
        document.getElementById("accountBtn");


    async function updateAccountButton() {

        if (!accountBtn) return;

        try {

            const {
                data,
                error
            } =
                await supabaseClient.auth.getSession();


            if (error) {

                console.error(
                    "Failed to get Supabase session:",
                    error
                );

                accountBtn.href =
                    "../signup/";

                accountBtn.textContent =
                    "Account";

                return;
            }


            const session =
                data?.session;


            if (
                session &&
                session.user
            ) {

                accountBtn.href =
                    "../profile/";

                accountBtn.textContent =
                    "Account";

            } else {

                accountBtn.href =
                    "../signup/";

                accountBtn.textContent =
                    "Account";

            }

        } catch (error) {

            console.error(
                "Account session error:",
                error
            );

            accountBtn.href =
                "../signup/";

            accountBtn.textContent =
                "Account";
        }
    }


    /*
    ==============================================
    IMPORTANT:
    We NEVER call supabase.auth.signOut()
    on this page.
    ==============================================
    */

    await updateAccountButton();


    /*
    ==============================================
    AUTH STATE
    ==============================================
    */

    supabaseClient.auth.onAuthStateChange(
        () => {

            updateAccountButton();

        }
    );


    /*
    ==============================================
    PRICE
    ==============================================
    */

    const NORMAL_PRICE = 9;


    const originalPrice =
        document.getElementById("originalPrice");


    const currentPrice =
        document.getElementById("currentPrice");


    /*
    ==============================================
    COUPON
    ==============================================
    */

    const couponInput =
        document.getElementById("couponInput");


    const applyCouponBtn =
        document.getElementById("applyCouponBtn");


    const couponMessage =
        document.getElementById("couponMessage");


    /*
    ==============================================
    CTA
    ==============================================
    */

    const paymentSubscribeBtn =
        document.getElementById(
            "paymentSubscribeBtn"
        );


    const ctaTitle =
        document.getElementById("ctaTitle");


    const ctaText =
        document.getElementById("ctaText");


    /*
    ==============================================
    CURRENT COUPON STATE
    ==============================================
    */

    let appliedCoupon = "";

    let appliedPrice =
        NORMAL_PRICE;


    /*
    ==============================================
    SAVE CHECKOUT DATA
    ==============================================
    */

    function saveCheckoutData() {

        const checkoutData = {

            product:
                "DETwal News Trading",

            basePrice:
                NORMAL_PRICE,

            finalPrice:
                Number(appliedPrice),

            coupon:
                appliedCoupon || "",

            currency:
                "USD",

            createdAt:
                new Date().toISOString()

        };


        sessionStorage.setItem(
            "detwalCheckout",
            JSON.stringify(checkoutData)
        );
    }


    /*
    ==============================================
    DEFAULT PRICE
    ==============================================
    */

    function showNormalPrice() {

        appliedCoupon = "";

        appliedPrice =
            NORMAL_PRICE;


        if (originalPrice) {

            originalPrice.textContent =
                `$${NORMAL_PRICE}`;

        }


        if (currentPrice) {

            currentPrice.textContent =
                `$${NORMAL_PRICE}`;

        }


        if (ctaTitle) {

            ctaTitle.textContent =
                "Ready to trade the news?";

        }


        if (ctaText) {

            ctaText.textContent =
                "Continue to secure your access through DETwal.";

        }


        if (paymentSubscribeBtn) {

            paymentSubscribeBtn.textContent =
                `Subscribe for $${NORMAL_PRICE}`;

        }

    }


    /*
    ==============================================
    APPLY COUPON
    ==============================================
    */

    async function applyCoupon() {

        const code =
            String(
                couponInput?.value || ""
            )
                .trim()
                .toUpperCase();


        /*
        ==========================================
        NOTHING ENTERED
        ==========================================
        */

        if (!code) {

            showNormalPrice();


            if (couponMessage) {

                couponMessage.textContent =
                    "Please enter a coupon code.";

                couponMessage.style.color =
                    "#9298A8";

            }

            return;
        }


        /*
        ==========================================
        DISABLE WHILE CHECKING
        ==========================================
        */

        if (applyCouponBtn) {

            applyCouponBtn.disabled =
                true;

            applyCouponBtn.textContent =
                "Checking...";

        }


        if (couponMessage) {

            couponMessage.textContent =
                "Checking coupon...";

            couponMessage.style.color =
                "#9298A8";

        }


        try {

            /*
            ======================================
            VALIDATE COUPON
            ======================================
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

            if (
                result.valid === true
            ) {

                appliedCoupon =
                    String(
                        result.code || code
                    ).toUpperCase();


                appliedPrice =
                    Number(result.price);


                /*
                ==================================
                KEEP BASE PRICE VISIBLE
                ==================================
                */

                if (originalPrice) {

                    originalPrice.textContent =
                        "$9";

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
                        `Your News Trading subscription price is now $${appliedPrice}. Continue to secure your access through DETwal.`;

                }


                if (paymentSubscribeBtn) {

                    paymentSubscribeBtn.textContent =
                        `Subscribe for $${appliedPrice}`;

                }


                return;

            }


            /*
            ======================================
            INVALID COUPON
            ======================================
            */

            appliedCoupon = "";

            appliedPrice =
                NORMAL_PRICE;


            if (currentPrice) {

                currentPrice.textContent =
                    `$${NORMAL_PRICE}`;

            }


            if (originalPrice) {

                originalPrice.textContent =
                    `$${NORMAL_PRICE}`;

            }


            if (couponMessage) {

                couponMessage.textContent =
                    "✕ Invalid or inactive coupon.";

                couponMessage.style.color =
                    "#9298A8";

            }


            if (ctaTitle) {

                ctaTitle.textContent =
                    "Ready to trade the news?";

            }


            if (ctaText) {

                ctaText.textContent =
                    "Continue to secure your access through DETwal.";

            }


            if (paymentSubscribeBtn) {

                paymentSubscribeBtn.textContent =
                    `Subscribe for $${NORMAL_PRICE}`;

            }


        } catch (error) {

            console.error(
                "Coupon application error:",
                error
            );


            appliedCoupon = "";

            appliedPrice =
                NORMAL_PRICE;


            if (currentPrice) {

                currentPrice.textContent =
                    `$${NORMAL_PRICE}`;

            }


            if (originalPrice) {

                originalPrice.textContent =
                    `$${NORMAL_PRICE}`;

            }


            if (couponMessage) {

                couponMessage.textContent =
                    "Unable to verify coupon. Please try again.";

                couponMessage.style.color =
                    "#9298A8";

            }


            if (paymentSubscribeBtn) {

                paymentSubscribeBtn.textContent =
                    `Subscribe for $${NORMAL_PRICE}`;

            }

        }


        /*
        ======================================
        RE-ENABLE BUTTON
        ======================================
        */

        if (applyCouponBtn) {

            applyCouponBtn.disabled =
                false;

            applyCouponBtn.textContent =
                "Apply";

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
    PAYMENT PAGE
    ==============================================
    */

    if (paymentSubscribeBtn) {

        paymentSubscribeBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();


                /*
                ==================================
                SAVE CURRENT CHECKOUT
                ==================================
                */

                saveCheckoutData();


                /*
                ==================================
                OPEN DETWAL PAYMENT PAGE
                ==================================
                */

                window.location.href =
                    "../payment/";

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
