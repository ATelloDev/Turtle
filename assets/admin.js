import { Api } from './api.js';

function getToken(){ return localStorage.getItem('tc_token') || ''; }
function getUser(){ try{ return JSON.parse(localStorage.getItem('tc_user')||'{}'); }catch{ return {}; } }

async function requireAdmin(){
  const user = getUser();
  if(!user || user.role !== 'admin'){
    window.location.href = './home.html';
  }
}

async function loadUsers(){
  const tbody = document.getElementById('usersBody');
  tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';
  try{
    const { data } = await Api.users.list(getToken());
    tbody.innerHTML = '';
    data.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.Id}</td>
        <td>${u.Username}</td>
        <td>${u.Role}</td>
        <td>
          <button class="btn btn-sm" data-edit='${u.Id}'>Editar</button>
          <button class="btn btn-sm" data-del='${u.Id}'>Eliminar</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }catch(e){
    tbody.innerHTML = `<tr><td colspan="4"><div class="alert">${e.message}</div></td></tr>`;
  }
}

function bindForm(){
  const form = document.getElementById('userForm');
  const idEl = document.getElementById('id');
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');
  const roleEl = document.getElementById('role');

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const id = idEl.value;
    const body = { username: usernameEl.value.trim(), role: roleEl.value };
    if(passwordEl.value) body.password = passwordEl.value;
    try{
      if(id){
        await Api.users.update(getToken(), id, body);
      }else{
        if(!body.password) return alert('Password requerido para crear');
        await Api.users.create(getToken(), body);
      }
      form.reset();
      await loadUsers();
    }catch(err){ alert(err.message); }
  });

  document.getElementById('usersTable').addEventListener('click', async (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const id = btn.getAttribute('data-edit') || btn.getAttribute('data-del');
    if(btn.hasAttribute('data-edit')){
      // Prefill form
      const row = btn.closest('tr').children;
      idEl.value = id;
      usernameEl.value = row[1].textContent.trim();
      roleEl.value = row[2].textContent.trim();
      passwordEl.value = '';
      usernameEl.focus();
    }else if(btn.hasAttribute('data-del')){
      if(confirm('¿Eliminar usuario #' + id + '?')){
        try{ await Api.users.remove(getToken(), id); await loadUsers(); }catch(err){ alert(err.message); }
      }
    }
  });

  document.getElementById('cancel').addEventListener('click', (e)=>{
    e.preventDefault();
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', async ()=>{
  await requireAdmin();
  bindForm();
  loadUsers();
});
