const Username = document.getElementById("Username");
const Password = document.getElementById("Password");
const ShowPassword = document.getElementById("ShowPassword");
const AdminLoginForm = document.querySelector("form");
const LoginButton = document.getElementById("StaffLogin");

ShowPassword.addEventListener("change", function () {
    Password.type = ShowPassword.checked ? "text" : "password";
});

AdminLoginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = Username.value.trim();
    const password = Password.value;

    if (username === "") {
        AppFeedback.notify("Please enter your username.");
        Username.focus();
        return;
    }

    if (password === "") {
        AppFeedback.notify("Please enter your password.");
        Password.focus();
        return;
    }

    if (!window.StaffAccounts) {
        AppFeedback.error("Staff authentication is unavailable right now.");
        return;
    }

    LoginButton.disabled = true;

    try {
        const staff = await window.StaffAccounts.authenticate(username, password);
        if (staff && staff.removed) {
            AppFeedback.notify("This staff account has been removed. Please contact the administrator.");
            return;
        }

        if (!staff) {
            AppFeedback.notify("Invalid username or password.");
            return;
        }

        window.location.href = "./Admin.html";
    } catch (error) {
        console.error("Unable to authenticate admin staff member:", error);
        AppFeedback.error(error.message || "Admin login could not be completed.");
    } finally {
        LoginButton.disabled = false;
    }
});