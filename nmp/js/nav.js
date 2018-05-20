var containerElement;
var sidenavElement;
var hamburgerElement;
var closeElement;
var overlayElement;

document.addEventListener("DOMContentLoaded", function(event) {
    containerElement = document.getElementsByClassName("container")[0];
    sidenavElement = document.getElementsByClassName("sidenav")[0];
    hamburgerElement = document.getElementsByClassName("hamburger-icon")[0];
    overlayElement = document.getElementsByClassName("overlay")[0];
    closeElement = document.getElementsByClassName("close-btn")[0];
});

function hamburgerStart() {
        sidenavElement.style.width = "200px";
        containerElement.style.marginLeft = "200px";
        hamburgerElement.style.display = "none";
        overlayElement.style.display = "block";
        closeElement.style.display = "block";
    }

function hamburgerClose() {
    sidenavElement.style.width = "0";
    containerElement.style.marginLeft= "0";
    hamburgerElement.style.display = "block";
    overlayElement.style.display = "none";
    closeElement.style.display = "none";
}