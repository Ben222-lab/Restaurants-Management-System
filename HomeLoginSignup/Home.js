const MenuButton = document.querySelector(".Menu-button");
const NavLinks = document.querySelector(".Nav-bar ul");

MenuButton.addEventListener("click", function () {
    NavLinks.classList.toggle("Show");
});