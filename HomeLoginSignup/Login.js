const Email = document.getElementById("Email");
const Password = document.getElementById("Password");
const LoginButton = document.getElementById("LoginButton");

LoginButton.addEventListener("click", function(){
    if (Email.value === "") {
        alert("Please enter your email");
        return;
    }

    if (Password.value === ""){
        alert("Please enter your password");
        return;
    }
});