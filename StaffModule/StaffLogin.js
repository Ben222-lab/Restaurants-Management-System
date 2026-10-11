const Username = document.getElementById("Username");
const Password = document.getElementById("Password");
const ShowPassword = document.getElementById("ShowPassword");
const StaffLogin = document.getElementById("StaffLogin");


// Show Password
ShowPassword.addEventListener("change", function () {

    if (ShowPassword.checked) {
        Password.type = "text";
    } else {
        Password.type = "password";
    }

});

StaffLogin.closest("form").addEventListener("submit", async function (event) {
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

    try {
        const staff = await StaffAccounts.authenticate(username, password);
        if (staff) {
            window.location.href = "../StaffModule/staff.html";
            return;
        }
        AppFeedback.notify("Invalid username or password.");
    } catch (error) {
        console.error("Unable to authenticate staff member:", error);
        AppFeedback.error(error.message || "Staff login could not be completed.");
    }
});