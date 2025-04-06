const popupForm = document.getElementById('popupForm');
const mainContent = document.getElementById('mainContent');
const submitBtn = document.getElementById('submitBtn');
const addMoreBtn = document.getElementById('addMoreBtn');
const userTableBody = document.querySelector('#userTable tbody');

let users = [];

function showPopup() {
  popupForm.style.display = 'flex';
  mainContent.style.display = 'none';
}

function hidePopup() {
  popupForm.style.display = 'none';
  mainContent.style.display = 'flex';
}

function clearForm() {
  document.getElementById('name').value = '';
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
}

function updateTable() {
  userTableBody.innerHTML = '';
  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${user.name}</td><td>${user.email}</td>`;
    userTableBody.appendChild(row);
  });
}


window.onload = showPopup;


submitBtn.onclick = () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
  
    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }
  
   
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/submit", true); 
    xhr.setRequestHeader("Content-Type", "application/json");
  
    xhr.onload = function () {
      
      users.push({ name, email, password });
      clearForm();
      updateTable();
      hidePopup();
    };
  
    const data = JSON.stringify({ name, email, password });
    xhr.send(data);
  };
  
addMoreBtn.onclick = showPopup;
