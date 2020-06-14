'use strict';
var usersTable = document.querySelector('#usersTable');
var tbody = usersTable.querySelector('tbody');
var trs = tbody.querySelectorAll('tr');

//  Проверяет статус в данных и подкрашивает его определенным классом

function checkUserAccess() {
  for (let i = 0; i < trs.length; i++) {
    console.log(trs[i]);
    let rows = trs[i].querySelectorAll('row');
    console.log(rows);
  }
}
