const SUPABASE_URL = "https://evnswenvmwhrohyzjrgq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Vfy2VLbqRYB_DOsK13iuqA_9-pk4Q5t";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

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

    const submitButton = signupForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Creating account...";


    try {
        const { data, error } =
            await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });


        if (error) {
            console.error(error);
            alert(error.message);

            submitButton.disabled = false;
            submitButton.textContent = "Create Account";

            return;
        }


        /*
         * Supabase may require email verification.
         * If email verification is enabled, the user
         * needs to verify their email before logging in.
         */

        if (data.user) {
            alert(
                "Account created successfully! Check your email if verification is required."
            );

            window.location.href = "../home/";
        }

    } catch (error) {
        console.error(error);

        alert(
            "Something went wrong. Please try again."
        );

        submitButton.disabled = false;
        submitButton.textContent = "Create Account";
    }
});
