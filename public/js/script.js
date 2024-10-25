// Function to show modal with a message and optional redirect
function showModal(message, redirectUrl = null) {
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    if (modalMessage) {
        modalMessage.textContent = message;
    }
    modal.style.display = 'block';

    if (redirectUrl) {
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 3000);
    }
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// Add event listener to close the modal when the user clicks on <span> (x)
const closeSpan = document.getElementsByClassName('close')[0];
if (closeSpan) {
    closeSpan.addEventListener('click', closeModal);
}

// Close the modal when clicking outside of the modal
window.onclick = function (event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Update your logout functionality in script.js
document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logoutButton');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Clear all auth-related data
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenExpiration');
            localStorage.removeItem('selectedMovieId'); // Clear any selected movie

            // Replace the current history state
            window.history.replaceState(null, '', 'index.html');
            
            // Clear browser history and redirect
            window.location.replace('index.html');
            
            showModal('Successfully logged out. Thank you!');
        });
    }
});


// authentication check
document.addEventListener('DOMContentLoaded', function () {
    const protectedPaths = ['/home.html', '/player.html', '/about.html'];
    const currentPage = window.location.pathname.split('/').pop();

    // Only check for token on protected pages
    if (protectedPaths.includes('/' + currentPage)) {
        const token = localStorage.getItem('authToken');
        const expirationTime = localStorage.getItem('tokenExpiration');

        // Check if the token exists and has not expired
        if (!token || (expirationTime && Date.now() > expirationTime)) {
            console.log('Token is missing or expired, redirecting to login.');
            // Clear all auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenExpiration');
            localStorage.removeItem('selectedMovieId');
            
            // Replace current history state
            window.history.replaceState(null, '', 'index.html');
            
            // Redirect without adding to history
            window.location.replace('login.html');
        }
    }
});

//handle popstate (back/forward button) events
window.addEventListener('popstate', function(event) {
    const protectedPaths = ['/home.html', '/player.html', '/about.html'];
    const currentPath = window.location.pathname;
    
    // Check if trying to access protected page
    if (protectedPaths.some(path => currentPath.includes(path))) {
        const token = localStorage.getItem('authToken');
        const expirationTime = localStorage.getItem('tokenExpiration');
        
        // If no valid token, redirect to login
        if (!token || (expirationTime && Date.now() > expirationTime)) {
            window.location.replace('login.html');
        }
    }
});

//this meta tag to your HTML files to prevent caching of protected pages
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.match(/(home|player|about)\.html/)) {
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', 'Cache-Control');
        meta.setAttribute('content', 'no-cache, no-store, must-revalidate');
        document.head.appendChild(meta);
    }
});



// Login function
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent form from submitting the traditional way

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://filmyadda-srverless.netlify.app/.netlify/functions/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('authToken', data.token); // Store the token
             // Set expiration time for the token (5 hours in milliseconds)
             const expirationTime = Date.now() + (5 * 60 * 60 * 1000);
             localStorage.setItem('tokenExpiration', expirationTime);
            showModal('Login successful! Redirecting to home...', 'home.html');
        } else {
            showModal('Invalid username or password.');
        }
    } catch (error) {
        console.error('Login Error:', error);
        showModal('An error occurred. Please try again later.');
    }
});
}

// Register function
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent form from submitting the traditional way
        const fullname = document.getElementById('fullname').value; // Ensure you have this input in your HTML
        const email = document.getElementById('email').value; // Ensure you have this input in your HTML
        const username = document.getElementById('username').value; // Ensure you have this input in your HTML
        const password = document.getElementById('password').value; // Ensure you have this input in your HTML

    try {
        const response = await fetch('https://filmyadda-srverless.netlify.app/.netlify/functions/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, fullname, email })
        });

        if (response.ok) {
            showModal('Registration successful! Redirecting to login...', 'login.html');
        } else {
            const error = await response.text();
            showModal(`Registration failed: ${error}`);
        }
    } catch (error) {
        console.error('Registration Error:', error);
        showModal('Server error. Please try again later.');
    }
});
}

document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    const closeSpan = document.getElementsByClassName('close')[0];

    // Close the modal when the close button is clicked
    if (closeSpan) {
        closeSpan.onclick = function () {
            modal.style.display = 'none';
        }
    }

    // Close the modal when clicking outside of the modal
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
});

// Function to fetch the movie details from the backend
// Add this function to your existing script.js
function selectMovie(movieId) {
    // Store the selected movie ID in localStorage
    localStorage.setItem('selectedMovieId', movieId);
    
    // Redirect to the player page
    window.location.href = 'player.html';
}

// Function to fetch the movie details from the backend
async function fetchMovieDetails() {
    const movieId = localStorage.getItem('selectedMovieId');
    
    if (!movieId) {
        showModal('No movie selected');
        return;
    }

    try {
        const response = await fetch('https://filmyadda-srverless.netlify.app/.netlify/functions/getVideoDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: parseInt(movieId) }) // Ensure movieId is sent as a number
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Update the video player
        const movieTitle = document.getElementById('movieTitle');
        const videoSource = document.getElementById('videoSource');
        const videoPlayer = document.getElementById('videoPlayer');

        if (movieTitle && data.title) {
            movieTitle.textContent = data.title;
        }

        if (videoSource && videoPlayer && data.source) {
            videoSource.src = data.source;
            videoPlayer.load(); // Reload the video player with new source
        }

    } catch (error) {
        console.error('Error fetching movie details:', error);
        showModal(`Failed to load movie: ${error.message}`);
    }
}
// Call fetchMovie Details only on the player.html page
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('player.html')) {
        fetchMovieDetails(); 
    }
});



// Title bar auto heading
document.addEventListener('DOMContentLoaded', function () {
    var movieTitleElement = document.getElementById('movieTitle');
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                document.title = movieTitleElement.innerText; // Update document title
            }
        });
    });
    observer.observe(movieTitleElement, { childList: true });
});

// Video player functionality
document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('videoPlayer');
    const playPauseButton = document.getElementById('playPauseButton');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const controls = document.querySelector('.controls');
    const fullScreenBtn = document.getElementById('fullScreenBtn');
    const seekBar = document.getElementById('seekBar');
    const volumeControl = document.getElementById('volumeControl');
    let controlsTimeout;

    function showControls() {
        controls.style.visibility = 'visible';
        if (controlsTimeout) {
            clearTimeout(controlsTimeout);
        }
        controlsTimeout = setTimeout(() => {
            controls.style.visibility = 'hidden';
        }, 4000);
    }

    video.addEventListener('play', () => {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
    });

    video.addEventListener('pause', () => {
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
    });

    video.addEventListener('click', () => {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    });

    playPauseButton.addEventListener('click', () => {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    });

    video.addEventListener('mousemove', showControls);
    controls.addEventListener('mousemove', showControls);

    fullScreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            video.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // Update the seek bar as the video plays
    video.addEventListener('timeupdate', () => {
        const percentage = (video.currentTime / video.duration) * 100;
        seekBar.value = percentage || 0;
    });

    // Seek the video when the seek bar value changes
    seekBar.addEventListener('input', () => {
        const seekTime = (seekBar.value / 100) * video.duration;
        video.currentTime = seekTime;
    });

    // Handle volume control
    volumeControl.addEventListener('input', () => {
        video.volume = volumeControl.value / 100; // Set volume as a percentage
    });

    showControls(); // Show controls when the page loads

    // Automatically fetch and play the movie when player.html loads
    if (window.location.pathname.includes('player.html')) {
        fetchMovieDetails();
    }
});