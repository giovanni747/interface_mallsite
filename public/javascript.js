document.addEventListener('DOMContentLoaded', function() {
  let menu = document.querySelector('#menu-icon');
  let navbar = document.querySelector('.navbar');
  let navLinks = document.querySelectorAll('.navbar a');
  const blocks = document.querySelectorAll(".block");
  const shopNowButton = document.querySelector('.main__scroll');

  // Add click event listener to the "Shop Now" button
  shopNowButton.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default link behavior

    // Get the next section element
    const nextSection = document.querySelector('.first-view');

    // Scroll to the next section smoothly
    nextSection.scrollIntoView({
      behavior: 'smooth'
    });
  });

  const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
          if (entry.isIntersecting) {
              entry.target.classList.add("visible");
          } else {
              entry.target.classList.remove("visible");
          }
      });
  }, {
      threshold: 0.3 // Trigger when 40% of the element is visible
  });

  blocks.forEach((block) => {
      observer.observe(block);
  });

  menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navbar.classList.toggle('open');
  }

  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navLinks.forEach(link => link.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Set "Home" link as active by default
  navLinks[0].classList.add('active');
  const decorationBox = document.querySelector('.decoration-box');
  setTimeout(function() {
    decorationBox.classList.add('show');
  }, 100);

  // Add form validation
  const form = document.querySelector('form');
  form.addEventListener('submit', function(event) {
    const phoneInput = document.getElementById('phone_number');
    const emailInput = document.getElementById('email');
    const ageInput = document.getElementById('age');
    // Validate email address format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
      event.preventDefault();
      alert('Please enter a valid email address.');
    }

    // Validate age input
    if (ageInput.value < 0 || ageInput.value > 120) {
      event.preventDefault();
      alert('Please enter a valid age between 0 and 120.');
    }
  });
});