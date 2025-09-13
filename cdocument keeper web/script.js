
    // 📌 1. Alert on Category Buttons Click
    document.querySelectorAll('.category-card button').forEach(btn => {
        btn.addEventListener('click', () => {
            alert(`You clicked "${btn.innerText}"`);
        });
    });

    // 📌 2. Show Selected File Names in Alerts
    const cameraInput = document.getElementById('camera-input');
    const fileInput = document.getElementById('file-input');

    cameraInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            alert(`Camera file selected: ${e.target.files[0].name}`);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            alert(`File selected: ${e.target.files[0].name}`);
        }
    });

    // 📌 3. Toggle Password Visibility
    document.querySelectorAll('input[type="password"]').forEach(passwordField => {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.textContent = 'Show';
        toggleBtn.style.marginLeft = '10px';
        toggleBtn.style.padding = '5px';
        toggleBtn.style.fontSize = '0.9rem';
        toggleBtn.style.cursor = 'pointer';

        toggleBtn.addEventListener('click', () => {
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                toggleBtn.textContent = 'Hide';
            } else {
                passwordField.type = 'password';
                toggleBtn.textContent = 'Show';
            }
        });

        passwordField.parentNode.insertBefore(toggleBtn, passwordField.nextSibling);
    });
