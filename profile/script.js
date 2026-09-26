// ==========================================
// DETwal PROFILE
// Supabase Account + Statistics + Security
// ==========================================


// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const SUPABASE_URL =
    "https://evsnwenvmwhrohyzrjgq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Vfy2VLbqRYB_DOsK13iuqA_9-pk4Q5t";


// ==========================================
// CREATE SUPABASE CLIENT
// ==========================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ==========================================
// ELEMENTS
// ==========================================

const profileAvatar =
    document.getElementById("profileAvatar");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const verifiedBadge =
    document.getElementById("verifiedBadge");

const totalProfit =
    document.getElementById("totalProfit");

const totalTrades =
    document.getElementById("totalTrades");

const winRate =
    document.getElementById("winRate");

const averageRR =
    document.getElementById("averageRR");

const detailName =
    document.getElementById("detailName");

const detailEmail =
    document.getElementById("detailEmail");

const accountStatus =
    document.getElementById("accountStatus");

const memberSince =
    document.getElementById("memberSince");

const changePasswordBtn =
    document.getElementById("changePasswordBtn");

const passwordForm =
    document.getElementById("passwordForm");

const cancelPasswordBtn =
    document.getElementById("cancelPasswordBtn");

const resetPasswordBtn =
    document.getElementById("resetPasswordBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// GET JOURNAL TRADES
// ==========================================

function getTrades() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "detwal_trades"
            ) || "[]"
        );

    } catch (error) {

        console.error(
            "Unable to read journal trades:",
            error
        );

        return [];

    }

}


// ==========================================
// CALCULATE TRADING STATISTICS
// ==========================================

function calculateStats() {

    const trades =
        getTrades();

    let profit = 0;

    let winningTrades = 0;

    let rrTotal = 0;

    let rrCount = 0;


    trades.forEach(trade => {

        const pnl =
            Number(
                trade.pnl ??
                trade.profit ??
                0
            );

        if (!isNaN(pnl)) {

            profit += pnl;

            if (pnl > 0) {
                winningTrades++;
            }

        }


        // Support common RR formats

        let rr =
            trade.rr ??
            trade.riskReward ??
            trade.risk_reward;


        if (typeof rr === "string") {

            rr = rr
                .replace("R:R", "")
                .replace("RR", "")
                .trim();

            if (rr.includes(":")) {

                const parts =
                    rr.split(":");

                rr =
                    Number(parts[1]) /
                    Number(parts[0]);

            }

        }

        rr = Number(rr);

        if (
            !isNaN(rr) &&
            rr > 0
        ) {

            rrTotal += rr;

            rrCount++;

        }

    });


    const tradeCount =
        trades.length;

    const calculatedWinRate =
        tradeCount > 0
            ? (winningTrades / tradeCount) * 100
            : 0;

    const calculatedAverageRR =
        rrCount > 0
            ? rrTotal / rrCount
            : 0;


    return {
        profit,
        tradeCount,
        winRate: calculatedWinRate,
        averageRR: calculatedAverageRR
    };

}


// ==========================================
// FORMAT MONEY
// ==========================================

function formatMoney(amount) {

    const sign =
        amount >= 0
            ? "+"
            : "-";

    return (
        sign +
        "$" +
        Math.abs(amount).toFixed(2)
    );

}


// ==========================================
// FORMAT R:R
// ==========================================

function formatRR(value) {

    if (
        !value ||
        isNaN(value)
    ) {
        return "0:0";
    }

    return (
        "1:" +
        value.toFixed(2)
    );

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

    if (!dateString) {
        return "Unknown";
    }

    const date =
        new Date(dateString);

    if (isNaN(date.getTime())) {
        return "Unknown";
    }

    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile() {

    try {

        const {
            data: {
                session
            }
        } =
            await supabaseClient
                .auth
                .getSession();


        // ==================================
        // NOT LOGGED IN
        // ==================================

        if (
            !session ||
            !session.user
        ) {

            window.location.href =
                "../login/";

            return;

        }


        // ==================================
        // USER
        // ==================================

        const user =
            session.user;


        const name =
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User";


        const email =
            user.email ||
            "";


        const initial =
            name
                .charAt(0)
                .toUpperCase();


        // ==================================
        // PROFILE INFORMATION
        // ==================================

        if (profileAvatar) {
            profileAvatar.textContent =
                initial;
        }

        if (profileName) {
            profileName.textContent =
                name;
        }

        if (profileEmail) {
            profileEmail.textContent =
                email;
        }

        if (detailName) {
            detailName.textContent =
                name;
        }

        if (detailEmail) {
            detailEmail.textContent =
                email;
        }


        // ==================================
        // VERIFICATION STATUS
        // ==================================

        if (
            user.email_confirmed_at ||
            user.confirmed_at
        ) {

            verifiedBadge.textContent =
                "✓ Verified";

            accountStatus.textContent =
                "Active";

        } else {

            verifiedBadge.textContent =
                "Email not verified";

            accountStatus.textContent =
                "Email verification required";

        }


        // ==================================
        // MEMBER SINCE
        // ==================================

        memberSince.textContent =
            formatDate(
                user.created_at
            );


        // ==================================
        // TRADING STATISTICS
        // ==================================

        const stats =
            calculateStats();


        totalProfit.textContent =
            formatMoney(
                stats.profit
            );


        totalTrades.textContent =
            stats.tradeCount;


        winRate.textContent =
            stats.winRate.toFixed(1) +
            "%";


        averageRR.textContent =
            formatRR(
                stats.averageRR
            );


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        alert(
            "Unable to load your account. Please log in again."
        );

        window.location.href =
            "../login/";

    }

}


// ==========================================
// CHANGE PASSWORD FORM
// ==========================================

if (changePasswordBtn) {

    changePasswordBtn.addEventListener(
        "click",
        function () {

            passwordForm.style.display =
                passwordForm.style.display === "none"
                    ? "block"
                    : "none";

        }
    );

}


// ==========================================
// CANCEL PASSWORD CHANGE
// ==========================================

if (cancelPasswordBtn) {

    cancelPasswordBtn.addEventListener(
        "click",
        function () {

            passwordForm.reset();

            passwordForm.style.display =
                "none";

        }
    );

}


// ==========================================
// UPDATE PASSWORD
// ==========================================

if (passwordForm) {

    passwordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const newPassword =
                document.getElementById(
                    "newPassword"
                ).value;

            const confirmPassword =
                document.getElementById(
                    "confirmNewPassword"
                ).value;


            // ==============================
            // VALIDATION
            // ==============================

            if (
                !newPassword ||
                !confirmPassword
            ) {

                alert(
                    "Please enter your new password."
                );

                return;

            }


            if (newPassword.length < 8) {

                alert(
                    "Password must contain at least 8 characters."
                );

                return;

            }


            if (
                newPassword !==
                confirmPassword
            ) {

                alert(
                    "Passwords do not match."
                );

                return;

            }


            const submitButton =
                passwordForm.querySelector(
                    'button[type="submit"]'
                );


            submitButton.disabled =
                true;

            submitButton.textContent =
                "Updating...";


            try {

                const {
                    error
                } =
                    await supabaseClient
                        .auth
                        .updateUser({
                            password:
                                newPassword
                        });


                if (error) {

                    console.error(
                        "Password update error:",
                        error
                    );

                    alert(
                        error.message ||
                        "Unable to update password."
                    );

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Update Password";

                    return;

                }


                alert(
                    "Password updated successfully."
                );


                passwordForm.reset();

                passwordForm.style.display =
                    "none";


                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Update Password";


            } catch (error) {

                console.error(
                    "Password update error:",
                    error
                );

                alert(
                    "Unable to update your password. Please try again."
                );

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Update Password";

            }

        }
    );

}


// ==========================================
// FORGOT PASSWORD / RESET EMAIL
// ==========================================

if (resetPasswordBtn) {

    resetPasswordBtn.addEventListener(
        "click",
        async function () {

            try {

                const {
                    data: {
                        session
                    }
                } =
                    await supabaseClient
                        .auth
                        .getSession();


                if (
                    !session ||
                    !session.user ||
                    !session.user.email
                ) {

                    alert(
                        "Please log in again."
                    );

                    window.location.href =
                        "../login/";

                    return;

                }


                const email =
                    session.user.email;


                resetPasswordBtn.disabled =
                    true;

                resetPasswordBtn.textContent =
                    "Sending...";


                const {
                    error
                } =
                    await supabaseClient
                        .auth
                        .resetPasswordForEmail(
                            email,
                            {
                                redirectTo:
                                    window.location.origin +
                                    "/DETwal/profile/"
                            }
                        );


                if (error) {

                    console.error(
                        "Password reset error:",
                        error
                    );

                    alert(
                        error.message ||
                        "Unable to send reset email."
                    );

                    resetPasswordBtn.disabled =
                        false;

                    resetPasswordBtn.textContent =
                        "Send Reset Email";

                    return;

                }


                alert(
                    "Password reset email sent. Please check your inbox."
                );


                resetPasswordBtn.disabled =
                    false;

                resetPasswordBtn.textContent =
                    "Send Reset Email";


            } catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );

                alert(
                    "Unable to send the reset email. Please try again."
                );

                resetPasswordBtn.disabled =
                    false;

                resetPasswordBtn.textContent =
                    "Send Reset Email";

            }

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function () {

            logoutBtn.disabled =
                true;

            logoutBtn.textContent =
                "Logging out...";


            try {

                const {
                    error
                } =
                    await supabaseClient
                        .auth
                        .signOut();


                if (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    alert(
                        error.message ||
                        "Unable to log out."
                    );

                    logoutBtn.disabled =
                        false;

                    logoutBtn.textContent =
                        "Log Out";

                    return;

                }


                localStorage.removeItem(
                    "detwal_user"
                );


                window.location.href =
                    "../home/";


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Unable to log out. Please try again."
                );

                logoutBtn.disabled =
                    false;

                logoutBtn.textContent =
                    "Log Out";

            }

        }
    );

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadProfile();
