// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const SUPABASE_URL =
    "https://evsnwenvmwhrohyzrjgq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Vfy2VLbqRYB_DOsK13iuqA_9-pk4Q5t";


// ==========================================
// CLOUDFLARE ACCOUNT REQUEST API
// ==========================================

const ACCOUNT_REQUEST_API =
    "https://detwal-help-bot.dakshdetwal10.workers.dev/account-request";


// ==========================================
// CREATE SUPABASE CLIENT
// ==========================================

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ==========================================
// SIGNUP FORM
// ==========================================

const signupForm =
    document.getElementById("signupForm");


// ==========================================
// SHOW MANUAL ACCOUNT REQUEST
// ==========================================

function showManualAccountRequest(name, email) {

    // Remove existing fallback if already created
    const existing =
        document.getElementById(
            "manualAccountRequest"
        );

    if (existing) {
        existing.remove();
    }


    const fallback =
        document.createElement("div");

    fallback.id =
        "manualAccountRequest";

    fallback.style.marginTop = "20px";
    fallback.style.padding = "20px";
    fallback.style.border = "1px solid #1D2130";
    fallback.style.borderRadius = "14px";
    fallback.style.background = "#090C14";


    fallback.innerHTML = `
        <div style="
            font-size:18px;
            font-weight:700;
            color:#FFFFFF;
            margin-bottom:10px;
        ">
            Account creation is temporarily unavailable
        </div>

        <div style="
            font-size:14px;
            line-height:1.6;
            color:#9298A8;
            margin-bottom:16px;
        ">
            We're currently experiencing a temporary issue
            with automatic account creation.
            <br><br>
            Don't worry — you can still submit your
            account request. Our team will manually
            create your DETwal account and contact you
            at your registered email.
        </div>

        <div style="
            font-size:13px;
            color:#606678;
            margin-bottom:14px;
        ">
            <strong style="color:#FFFFFF;">
                Name:
            </strong>
            ${escapeHTML(name)}
            <br>

            <strong style="color:#FFFFFF;">
                Email:
            </strong>
            ${escapeHTML(email)}
        </div>

        <button
            type="button"
            id="manualAccountRequestBtn"
            style="
                width:100%;
                padding:13px 16px;
                border:none;
                border-radius:10px;
                background:#8B5CF6;
                color:#FFFFFF;
                font-weight:700;
                cursor:pointer;
                font-size:14px;
            "
        >
            Submit Account Request
        </button>

        <div
            id="manualAccountRequestStatus"
            style="
                margin-top:12px;
                font-size:13px;
                line-height:1.5;
            "
        ></div>
    `;


    signupForm.appendChild(fallback);


    const requestButton =
        document.getElementById(
            "manualAccountRequestBtn"
        );

    const status =
        document.getElementById(
            "manualAccountRequestStatus"
        );


    requestButton.addEventListener(
        "click",
        async function () {

            requestButton.disabled = true;

            requestButton.textContent =
                "Sending request...";

            status.textContent = "";

            status.style.color =
                "#9298A8";


            try {

                const response =
                    await fetch(
                        ACCOUNT_REQUEST_API,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name: name,
                                email: email
                            })
                        }
                    );


                const result =
                    await response.json();


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.error ||
                        "Unable to submit request."
                    );
                }


                status.style.color =
                    "#A78BFA";

                status.innerHTML = `
                    <strong>
                        Request submitted successfully.
                    </strong>
                    <br>
                    Request ID:
                    ${escapeHTML(
                        result.requestId || "Pending"
                    )}
                    <br><br>
                    Our team will create your account
                    and contact you by email.
                `;


                requestButton.textContent =
                    "Request Submitted";

                requestButton.disabled = true;


            } catch (error) {

                console.error(
                    "Manual account request error:",
                    error
                );


                status.style.color =
                    "#F87171";

                status.textContent =
                    "We couldn't submit your request. Please try again shortly.";

                requestButton.disabled = false;

                requestButton.textContent =
                    "Submit Account Request";
            }
        }
    );
}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// SHOULD SHOW FALLBACK?
// ==========================================

function shouldUseFallback(error) {

    if (!error) {
        return false;
    }


    const message =
        String(
            error.message || ""
        ).toLowerCase();


    const code =
        String(
            error.code || ""
        ).toLowerCase();


    // Supabase email rate limit
    if (
        code ===
        "over_email_send_rate_limit"
    ) {
        return true;
    }


    // Common email/auth rate-limit messages
    if (
        message.includes(
            "email rate limit"
        ) ||

        message.includes(
            "rate limit"
        ) ||

        message.includes(
            "too many requests"
        ) ||

        message.includes(
            "over_email_send_rate_limit"
        )
    ) {
        return true;
    }


    return false;
}


// ==========================================
// FORM SUBMISSION
// ==========================================

signupForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            document
                .getElementById("name")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        const confirmPassword =
            document
                .getElementById("confirmPassword")
                .value;


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !name ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            alert(
                "Please fill in all fields."
            );

            return;
        }


        if (
            password !==
            confirmPassword
        ) {

            alert(
                "Passwords do not match."
            );

            return;
        }


        if (
            password.length < 8
        ) {

            alert(
                "Password must contain at least 8 characters."
            );

            return;
        }


        // ======================================
        // BUTTON
        // ======================================

        const submitButton =
            signupForm.querySelector(
                'button[type="submit"]'
            );


        submitButton.disabled = true;

        submitButton.textContent =
            "Creating account...";


        // ======================================
        // CREATE ACCOUNT
        // ======================================

        try {

            const {
                data,
                error
            } =
                await supabaseClient.auth.signUp({

                    email: email,

                    password: password,

                    options: {

                        data: {
                            full_name: name
                        },

                        emailRedirectTo:
                            window.location.origin +
                            "/DETwal/home/"
                    }

                });


            // ==================================
            // SUPABASE ERROR
            // ==================================

            if (error) {

                console.error(
                    "Supabase signup error:",
                    error
                );


                // --------------------------------
                // TEMPORARY SYSTEM / EMAIL ERROR
                // --------------------------------

                if (
                    shouldUseFallback(error)
                ) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Create Account";


                    showManualAccountRequest(
                        name,
                        email
                    );


                    return;
                }


                // --------------------------------
                // NORMAL AUTH ERROR
                // --------------------------------

                alert(
                    error.message ||
                    "Unable to create your account."
                );


                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Create Account";


                return;
            }


            // ==================================
            // SUCCESS
            // ==================================

            if (
                data &&
                data.user
            ) {

                console.log(
                    "Account created:",
                    data.user
                );


                // --------------------------------
                // EMAIL CONFIRMATION ENABLED
                // --------------------------------

                if (
                    !data.session
                ) {

                    alert(
                        "Account created successfully! Please check your email and confirm your account."
                    );


                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Create Account";


                    return;
                }


                // --------------------------------
                // EMAIL CONFIRMATION DISABLED
                // --------------------------------

                alert(
                    "Account created successfully!"
                );


                window.location.href =
                    "../home/";
            }


        } catch (error) {

            console.error(
                "Signup error:",
                error
            );


            // ==================================
            // CONNECTION / SYSTEM FAILURE
            // ==================================

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Create Account";


            showManualAccountRequest(
                name,
                email
            );
        }

    }
);
