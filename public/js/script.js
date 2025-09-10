document.addEventListener("DOMContentLoaded", function () {
  const allButtons = document.querySelectorAll(".searchBtn");
  const searchBar = document.querySelector(".searchBar");
  const searchInput = document.getElementById("searchInput");
  const searchClose = document.getElementById("searchClose");

  if (allButtons.length && searchBar && searchInput) {
    for (let i = 0; i < allButtons.length; i++) {
      allButtons[i].addEventListener("click", function () {
        searchBar.style.visibility = "visible";
        searchBar.classList.add("open");
        this.setAttribute("aria-expanded", "true");
        searchInput.focus();
      });
    }
  }

  if (searchClose && searchBar) {
    searchClose.addEventListener("click", function () {
      searchBar.style.visibility = "hidden";
      searchBar.classList.remove("open");
      this.setAttribute("aria-expanded", "false");
    });
  }

  const toast = document.getElementById("toast");
  if (toast) {
    const closeBtn = document.getElementById("toastClose");
    const hide = () => {
      toast.classList.add("hide");
      setTimeout(() => toast.remove(), 400);
    };
    setTimeout(hide, 2000); 
    if (closeBtn) closeBtn.addEventListener("click", hide);
  }
});