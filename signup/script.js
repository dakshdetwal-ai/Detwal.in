const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    // Check password match
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Basic password validation
    if (password.length < 8) {
        alert("Password must contain at least 8 characters.");
        return;
    }

    // Temporary demo account
    // Real account creation will be connected to the Python backend later.
    const user = {
        name: name,
        email: email
    };

    localStorage.setItem("detwal_user", JSON.stringify(user));

    alert("Account created successfully!");

    window.location.href = "../home/";
});
