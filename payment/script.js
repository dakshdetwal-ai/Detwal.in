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
        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );
    }
} catch (error) {
    console.warn("Supabase initialization failed:", error);
}


/* ---------------------------------------------------------
   Configuration
--------------------------------------------------------- */

const DETWAL_UPI = "dakshdetwal@fam";

const DEFAULT_PRODUCT = "DETwal News Trading";
const DEFAULT_PRICE = 9;


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
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "$9.00";
    }

    return `$${number.toFixed(2)}`;
}


function generateOrderId() {
    const now = new Date();

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


function showMessage(message, type = "info") {
    if (!paymentMessage) return;

    paymentMessage.textContent = message;

    paymentMessage.className =
        `payment-message show ${type}`;
}


function clearMessage() {
    if (!paymentMessage) return;

    paymentMessage.textContent = "";

    paymentMessage.className =
        "payment-message";
}


/* ---------------------------------------------------------
   Load Checkout Data
--------------------------------------------------------- */

function loadCheckoutData() {

    try {
        const saved =
            sessionStorage.getItem("detwalCheckout");

        if (saved) {
            checkoutData = JSON.parse(saved);
        }
    } catch (error) {
        console.warn(
            "Could not read checkout data:",
            error
        );
    }


    if (!checkoutData || typeof checkoutData !== "object") {

        checkoutData = {
            product: DEFAULT_PRODUCT,
            basePrice: DEFAULT_PRICE,
            finalPrice: DEFAULT_PRICE,
            coupon: "",
            currency: "USD"
        };
    }


    const product =
        checkoutData.product ||
        DEFAULT_PRODUCT;

    const finalPrice =
        Number(checkoutData.finalPrice);

    const price =
        Number.isFinite(finalPrice)
            ? finalPrice
            : DEFAULT_PRICE;

    const coupon =
        checkoutData.coupon || "";


    /* Product */

    if (productName) {
        productName.textContent = product;
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

    if (coupon && couponRow && paymentCoupon) {

        couponRow.style.display = "flex";

        paymentCoupon.textContent =
            coupon;

    } else if (couponRow) {

        couponRow.style.display = "none";
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
        } = await supabaseClient.auth.getUser();

        if (error || !data || !data.user) {
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

        /* Fallback for older browsers */

        try {

            const textarea =
                document.createElement("textarea");

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


    if (!emailPattern.test(email)) {

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


    if (customerUpi.length < 4) {

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
        Number(checkoutData.finalPrice);

    const price =
        Number.isFinite(finalPrice)
            ? finalPrice
            : DEFAULT_PRICE;


    return {

        order_id: orderId,

        product:
            checkoutData.product ||
            DEFAULT_PRODUCT,

        base_price:
            Number(checkoutData.basePrice) ||
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


    /* Show generated order ID */

    if (orderIdDisplay) {
        orderIdDisplay.textContent =
            request.order_id;
    }

    if (orderIdBox) {
        orderIdBox.style.display =
            "block";
    }


    /*
       IMPORTANT:
       The backend endpoint will be connected
       in the next backend step.

       For now, save the payment request locally
       so the frontend flow is ready.
    */

    try {

        sessionStorage.setItem(
            "detwalPaymentRequest",
            JSON.stringify(request)
        );

    } catch (error) {

        console.warn(
            "Could not save payment request:",
            error
        );
    }


    /*
       Temporary frontend state.

       This DOES NOT mean the payment has been
       verified. It only confirms that the request
       has been prepared successfully.
    */

    verifyPaymentBtn.disabled =
        true;

    verifyPaymentBtn.textContent =
        "Submitting...";


    showMessage(
        "Payment verification request prepared. Our team will verify your payment and confirm your access.",
        "success"
    );


    /*
       Keep this timeout only until the backend
       endpoint is connected.
    */

    setTimeout(() => {

        verifyPaymentBtn.disabled =
            false;

        verifyPaymentBtn.innerHTML =
            'Verify Payment <span>→</span>';

    }, 1800);
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
   Set UPI ID
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
