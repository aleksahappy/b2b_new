'use strict';
var usersTable = document.querySelector('#usersTable');
var addUserBtn = document.querySelector('#addUserBtn');
var addUserBtnMob = document.querySelector('#addUserBtnMob');
var usersModal = document.querySelector('#usersModal');
var closeUserModal = document.querySelector('#addUser .close-btn');
var editUsersModal = document.querySelector('#editUsersModal');
var closeEditUserModal = document.querySelector('#editUser .close-btn');

modalWin(addUserBtn, closeUserModal, usersModal);
modalWin(addUserBtnMob, closeUserModal, usersModal);
initDropDown('contraSelect');

// Запуск данных таблицы пользователей:

function startUsersTable() {
  sendRequest(`../json/usersData.json`)
  //sendRequest(urlRequest.main, {action: 'desktopTable'})
  .then(result => {
    var data = JSON.parse(result);
    data = convertData(data);
    initTable('usersTable', data);
    var usersTabletData = {
      area: 'usersTableTablet',
      items: data,
      action: 'replace'
    };
    var usersMobData = {
      area: 'usersTableMob',
      items: data,
      action: 'replace'
    };
    fillTemplate(usersTabletData);
    fillTemplate(usersMobData);
    initModals();
    accessTableType();
  })
  .catch(err => {
    console.log(err);
    initTable('usersTable');
  });
}
startUsersTable();


//  Работа модальных окон по клику на любую иконку .user-status .edit

function initModals() {
  var tbody = usersTable.querySelector('tbody');
  var trs = tbody.querySelectorAll('tr');
  var editUserIcs = document.querySelectorAll('.user-status .edit');

  window.addEventListener('keydown', function (event) {
    if(event.key === 'Escape') {
      editUsersModal.style.display = 'none';
    }
});

  document.addEventListener('click', function(event) {
    var edit = event.target.matches('.edit');
    if (edit) {
      var editBtn = event.target;
      editUsersModal.style.display = 'block';
    }
  } ,false);

  closeEditUserModal.addEventListener('click', () => {
    editUsersModal.style.display = 'none';
  });

  editUsersModal.addEventListener('click', function (event) {
      if (event.target === this) {
        editUsersModal.style.display = 'none';
      }
  });
}

//  Определение расцветки стикера статуса доступа в зависсимости от поданных

function accessTableType() {
  var tbody = usersTable.querySelector('tbody');
  var trs = tbody.querySelectorAll('tr');
  var access = tbody.querySelectorAll('.access');

  for (let i = 0; i < access.length; i++) {
    if (access[i].innerHTML === 'частичный') {
      access[i].classList.add('limited');
    } else if (access[i].innerHTML === 'полный') {
      access[i].classList.add('boundless');
    } else if (access[i].innerHTML === 'отключен') {
      access[i].classList.add('denied');
    }

  }

}
