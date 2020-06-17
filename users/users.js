"use strict";
var usersTable = document.querySelector("#usersTable");
var addUserBtn = document.querySelector("#addUserBtn");
var addUserBtnMob = document.querySelector("#addUserBtnMob");
var usersModal = document.querySelector("#usersModal");
var closeUserModal = document.querySelector("#addUser .close-btn");
var editUsersModal = document.querySelector("#editUsersModal");
var closeEditUserModal = document.querySelector("#editUser .close-btn");

modalWin(addUserBtn, closeUserModal, usersModal);
modalWin(addUserBtnMob, closeUserModal, usersModal);
initDropDown("contraSelect");

// Запуск данных таблицы пользователей:

function startUsersTable() {
  sendRequest(`../json/usersData.json`)
    //sendRequest(urlRequest.main, {action: 'desktopTable'})
    .then((result) => {
      var data = JSON.parse(result);
      data = convertData(data);
      initTable("usersTable", data);
      var usersTabletData = {
        area: "usersTableTablet",
        items: data,
        action: "replace",
      };
      var usersMobData = {
        area: "usersTableMob",
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
      initTable("usersTable");
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
      editUsersModal.style.display = "none";
    }
  });

  document.addEventListener("click", function (event) {
    var edit = event.target.matches(".edit");
    if (edit) {
      var editBtn = event.target;
      editUsersModal.style.display = "block";
    }
  },false);

  closeEditUserModal.addEventListener("click", () => {
    editUsersModal.style.display = "none";
  });

  editUsersModal.addEventListener("click", function (event) {
    if (event.target === this) {
      editUsersModal.style.display = "none";
    }
  });
}

//  Определение расцветки стикера статуса доступа в зависсимости от поданных

function accessTableType() {
  var tbody = usersTable.querySelector("tbody");
  var trs = tbody.querySelectorAll("tr");
  var access = tbody.querySelectorAll(".access");
  var usersTableTablet = document.querySelector("#usersTableTablet");
  var usersTableMob = document.querySelector("#usersTableMob");

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
      var headToggle = infoblocks[i].querySelector(".new-toggle.mobHead");
      var headToggleBtn = infoblocks[i].querySelector(
        ".new-toggle-btn.mobHead"
      );

      if (!headToggle.classList.contains("on")) {
        if (checkAccessVal.innerHTML == "частичный") {
          statusIc.classList.add("limited");
          headToggle.classList.add("on");
          headToggleBtn.classList.add("on");
        } else if (checkAccessVal.innerHTML == "полный") {
          statusIc.classList.add("boundless");
          headToggle.classList.add("on");
          headToggleBtn.classList.add("on");
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
