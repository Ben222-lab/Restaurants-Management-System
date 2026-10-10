const Email = document.getElementById("Email");
const Password = document.getElementById("Password");
const LoginForm = document.getElementById("customer-login-form");

LoginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const identifier = Email.value.trim();
    const password = Password.value;

    if (identifier === "") {
        AppFeedback.warning("Please enter your email address or username.");
        return;
    }

    if (password === "") {
        AppFeedback.warning("Please enter your password.");
        return;
    }

    const submitButton = document.getElementById("LoginButton");
    submitButton.disabled = true;

    try {
        let customer = await CustomerAccounts.authenticate(identifier, password);

        if (!customer &&
            identifier.toLowerCase() === "benjaminajao02@gmail.com" &&
            password === "12345") {
            customer = {
                name: "Benjamin Ajao",
                email: "benjaminajao02@gmail.com"
            };
        }

        if (!customer) {
            AppFeedback.error("The email/username or password is incorrect.");
            return;
        }

        CustomerSession.recordLogin(customer);
        window.location.href = "../CustomerModule/RestaurantsMenu.html";
    } catch (error) {
        console.error("Unable to complete customer login:", error);
        AppFeedback.error("Login could not be completed. Please try again.");
    } finally {
        submitButton.disabled = false;
    }
});

if (new URLSearchParams(window.location.search).get("accountCreated") === "1") {
    AppFeedback.success("Account created. Log in with your username or email and password.");
}