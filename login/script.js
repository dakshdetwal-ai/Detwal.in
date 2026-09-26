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

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ==========================================
// LOGIN FORM
// ==========================================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    // ======================================
    // GET VALUES
    // ======================================

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    // ======================================
    // VALIDATION
    // ======================================

    if (!email || !password) {

        alert("Please enter your email and password.");

        return;
    }


    // ======================================
    // BUTTON
    // ======================================

    const submitButton =
        loginForm.querySelector(
            'button[type="submit"]'
        );

    submitButton.disabled = true;

    submitButton.querySelector(".button-text").textContent =
        "Logging in...";


    // ======================================
    // LOGIN
    // ======================================

    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        // ==================================
        // ERROR
        // ==================================

        if (error) {

            console.error(
                "Supabase login error:",
                error
            );

            alert(
                error.message ||
                "Unable to log in."
            );

            submitButton.disabled = false;

            submitButton.querySelector(".button-text").textContent =
                "Log In";

            return;
        }


        // ==================================
        // SUCCESS
        // ==================================

        if (data && data.user) {

            console.log(
                "Logged in successfully:",
                data.user
            );

            // Store basic login state for DETwal frontend
            localStorage.setItem(
                "detwal_user",
                JSON.stringify({
                    id: data.user.id,
                    email: data.user.email,
                    name:
                        data.user.user_metadata?.full_name ||
                        ""
                })
            );

            window.location.href =
                "../home/";

            return;
        }


        // ==================================
        // FALLBACK
        // ==================================

        alert(
            "Login could not be completed. Please try again."
        );

        submitButton.disabled = false;

        submitButton.querySelector(".button-text").textContent =
            "Log In";


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        alert(
            "Unable to connect to DETwal authentication. Please try again."
        );

        submitButton.disabled = false;

        submitButton.querySelector(".button-text").textContent =
            "Log In";
    }

});
