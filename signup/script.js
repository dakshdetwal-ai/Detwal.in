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
// SIGNUP FORM
// ==========================================

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


    // ======================================
    // VALIDATION
    // ======================================

    if (!name || !email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    if (password.length < 8) {
        alert("Password must contain at least 8 characters.");
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

        const { data, error } =
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
        // ERROR
        // ==================================

        if (error) {

            console.error(
                "Supabase signup error:",
                error
            );

            alert(
                error.message ||
                "Unable to create your account."
            );

            submitButton.disabled = false;

            submitButton.textContent =
                "Create Account";

            return;
        }


        // ==================================
        // SUCCESS
        // ==================================

        if (data && data.user) {

            console.log(
                "Account created:",
                data.user
            );


            // Email confirmation enabled
            if (!data.session) {

                alert(
                    "Account created successfully! Please check your email and confirm your account."
                );

                submitButton.disabled = false;

                submitButton.textContent =
                    "Create Account";

                return;
            }


            // Email confirmation disabled
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

        alert(
            "Unable to connect to DETwal authentication. Please try again."
        );

        submitButton.disabled = false;

        submitButton.textContent =
            "Create Account";
    }

});
