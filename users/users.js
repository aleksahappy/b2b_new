'use strict';
var usersTable = document.querySelector('#usersTable');
var tbody = usersTable.querySelector('tbody');
var trs = tbody.querySelectorAll('tr');
var addUserBtn = document.querySelector('#addUserBtn');
var addUserBtnMob = document.querySelector('#addUserBtnMob');
var usersModal = document.querySelector('#usersModal');
var closeUserModal = document.querySelector('#addUser .close-btn');
var editUserIcs = document.querySelectorAll('.user-status .edit');
var editUsersModal = document.querySelector('#editUsersModal');
var closeEditUserModal = document.querySelector('#editUser .close-btn');


modalWin(addUserBtn, closeUserModal, usersModal);
modalWin(addUserBtnMob, closeUserModal, usersModal);




console.log(editUserIcs);
function initModals() {
  for (let i = 0; i < editUserIcs.length; i++) {
    editUserIcs[i].addEventListener('click', () => {
      modalWin(editUserIcs[i], closeEditUserModal, editUsersModal);
    });
  }
}
initModals();

//  Проверяет статус в данных и подкрашивает его определенным классом

function checkUserAccess() {
  for (let i = 0; i < trs.length; i++) {
    console.log(trs[i]);
    let rows = trs[i].querySelectorAll('row');
    console.log(rows);
  }
}

initDropDown('contraSelect');
