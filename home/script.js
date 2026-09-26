// ==========================================
// DETwal HOME
// Supabase Account + Basic Interactions
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
// DOM READY
// ==========================================

document.addEventListener("DOMContentLoaded", () => {


    // ======================================
    // SMOOTH SCROLLING
    // ======================================

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener("click", event => {

                const targetId =
                    link.getAttribute("href");

                if (targetId === "#") {
                    return;
                }

                const target =
                    document.querySelector(targetId);

                if (target) {

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            });

        });


    // ======================================
    // ACCOUNT ELEMENTS
    // ======================================

    const accountMenu =
        document.getElementById("accountMenu");

    const accountButton =
        document.getElementById("accountButton");

    const accountDropdown =
        document.getElementById("accountDropdown");

    const signupNavBtn =
        document.getElementById("signupNavBtn");

    const accountInitial =
        document.getElementById("accountInitial");

    const accountName =
        document.getElementById("accountName");

    const accountAvatar =
        document.getElementById("accountAvatar");

    const dropdownName =
        document.getElementById("dropdownName");

    const dropdownEmail =
        document.getElementById("dropdownEmail");

    const navProfit =
        document.getElementById("navProfit");

    const logoutBtn =
        document.getElementById("logoutBtn");


    // ======================================
    // GET JOURNAL PROFIT
    // ======================================

    function getJournalProfit() {

        const trades =
            JSON.parse(
                localStorage.getItem(
                    "detwal_trades"
                ) || "[]"
            );

        let totalProfit = 0;

        trades.forEach(trade => {

            const pnl =
                Number(
                    trade.pnl ??
                    trade.profit ??
                    0
                );

            if (!isNaN(pnl)) {
                totalProfit += pnl;
            }

        });

        return totalProfit;

    }


    // ======================================
    // FORMAT PROFIT
    // ======================================

    function formatProfit(amount) {

        const sign =
            amount >= 0 ? "+" : "-";

        return (
            sign +
            "$" +
            Math.abs(amount).toFixed(2)
        );

    }


    // ======================================
    // LOAD ACCOUNT
    // ======================================

    async function loadAccount() {

        try {

            const {
                data: {
                    session
                }
            } =
                await supabaseClient.auth.getSession();


            // ==================================
            // LOGGED OUT
            // ==================================

            if (!session || !session.user) {

                if (accountMenu) {
                    accountMenu.style.display =
                        "none";
                }

                if (signupNavBtn) {
                    signupNavBtn.style.display =
                        "inline-flex";
                }

                return;
            }


            // ==================================
            // USER DATA
            // ==================================

            const user =
                session.user;

            const name =
                user.user_metadata?.full_name ||
                user.email?.split("@")[0] ||
                "User";

            const email =
                user.email || "";

            const initial =
                name
                    .charAt(0)
                    .toUpperCase();


            // ==================================
            // UPDATE NAVBAR
            // ==================================

            if (signupNavBtn) {
                signupNavBtn.style.display =
                    "none";
            }

            if (accountMenu) {
                accountMenu.style.display =
                    "block";
            }

            if (accountName) {
                accountName.textContent =
                    name;
            }

            if (dropdownName) {
                dropdownName.textContent =
                    name;
            }

            if (dropdownEmail) {
                dropdownEmail.textContent =
                    email;
            }

            if (accountInitial) {
                accountInitial.textContent =
                    initial;
            }

            if (accountAvatar) {
                accountAvatar.textContent =
                    initial;
            }


            // ==================================
            // PROFIT
            // ==================================

            const profit =
                getJournalProfit();

            if (navProfit) {

                navProfit.textContent =
                    formatProfit(profit);

            }


            // ==================================
            // LOCAL USER CACHE
            // ==================================

            localStorage.setItem(
                "detwal_user",
                JSON.stringify({
                    id: user.id,
                    email: email,
                    name: name
                })
            );


        } catch (error) {

            console.error(
                "Account loading error:",
                error
            );

        }

    }


    // ======================================
    // ACCOUNT DROPDOWN
    // ======================================

    if (accountButton) {

        accountButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                accountDropdown.classList.toggle(
                    "active"
                );

            }
        );

    }


    // ======================================
    // CLOSE DROPDOWN
    // ======================================

    document.addEventListener(
        "click",
        event => {

            if (
                accountMenu &&
                !accountMenu.contains(
                    event.target
                )
            ) {

                if (accountDropdown) {

                    accountDropdown.classList.remove(
                        "active"
                    );

                }

            }

        }
    );


    // ======================================
    // LOGOUT
    // ======================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async () => {

                logoutBtn.disabled = true;

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


                    // Clear local cache

                    localStorage.removeItem(
                        "detwal_user"
                    );


                    // Return home

                    window.location.href =
                        "./";


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


    // ======================================
    // AUTH STATE
    // ======================================

    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            console.log(
                "Auth event:",
                event
            );

            if (session) {

                loadAccount();

            } else {

                if (accountMenu) {
                    accountMenu.style.display =
                        "none";
                }

                if (signupNavBtn) {
                    signupNavBtn.style.display =
                        "inline-flex";
                }

            }

        }
    );


    // ======================================
    // INITIAL ACCOUNT LOAD
    // ======================================

    loadAccount();

});
