document.addEventListener('DOMContentLoaded', function() {
  let menu = document.querySelector('#menu-icon');
  let navbar = document.querySelector('.navbar');
  let navLinks = document.querySelectorAll('.navbar a');
  const form = document.querySelector('form');

  // Menu toggle
  if (menu) {
    menu.onclick = () => {
      menu.classList.toggle('bx-x');
      navbar.classList.toggle('open');
    }
  }

  // Navigation handling
  navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const page = this.getAttribute('data-page');
      
      if (!page) return;

      fetch(`/${page === '/' ? '' : page}`)
        .then(response => {
          if (response.status === 403) {
            throw new Error('Access denied');
          }
          return response.text();
        })
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const content = doc.querySelector('#content').innerHTML;
          document.querySelector('#content').innerHTML = content;

          // Update active state
          navLinks.forEach(link => link.classList.remove('active'));
          this.classList.add('active');

          // Update URL without page reload
          history.pushState({}, '', `/#${page === '/' ? '' : page}`);

          // Initialize page features after content is loaded
          initializePageFeatures();
        })
        .catch(error => {
          console.error('Error:', error);
          if (error.message === 'Access denied') {
            alert('Access denied. Admin privileges required.');
            window.location.href = '/';
          }
        });
    });
  });

  // Form validation (only if form exists)
  if (form) {
    form.addEventListener('submit', function(event) {
      const phoneInput = document.getElementById('phone_number');
      const emailInput = document.getElementById('email');
      const ageInput = document.getElementById('age');

      if (emailInput && !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(emailInput.value)) {
        event.preventDefault();
        alert('Please enter a valid email address.');
      }

      if (ageInput && (ageInput.value < 0 || ageInput.value > 120)) {
        event.preventDefault();
        alert('Please enter a valid age between 0 and 120.');
      }
    });
  }

  // Initial call to set up features when page first loads
  initializePageFeatures();

  // Set "Home" link as active by default
  navLinks[0].classList.add('active');

  initializeSearch();

  const scrollTop = document.getElementById("scrollTop");

  // Show/hide scroll-to-top button
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollTop.style.display = "flex";
    } else {
      scrollTop.style.display = "none";
    }
  });

  // Scroll to top when clicked
  scrollTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});

function showNotification(message, type = 'success') {
    const popup = document.getElementById('notification');
    popup.textContent = message;
    popup.className = `popup ${type} show`;

    // Only decrease count when deleting a user
    if (type === 'success' && message === 'User deleted successfully') {
        const countElement = document.querySelector('.container-amount p');
        if (countElement) {
            const currentCount = parseInt(countElement.textContent);
            countElement.textContent = (currentCount - 1).toString();
        }
    }

    setTimeout(() => {
        popup.classList.remove('show');
    }, 2000);
}

function initializePageFeatures() {
  const blocks = document.querySelectorAll(".block");
  const shopNowButton = document.querySelector('.main__scroll');

  // Add click event listener to the "Shop Now" button
  if (shopNowButton) {
    shopNowButton.addEventListener('click', function(event) {
      event.preventDefault();
      const nextSection = document.querySelector('.first-view');
      nextSection.scrollIntoView({
        behavior: 'smooth'
      });
    });
  }

  // Intersection Observer setup
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible");
      }
    });
  }, {
    threshold: 0.3
  });

  blocks.forEach((block) => {
    observer.observe(block);
  });

  // Initialize delete buttons if we're on the dashboard page
  if (document.querySelector('.users-table')) {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            if (confirm('Are you sure you want to delete this user?')) {
                const userId = this.getAttribute('data-id');
                const row = this.closest('tr');
                
                try {
                    const response = await fetch(`/delete/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'same-origin'
                    });

                    if (response.ok) {
                        // Add slide-out animation
                        row.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                        row.style.transform = 'translateX(100%)';
                        row.style.opacity = '0';
                        
                        setTimeout(() => {
                            row.remove();
                            showNotification('User deleted successfully');
                        }, 500);
                    } else {
                        const error = await response.json();
                        showNotification(error.message || 'Failed to delete user', 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showNotification('Error deleting user', 'error');
                }
            }
        });
    });
  }

  // Initialize edit buttons
  const editButtons = document.querySelectorAll('.edit-btn');
  editButtons.forEach(button => {
    button.addEventListener('click', function() {
      const row = this.closest('tr');
      const userData = {
        name: row.cells[0].textContent,
        email: row.cells[1].textContent,
        age: row.cells[2].textContent,
        gender: row.cells[3].textContent,
        address: row.cells[4].textContent,
        phone_number: row.cells[5].textContent
      };
      openEditModal(this.getAttribute('data-id'), userData);
    });
  });

  if (document.querySelector('.stores-slider')) {
    initializeStoreSlider();
  }
}

let currentEditId = null;

function openEditModal(userId, userData) {
    currentEditId = userId;
    const modal = document.getElementById('editModal');
    
    // Populate form fields
    document.getElementById('editName').value = userData.name;
    document.getElementById('editEmail').value = userData.email;
    document.getElementById('editAge').value = userData.age;
    document.getElementById('editGender').value = userData.gender;
    document.getElementById('editAddress').value = userData.address;
    document.getElementById('editPhone').value = userData.phone_number;
    
    modal.classList.add('show');
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('show');
    currentEditId = null;
}

async function saveChanges() {
    if (!currentEditId) return;
    
    const row = document.querySelector(`[data-id="${currentEditId}"]`).closest('tr');
    const userData = {
        name: document.getElementById('editName').value || row.cells[0].textContent,
        email: document.getElementById('editEmail').value || row.cells[1].textContent,
        age: document.getElementById('editAge').value || row.cells[2].textContent,
        gender: document.getElementById('editGender').value || row.cells[3].textContent,
        address: document.getElementById('editAddress').value || row.cells[4].textContent,
        phone_number: document.getElementById('editPhone').value || row.cells[5].textContent
    };

    try {
        const response = await fetch(`/update/${currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            // Update only the changed fields in the table row
            Object.keys(userData).forEach((key, index) => {
                if (userData[key] !== row.cells[index].textContent) {
                    row.cells[index].textContent = userData[key];
                }
            });
            
            showNotification('User updated successfully');
            closeEditModal();
        } else {
            const error = await response.json();
            showNotification(error.message || 'Failed to update user', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error updating user', 'error');
    }
}

function initializeStoreSlider() {
    const track = document.querySelector('.stores-track');
    const prevButton = document.querySelector('.slider-button.prev');
    const nextButton = document.querySelector('.slider-button.next');
    const totalCards = document.querySelectorAll('.store-card').length;
    const visibleCards = 3;
    let currentIndex = 0;

    function updateSliderPosition() {
        const containerWidth = track.parentElement.offsetWidth;
        const cardWidth = (containerWidth - 40) / visibleCards; // Account for gap
        const position = -currentIndex * (cardWidth + 20); // Add gap to movement
        track.style.transform = `translateX(${position}px)`;
        
        // Update button states
        prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
        prevButton.style.cursor = currentIndex === 0 ? 'default' : 'pointer';
        nextButton.style.opacity = currentIndex >= totalCards - visibleCards ? '0.5' : '1';
        nextButton.style.cursor = currentIndex >= totalCards - visibleCards ? 'default' : 'pointer';
    }

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSliderPosition();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex < totalCards - visibleCards) {
            currentIndex++;
            updateSliderPosition();
        }
    });

    // Initial setup
    updateSliderPosition();
    
    // Update on window resize
    window.addEventListener('resize', updateSliderPosition);
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchOverlay = document.getElementById("searchOverlay");
  const searchResults = document.getElementById("searchResults");

  // Function to fetch search results from the server
  async function fetchResults(query) {
      try {
          const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
          const results = await response.json();
          displayResults(results);
      } catch (error) {
          console.error("Error fetching search results:", error);
      }
  }

  // Display the search results
  function displayResults(results) {
      searchResults.innerHTML = ""; // Clear previous results
      if (results.length === 0) {
          searchResults.innerHTML = "<div class='search-result-item'>No results found</div>";
      } else {
          results.forEach(result => {
              const item = document.createElement("div");
              item.className = "search-result-item";
              item.textContent = result.name; // Adjust based on the data structure
              searchResults.appendChild(item);
          });
      }
      searchResults.style.display = "block";
  }

  // Handle input in the search bar
  searchInput.addEventListener("input", (event) => {
      const query = event.target.value.trim();

      if (query) {
          searchOverlay.style.display = "block";
          fetchResults(query);
      } else {
          searchOverlay.style.display = "none";
          searchResults.style.display = "none";
      }
  });

  // Hide overlay and results when clicking outside
  searchOverlay.addEventListener("click", () => {
      searchOverlay.style.display = "none";
      searchResults.style.display = "none";
  });
});

document.addEventListener("DOMContentLoaded", function() {
    const scrollTop = document.getElementById("scrollTop");
    
    // Show button when user scrolls down 300px
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            scrollTop.style.display = "flex";
        } else {
            scrollTop.style.display = "none";
        }
    });

    // Scroll to top when clicked
    scrollTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});
