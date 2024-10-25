// token-verification.js
document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('authToken');
  const expirationTime = localStorage.getItem('tokenExpiration');

  if (!token || (expirationTime && Date.now() > expirationTime)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiration');
      window.location.href = 'login.html';
  }
});