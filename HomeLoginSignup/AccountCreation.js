const FullName = document.getElementById("FullName");
const Username = document.getElementById("Username");
const Email = document.getElementById("Email");
const Password = document.getElementById("Password");
const ConfirmPassword = document.getElementById("ConfirmPassword");
const CreateAccount = document.getElementById("CreateAccount");

CreateAccount.addEventListener("click", function () {

    if (FullName.value === "") {
        alert("Please enter your full name");
        return;
    }

    if (Username.value === ""){
        alert("Enter your username");
        return;
    }

    if (Email.value === ""){
        alert("Enter your email");
        return;
    }

    if (!Email.value.includes("@")){
        alert("Please enter a valid email");
        return;
    }

    if (Password.value === ""){
        alert("Enter your passsword");
        return;
    }

    if (ConfirmPassword.value === ""){
        alert("Please confirm your password");
        return;
    }

    if (Password.value !== ConfirmPassword.value){
        alert("Password does not match");
        return;
    }
});