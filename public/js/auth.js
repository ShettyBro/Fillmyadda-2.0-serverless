// Function to verify token for authenticated pages
async function verifyToken() {
    const token = localStorage.getItem('authToken');
  
    if (!token) {
      alert('Access Denied: No Token Provided');
      window.location.href = '/login.html'; // Redirect to login if no token
      return false;
    }
  
    try {
      const response = await fetch('/.netlify/functions/verifyToken', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Token verification failed');
      return true;
    } catch (error) {
      console.error('Token Verification Error:', error);
      localStorage.removeItem('authToken'); // Clear invalid token
      alert('Session expired. Please log in again.');
      window.location.href = '/login.html'; // Redirect to login
      return false;
    }
  }
  
  // Pages where token verification should be skipped
  const publicPages = ['login.html', 'register.html', 'index.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  // Only verify token on protected pages
  if (!publicPages.includes(currentPage)) {
    window.onload = async () => {
      const isAuthenticated = await verifyToken();
      if (isAuthenticated) {
        // Load protected content if token is valid
        loadProtectedContent();
      }
    };
  }
  
  // Function to load protected content
  function loadProtectedContent() {
    document.getElementById('protectedContent').style.display = 'block';
  }
  