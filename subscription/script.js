const subscribeButton =
    document.getElementById("telegramSubscribeBtn");

const applyCouponButton =
    document.getElementById("applyCouponBtn");

const couponInput =
    document.getElementById("couponInput");

const couponMessage =
    document.getElementById("couponMessage");

const originalPrice =
    document.getElementById("originalPrice");

const currentPrice =
    document.getElementById("currentPrice");

const ctaTitle =
    document.getElementById("ctaTitle");

const ctaText =
    document.getElementById("ctaText");


const TELEGRAM_BOT =
    "https://t.me/detwalhelpbot";


const NORMAL_PRICE = 25;

let selectedCoupon = "";
let selectedPrice = NORMAL_PRICE;


/*
========================================
INITIAL PRICE
========================================
*/

function setNormalPrice() {

    selectedCoupon = "";
    selectedPrice = NORMAL_PRICE;

    if (originalPrice) {
        originalPrice.textContent = "$25 USD";
        originalPrice.style.display = "none";
    }

    if (currentPrice) {
        currentPrice.textContent = "$25 USD";
    }

    if (ctaTitle) {
        ctaTitle.textContent = "Get News Trading Access";
    }

    if (ctaText) {
        ctaText.textContent =
            "Subscribe through our Telegram bot to continue.";
    }
}


/*
========================================
APPLY COUPON
========================================
*/

async function applyCoupon() {

    const code =
        couponInput.value.trim().toUpperCase();

    if (!code) {

        couponMessage.textContent =
            "Please enter a coupon code.";

        couponMessage.className =
            "coupon-message error";

        return;
    }


    applyCouponButton.disabled = true;

    applyCouponButton.textContent =
        "Checking...";


    couponMessage.textContent =
        "Checking coupon...";

    couponMessage.className =
        "coupon-message";


    try {

        const result =
            await validateCoupon(code);


        if (result.error) {

            couponMessage.textContent =
                "Unable to verify coupon. Please try again.";

            couponMessage.className =
                "coupon-message error";

            return;
        }


        if (!result.valid) {

            selectedCoupon = "";
            selectedPrice = NORMAL_PRICE;

            if (originalPrice) {
                originalPrice.style.display = "none";
            }

            if (currentPrice) {
                currentPrice.textContent = "$25 USD";
            }

            couponMessage.textContent =
                "Invalid or inactive coupon code.";

            couponMessage.className =
                "coupon-message error";

            return;
        }


        selectedCoupon =
            result.code;

        selectedPrice =
            result.price;


        if (originalPrice) {
            originalPrice.textContent =
                "$25 USD";

            originalPrice.style.display =
                "inline";
        }


        if (currentPrice) {
            currentPrice.textContent =
                `$${selectedPrice} USD`;
        }


        couponMessage.textContent =
            `Coupon ${selectedCoupon} applied successfully.`;

        couponMessage.className =
            "coupon-message success";


        if (ctaTitle) {
            ctaTitle.textContent =
                `Get Access for $${selectedPrice}`;
        }


        if (ctaText) {
            ctaText.textContent =
                `Your coupon ${selectedCoupon} has been applied. Continue through Telegram.`;
        }


    } catch (error) {

        console.error(
            "Coupon error:",
            error
        );

        couponMessage.textContent =
            "Something went wrong. Please try again.";

        couponMessage.className =
            "coupon-message error";

    } finally {

        applyCouponButton.disabled = false;

        applyCouponButton.textContent =
            "Apply Coupon";
    }
}


/*
========================================
COUPON BUTTON
========================================
*/

if (applyCouponButton) {

    applyCouponButton.addEventListener(
        "click",
        applyCoupon
    );
}


/*
========================================
ENTER KEY
========================================
*/

if (couponInput) {

    couponInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                applyCoupon();
            }
        }
    );
}


/*
========================================
TELEGRAM SUBSCRIBE
========================================
*/

if (subscribeButton) {

    subscribeButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            /*
            If a coupon has been entered,
            require successful validation first.
            */

            const enteredCode =
                couponInput
                    ? couponInput.value.trim()
                    : "";


            if (
                enteredCode &&
                !selectedCoupon
            ) {

                if (couponMessage) {

                    couponMessage.textContent =
                        "Please apply your coupon before continuing.";

                    couponMessage.className =
                        "coupon-message error";
                }

                return;
            }


            /*
            Send the user to Telegram.

            The coupon is passed in the URL so
            the bot can identify the selected
            subscription coupon.
            */

            let telegramURL =
                TELEGRAM_BOT;


            if (selectedCoupon) {

                telegramURL =
                    `${TELEGRAM_BOT}?start=news_${encodeURIComponent(selectedCoupon)}`;

            } else {

                telegramURL =
                    `${TELEGRAM_BOT}?start=news_subscription`;
            }


            window.location.href =
                telegramURL;
        }
    );
}


/*
========================================
START
========================================
*/

setNormalPrice();
