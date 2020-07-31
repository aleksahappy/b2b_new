"use strict";
var usersTable = document.querySelector("#users-table");
var usersModal = document.querySelector("#new-user-modal");
var editUserModal = document.querySelector("#edit-user-modal");
var closeEditUserModal = document.querySelector("#edit-user-modal .close");


// Запуск данных таблицы пользователей:

function startUsersTable() {
  sendRequest(`../json/users_data.json`)
    //sendRequest(urlRequest.main, {action: 'dashboardTable'})
    .then((result) => {
      var data = JSON.parse(result);
      loader.hide();
      data = convertData(data);
      var settings = {
        data: data,
        head: true,
        cols: [
          {
            title: 'Доступ',
            content: '  <div class="toggle" onclick="toggle(event)"><div class="toggle-in"></div></div>'
          },
          {
            key: 'contr_fio',
            title: 'ФИО',
            content: ''
          },
          {
            key: 'contr_sex',
            title: 'Пол',
            content: ''
          },
          {
            key: 'contr_birth',
            title: 'Дата рождения',
            content: ''
          },
          {
            key: 'contr_tel',
            title: 'Телефон',
            content: ''
          },
          {
            key: 'contr_mail',
            title: 'Email',
            content: ''
          },
          {
            key: 'contr_access',
            title: 'Тип доступа',
            content: '<div class="row"><div class="pill">#contr_access#</div></div>'
          },
          {
            key: 'contr_date',
            title: 'Дата заведения',
            content: ''
          },
          {
            key: 'contr_status',
            title: 'Должность'
          },
          {
            key: '',
            title: 'Редактировать',
            content: '<div class="edit icon"  onclick="openPopUp("#edit-user-modal")"></div>'
          }
        ]
      };
      initTable("#users-table", settings);
      var usersTabletData = {
        area: "#users-table-tablet",
        items: data,
        action: "replace",
      };
      var usersMobData = {
        area: "#users-table-mob",
        items: data,
        action: "replace",
      };
      fillTemplate(usersTabletData);
      fillTemplate(usersMobData);
      accessTableType();
      initForm('#new-user-modal', testNewUser);
      initForm('#edit-user-modal', testNewUser);
      initCalendar('#user-birth');
      initCalendar('#edit-user-birth');
    })
    .catch((err) => {
      console.log(err);
      loader.hide();
      // initTable("#users-table");
    });
}
startUsersTable();


//  Определение расцветки стикера статуса доступа в зависсимости от поданных

function accessTableType() {
  var tbody = usersTable.querySelector("tbody");
  var trs = tbody.querySelectorAll("tr");
  var access = tbody.querySelectorAll(".pill");
  var usersTableTablet = document.querySelector("#users-table-tablet");
  var usersTableMob = document.querySelector("#users-table-mob");

  for (let i = 0; i < access.length; i++) {
    if (access[i].innerHTML === "частичный") {
      access[i].classList.add("access");
      access[i].classList.add("limit");
      var trr = access[i].closest('tr');
      var tggll = trr.querySelector('.toggle');
      tggll.classList.add('checked');

    } else if (access[i].innerHTML === "полный") {
      access[i].classList.add("access");
      access[i].classList.add("full");
      var trr = access[i].closest('tr');
      var tggll = trr.querySelector('.toggle');
      tggll.classList.add('checked');

    } else if (access[i].innerHTML === "отключен") {
      access[i].classList.add("access");
      access[i].classList.add("off");
    }
  }


  //  Вспомогательная функция для подсветки иконок статусов в таблицах в соответствии с данными

  function checkStatusIcon(table) {
    var infoblocks = table.querySelectorAll(".infoblock");

    for (let i = 0; i < infoblocks.length; i++) {
      var statusIc = infoblocks[i].querySelector(".user-status .icon");
      var checkAccessVal = infoblocks[i].querySelector(".check-access-value");
      var headToggle = infoblocks[i].querySelector(".toggle.dark");

      if (!headToggle.classList.contains("on")) {
        if (checkAccessVal.innerHTML == "частичный") {
          statusIc.classList.add("limited");
          headToggle.classList.add("checked");

        } else if (checkAccessVal.innerHTML == "полный") {
          statusIc.classList.add("boundless");
          headToggle.classList.add("checked");

        } else if (checkAccessVal.innerHTML == "отключен") {
          statusIc.classList.add("denied");
        }
      } else {
        statusIc.classList.add("denied");
      }
    }
  }
  checkStatusIcon(usersTableTablet);
  checkStatusIcon(usersTableMob);
}
