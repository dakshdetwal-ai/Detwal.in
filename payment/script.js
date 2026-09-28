"use strict";

/* =========================================================
   DETwal Payment Page
========================================================= */


/* ---------------------------------------------------------
   Supabase
--------------------------------------------------------- */

const SUPABASE_URL =
    "https://evsnwenvmwhrohyzrjgq.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_Vfy2VLbqRYB_DOsK13iuqA_9-pk4Q5t";

let supabaseClient = null;

try {

    if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
    ) {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );
    }

} catch (error) {

    console.warn(
        "Supabase initialization failed:",
        error
    );
}


/* ---------------------------------------------------------
   Configuration
--------------------------------------------------------- */

const DETWAL_UPI =
    "dakshdetwal@fam";

const DEFAULT_PRODUCT =
    "DETwal News Trading";

const DEFAULT_PRICE =
    9;


/*
    IMPORTANT

    This is the Cloudflare Worker endpoint
    created for News Trading payment requests.

    Change this URL only if you deploy the Worker
    under a different URL.
*/

const PAYMENT_API =
    "https://detwal-help-bot.dakshdetwal10.workers.dev/news-payment";


/* ---------------------------------------------------------
   Elements
--------------------------------------------------------- */

const paymentForm =
    document.getElementById("paymentForm");

const nameInput =
    document.getElementById("nameInput");

const emailInput =
    document.getElementById("emailInput");

const customerUpiInput =
    document.getElementById("customerUpiInput");

const detwalUpi =
    document.getElementById("detwalUpi");

const copyUpiBtn =
    document.getElementById("copyUpiBtn");

const verifyPaymentBtn =
    document.getElementById("verifyPaymentBtn");

const paymentMessage =
    document.getElementById("paymentMessage");

const productName =
    document.getElementById("productName");

const paymentPrice =
    document.getElementById("paymentPrice");

const paymentCoupon =
    document.getElementById("paymentCoupon");

const paymentTotal =
    document.getElementById("paymentTotal");

const couponRow =
    document.getElementById("couponRow");

const orderIdBox =
    document.getElementById("orderIdBox");

const orderIdDisplay =
    document.getElementById("orderIdDisplay");


/* ---------------------------------------------------------
   Checkout Data
--------------------------------------------------------- */

let checkoutData = null;


/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatUSD(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return "$9.00";
    }

    return `$${number.toFixed(2)}`;
}


function generateOrderId() {

    const now =
        new Date();

    const datePart =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");

    const randomPart =
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

    return `DET-${datePart}-${randomPart}`;
}


function showMessage(
    message,
    type = "info"
) {

    if (!paymentMessage) {
        return;
    }

    paymentMessage.textContent =
        message;

    paymentMessage.className =
        `payment-message show ${type}`;
}


function clearMessage() {

    if (!paymentMessage) {
        return;
    }

    paymentMessage.textContent =
        "";

    paymentMessage.className =
        "payment-message";
}


/* ---------------------------------------------------------
   Load Checkout Data
--------------------------------------------------------- */

function loadCheckoutData() {

    try {

        const saved =
            sessionStorage.getItem(
                "detwalCheckout"
            );

        if (saved) {

            checkoutData =
                JSON.parse(saved);
        }

    } catch (error) {

        console.warn(
            "Could not read checkout data:",
            error
        );
    }


    if (
        !checkoutData ||
        typeof checkoutData !== "object"
    ) {

        checkoutData = {

            product:
                DEFAULT_PRODUCT,

            basePrice:
                DEFAULT_PRICE,

            finalPrice:
                DEFAULT_PRICE,

            coupon:
                "",

            currency:
                "USD"
        };
    }


    const product =
        checkoutData.product ||
        DEFAULT_PRODUCT;


    const finalPrice =
        Number(
            checkoutData.finalPrice
        );


    const price =
        Number.isFinite(finalPrice)
            ? finalPrice
            : DEFAULT_PRICE;


    const coupon =
        checkoutData.coupon || "";


    /* Product */

    if (productName) {

        productName.textContent =
            product;
    }


    /* Price */

    if (paymentPrice) {

        paymentPrice.textContent =
            formatUSD(price);
    }


    /* Total */

    if (paymentTotal) {

        paymentTotal.textContent =
            formatUSD(price);
    }


    /* Coupon */

    if (
        coupon &&
        couponRow &&
        paymentCoupon
    ) {

        couponRow.style.display =
            "flex";

        paymentCoupon.textContent =
            coupon;

    } else if (couponRow) {

        couponRow.style.display =
            "none";
    }
}


/* ---------------------------------------------------------
   Prefill Supabase User
--------------------------------------------------------- */

async function prefillUser() {

    if (!supabaseClient) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getUser();


        if (
            error ||
            !data ||
            !data.user
        ) {

            return;
        }


        const user =
            data.user;


        const metadata =
            user.user_metadata || {};


        /* Email */

        if (
            emailInput &&
            !emailInput.value &&
            user.email
        ) {

            emailInput.value =
                user.email;
        }


        /* Name */

        const possibleName =
            metadata.name ||
            metadata.full_name ||
            metadata.fullName ||
            "";


        if (
            nameInput &&
            !nameInput.value &&
            possibleName
        ) {

            nameInput.value =
                possibleName;
        }

    } catch (error) {

        console.warn(
            "Could not prefill user:",
            error
        );
    }
}


/* ---------------------------------------------------------
   Copy DETwal UPI
--------------------------------------------------------- */

async function copyDetwalUpi() {

    try {

        await navigator.clipboard.writeText(
            DETWAL_UPI
        );


        if (copyUpiBtn) {

            copyUpiBtn.textContent =
                "Copied";

            copyUpiBtn.classList.add(
                "copied"
            );


            setTimeout(() => {

                copyUpiBtn.textContent =
                    "Copy";

                copyUpiBtn.classList.remove(
                    "copied"
                );

            }, 1800);
        }

    } catch (error) {

        /* Fallback */

        try {

            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value =
                DETWAL_UPI;

            textarea.style.position =
                "fixed";

            textarea.style.opacity =
                "0";


            document.body.appendChild(
                textarea
            );

            textarea.select();

            document.execCommand(
                "copy"
            );

            textarea.remove();


            if (copyUpiBtn) {

                copyUpiBtn.textContent =
                    "Copied";

                copyUpiBtn.classList.add(
                    "copied"
                );


                setTimeout(() => {

                    copyUpiBtn.textContent =
                        "Copy";

                    copyUpiBtn.classList.remove(
                        "copied"
                    );

                }, 1800);
            }

        } catch (fallbackError) {

            showMessage(
                "Could not copy automatically. Please copy the UPI ID manually.",
                "error"
            );
        }
    }
}


/* ---------------------------------------------------------
   Validate Form
--------------------------------------------------------- */

function validateForm() {

    clearMessage();


    const name =
        nameInput?.value.trim() || "";


    const email =
        emailInput?.value.trim() || "";


    const customerUpi =
        customerUpiInput?.value.trim() || "";


    if (name.length < 2) {

        showMessage(
            "Please enter your full name.",
            "error"
        );

        nameInput?.focus();

        return false;
    }


    if (name.length > 100) {

        showMessage(
            "Name is too long.",
            "error"
        );

        nameInput?.focus();

        return false;
    }


    if (!email) {

        showMessage(
            "Please enter your email address.",
            "error"
        );

        emailInput?.focus();

        return false;
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(email) ||
        email.length > 200
    ) {

        showMessage(
            "Please enter a valid email address.",
            "error"
        );

        emailInput?.focus();

        return false;
    }


    if (!customerUpi) {

        showMessage(
            "Please enter the UPI ID you used for payment.",
            "error"
        );

        customerUpiInput?.focus();

        return false;
    }


    if (
        customerUpi.length < 4 ||
        customerUpi.length > 200
    ) {

        showMessage(
            "Please enter a valid UPI ID.",
            "error"
        );

        customerUpiInput?.focus();

        return false;
    }


    return true;
}


/* ---------------------------------------------------------
   Create Payment Request
--------------------------------------------------------- */

function createPaymentRequest() {

    const orderId =
        generateOrderId();


    const name =
        nameInput.value.trim();


    const email =
        emailInput.value.trim();


    const customerUpi =
        customerUpiInput.value.trim();


    const finalPrice =
        Number(
            checkoutData.finalPrice
        );


    const price =
        Number.isFinite(finalPrice)
            ? finalPrice
            : DEFAULT_PRICE;


    return {

        order_id:
            orderId,

        product:
            checkoutData.product ||
            DEFAULT_PRODUCT,

        base_price:
            Number(
                checkoutData.basePrice
            ) ||
            DEFAULT_PRICE,

        final_price:
            price,

        coupon:
            checkoutData.coupon ||
            "",

        currency:
            checkoutData.currency ||
            "USD",

        customer_name:
            name,

        customer_email:
            email,

        customer_upi:
            customerUpi,

        detwal_upi:
            DETWAL_UPI,

        created_at:
            new Date().toISOString()
    };
}


/* ---------------------------------------------------------
   Submit Payment Verification
--------------------------------------------------------- */

async function submitPaymentVerification() {

    if (!validateForm()) {
        return;
    }


    const request =
        createPaymentRequest();


    /* Show Order ID */

    if (orderIdDisplay) {

        orderIdDisplay.textContent =
            request.order_id;
    }


    if (orderIdBox) {

        orderIdBox.style.display =
            "block";
    }


    /* Disable button */

    if (verifyPaymentBtn) {

        verifyPaymentBtn.disabled =
            true;

        verifyPaymentBtn.textContent =
            "Verifying...";
    }


    clearMessage();


    try {

        /*
            Send payment details
            to Cloudflare Worker.
        */

        const response =
            await fetch(
                PAYMENT_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            request
                        )
                }
            );


        let result = null;


        try {

            result =
                await response.json();

        } catch (jsonError) {

            result = null;
        }


        /* -----------------------------------------
           HTTP ERROR
        ----------------------------------------- */

        if (!response.ok) {

            throw new Error(
                result?.error ||
                "Unable to submit payment verification request."
            );
        }


        /* -----------------------------------------
           BACKEND ERROR
        ----------------------------------------- */

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.error ||
                "Payment verification request failed."
            );
        }


        /* -----------------------------------------
           SAVE LOCALLY
           Only after successful backend response.
        ----------------------------------------- */

        try {

            sessionStorage.setItem(
                "detwalPaymentRequest",
                JSON.stringify({
                    ...request,

                    submittedAt:
                        new Date().toISOString(),

                    status:
                        result.status ||
                        "pending"
                })
            );

        } catch (storageError) {

            console.warn(
                "Could not save payment request locally:",
                storageError
            );
        }


        /* -----------------------------------------
           SUCCESS MESSAGE
        ----------------------------------------- */

        showMessage(
            "Payment details submitted successfully. Our team will manually verify your payment and contact you through the email provided.",
            "success"
        );


        /* -----------------------------------------
           SUCCESS BUTTON STATE
        ----------------------------------------- */

        if (verifyPaymentBtn) {

            verifyPaymentBtn.disabled =
                true;

            verifyPaymentBtn.innerHTML =
                "Verification Submitted ✓";
        }


    } catch (error) {

        console.error(
            "PAYMENT SUBMISSION ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Something went wrong. Please try again.",
            "error"
        );


        /* Re-enable button */

        if (verifyPaymentBtn) {

            verifyPaymentBtn.disabled =
                false;

            verifyPaymentBtn.innerHTML =
                'Verify Payment <span>→</span>';
        }
    }
}


/* ---------------------------------------------------------
   Form Submit
--------------------------------------------------------- */

if (paymentForm) {

    paymentForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            await submitPaymentVerification();
        }
    );
}


/* ---------------------------------------------------------
   Copy Button
--------------------------------------------------------- */

if (copyUpiBtn) {

    copyUpiBtn.addEventListener(
        "click",
        copyDetwalUpi
    );
}


/* ---------------------------------------------------------
   Set DETwal UPI
--------------------------------------------------------- */

if (detwalUpi) {

    detwalUpi.textContent =
        DETWAL_UPI;
}


/* ---------------------------------------------------------
   Initialize
--------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        loadCheckoutData();

        await prefillUser();
    }
);
