document.addEventListener("DOMContentLoaded", function () {
  var coll = document.getElementsByClassName("collapsible");
  for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  }
  const hamburger = document.getElementById('hamburger');
  const mobileSidebar = document.getElementById('mobileSidebar');
  const closeSidebar = document.getElementById('closeSidebar');

  hamburger.addEventListener('click', () => {
    mobileSidebar.classList.add('active');
  });

  closeSidebar.addEventListener('click', () => {
    mobileSidebar.classList.remove('active');
  });
});