// frontend/script.js

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:5000'; // The base URL for our backend

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const allUploadForms = document.querySelectorAll('.upload-form');
  const logoutBtn = document.getElementById('logout-btn');

  // --- Toast Notification Function ---
  function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // --- Section Navigation ---
  window.showSection = async (sectionId) => {
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    const activeSection = document.getElementById(`${sectionId}-section`);
    if (activeSection) activeSection.classList.add('active');

    // If the section is a document category, fetch its documents
    const categories = ['bills', 'certificates', 'photos', 'warranties', 'insurance', 'others'];
    if (categories.includes(sectionId)) {
      await fetchDocuments(sectionId);
    }
  };

  // --- NEW: Fetch Documents from Backend ---
  async function fetchDocuments(category) {
    const token = localStorage.getItem('token');
    if (!token) return;

    const documentList = document.getElementById(`${category}-list`);
    if (!documentList) return;

    // Clear the current list but keep the H2 title
    const h2 = documentList.querySelector('h2');
    documentList.innerHTML = '';
    documentList.appendChild(h2);

    try {
      const res = await fetch(`${API_URL}/api/documents/${category}`, {
        method: 'GET',
        headers: { 'x-auth-token': token },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch documents');
      }

      const documents = await res.json();
      documents.forEach(doc => createDocItem(doc, documentList));
    } catch (err) {
      showToast(err.message || 'Could not fetch documents', 'error');
    }
  }
  
  // --- NEW: Create a single document item in the list ---
  function createDocItem(doc, container) {
      const newItem = document.createElement('div');
      newItem.className = 'list-item';
      const uploadDate = new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      
      // Check if the file is an image
      const isImage = /\.(jpg|jpeg|png|gif)$/i.test(doc.filePath);
      const thumbnailUrl = isImage ? `${API_URL}/${doc.filePath}` : 'https://via.placeholder.com/150/0072ff/FFFFFF?Text=FILE';

      newItem.innerHTML = `
        <div class="list-item-content">
          <img src="${thumbnailUrl}" alt="doc thumbnail" class="doc-thumbnail" />
          <div class="list-item-meta">
            <h4>${doc.title}</h4>
            <p>Uploaded: ${uploadDate}</p>
          </div>
        </div>
        <div class="list-item-actions">
          <a href="${API_URL}/${doc.filePath}" target="_blank" class="action-btn" title="View">👁️</a>
          <button class="action-btn delete-btn" title="Delete">🗑️</button>
        </div>
      `;
      container.appendChild(newItem);

      // Add delete functionality
      newItem.querySelector('.delete-btn').addEventListener('click', async () => {
          if (confirm('Are you sure you want to delete this document?')) {
              await deleteDocument(doc._id, newItem);
          }
      });
  }

  // --- NEW: Delete a Document ---
  async function deleteDocument(docId, elementToRemove) {
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_URL}/api/documents/${docId}`, {
              method: 'DELETE',
              headers: { 'x-auth-token': token },
          });

          if (!res.ok) throw new Error('Failed to delete');
          
          elementToRemove.remove();
          showToast('Document deleted successfully.');
      } catch (err) {
          showToast(err.message || 'Could not delete document', 'error');
      }
  }

  // --- UPDATED: User Signup ---
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(signupForm);
      const data = Object.fromEntries(formData.entries());

      if (data.password !== data.confirm_password) {
        return showToast('Passwords do not match', 'error');
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.full_name, email: data.email, password: data.password }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.msg || 'Registration failed');
        
        showToast('Account created! Please log in.');
        showSection('login');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
  
  // --- UPDATED: User Login ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.msg || 'Login failed');
        
        localStorage.setItem('token', result.token);
        showToast('Login successful!');
        showSection('dashboard');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // --- UPDATED: Document Upload ---
  allUploadForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      if (!token) return showToast('You must be logged in', 'error');

      const formData = new FormData(form);
      const fileInput = form.querySelector('input[type="file"]');
      
      // Use the correct file input name from middleware
      formData.append('document', fileInput.files[0]);

      try {
        const res = await fetch(`${API_URL}/api/documents`, {
          method: 'POST',
          headers: { 'x-auth-token': token },
          body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.msg || 'Upload failed');
        }

        showToast('Document uploaded successfully!');
        form.reset();
        await fetchDocuments(form.dataset.category); // Refresh the list
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });
  
  // --- UPDATED: Logout ---
  if(logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token'); // Clear the token
        showToast('You have been logged out.');
        showSection('login');
    });
  }

  // --- Initial Page Load ---
  // Check if a user is already logged in
  const token = localStorage.getItem('token');
  if (token) {
    showSection('dashboard');
  } else {
    showSection('login');
  }
});