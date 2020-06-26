"use strict";
var usersTable = document.querySelector("#users-table");
var usersModal = document.querySelector("#new-user-modal");
var editUserModal = document.querySelector("#edit-user-modal");
var closeEditUserModal = document.querySelector("#edit-user-modal .close");


// Запуск данных таблицы пользователей:

function startUsersTable() {
  sendRequest(`../json/usersData.json`)
    //sendRequest(urlRequest.main, {action: 'dashboardTable'})
    .then((result) => {
      var data = JSON.parse(result);
      data = convertData(data);
      initTable("users-table", data);
      var usersTabletData = {
        area: "users-table-tablet",
        items: data,
        action: "replace",
      };
      var usersMobData = {
        area: "users-table-mob",
        items: data,
        action: "replace",
      };
      fillTemplate(usersTabletData);
      fillTemplate(usersMobData);
      initModals();
      accessTableType();
    })
    .catch((err) => {
      console.log(err);
      initTable("users-table");
    });
}
startUsersTable();

//  Работа модальных окон по клику на любую иконку .user-status .edit

function initModals() {
  var tbody = usersTable.querySelector("tbody");
  var trs = tbody.querySelectorAll("tr");
  var editUserIcs = document.querySelectorAll(".user-status .edit");

  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      editUserModal.style.display = "none";
    }
  });

  document.addEventListener("click", function (event) {
    var edit = event.target.matches(".edit");
    if (edit) {
      var editBtn = event.target;
      editUserModal.style.display = "flex";
      editUserModal.style.opacity = "1";
      editUserModal.style.visibility = "visible";
    }
  },false);

  closeEditUserModal.addEventListener("click", () => {
    editUserModal.style.display = "none";
  });

  editUserModal.addEventListener("click", function (event) {
    if (event.target === this) {
      editUserModal.style.display = "none";
    }
  });
}

//  Определение расцветки стикера статуса доступа в зависсимости от поданных

function accessTableType() {
  var tbody = usersTable.querySelector("tbody");
  var trs = tbody.querySelectorAll("tr");
  var access = tbody.querySelectorAll(".access");
  var usersTableTablet = document.querySelector("#users-table-tablet");
  var usersTableMob = document.querySelector("#users-table-mob");

  for (let i = 0; i < access.length; i++) {
    if (access[i].innerHTML === "частичный") {
      access[i].classList.add("limited");
    } else if (access[i].innerHTML === "полный") {
      access[i].classList.add("boundless");
    } else if (access[i].innerHTML === "отключен") {
      access[i].classList.add("denied");
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

//
