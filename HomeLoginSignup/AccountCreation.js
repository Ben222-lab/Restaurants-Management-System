const FullName = document.getElementById("FullName");
const Username = document.getElementById("Username");
const Email = document.getElementById("Email");
const Password = document.getElementById("Password");
const ConfirmPassword = document.getElementById("ConfirmPassword");
const AccountCreationForm = document.getElementById("account-creation-form");

AccountCreationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = FullName.value.trim();
    const username = Username.value.trim();
    const email = Email.value.trim();
    const password = Password.value;

    if (!name || !username || !email || !password || !ConfirmPassword.value) {
        AppFeedback.warning("Please complete all account fields.");
        return;
    }

    if (!Email.validity.valid) {
        AppFeedback.warning("Enter a valid email address.");
        Email.focus();
        return;
    }

    if (password.length < 8) {
        AppFeedback.warning("Choose a password with at least 8 characters.");
        Password.focus();
        return;
    }

    if (password !== ConfirmPassword.value) {
        AppFeedback.error("The passwords do not match.");
        ConfirmPassword.focus();
        return;
    }

    const submitButton = document.getElementById("CreateAccount");
    submitButton.disabled = true;

    try {
        await CustomerAccounts.create({
            name: name,
            username: username,
            email: email,
            password: password
        });
        window.location.href = "./Login.html?accountCreated=1";
    } catch (error) {
        console.error("Unable to create customer account:", error);
        AppFeedback.error(error.message || "Account creation failed. Please try again.");
    } finally {
        submitButton.disabled = false;
    }
});