'use strict';

// Статусы рекламации:
// 1: "Зарегистрирована"
// 2: "Обрабатывается"
// 3: "Удовлетворена"
// 4: "Не удовлетворена"
// 5: "Исполнена"

// Глобальные переменные:

var fileTypes = {
  'jpg': 'jpg',
  'jpeg': 'jpg',
  'png': 'png',
  'gif': 'jpg',
  'mp4': 'mp4',
  'pdf': 'pdf',
  'doc': 'doc',
  'docx': 'doc',
  'xls': 'xls',
  'xlsx': 'xls',
  'svg': 'svg',
  'html': 'html',
  'ppt': 'ppt',
  'pptx': 'ppt',
  'rar': 'rar',
  'zip': 'zip',
  'al': 'al',
  'other': 'other'
};

var imgTypes = {
  'jpg': 'jpg',
  'jpeg': 'jpg',
  'png': 'jpg',
  'gif': 'jpg'
};

var videoTypes = {
  'avi': 'avi',
  'mp4': 'mp4',
  'mpeg': 'mpeg'
};

// Запуск страницы рекламации:

startReclPage();

function startReclPage() {
  var id = document.location.search.replace('?', '');
  sendRequest(urlRequest.main, 'recl', {recl_id: id})
  // sendRequest(`../json/reclamation.json`)
  .then(result => {
    if (!result) {
      location.href = '/err404.html';
    }
    var data = JSON.parse(result);
    initPage(data);
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
  });
}

// Инициализация страницы:

function initPage(data) {
  convertData(data);
  fillTemplate({
    area: '#main',
    items: data.recl,
    sub: [{area: '.card', items: 'item'}]
  });
  fillFiles(data);
  fillChat(data);
  getEl('#main .card .img-wrap').addEventListener('click', () => openFullImg(null, data.recl.item));
  getEl('#main .card .card-open').addEventListener('click', () => openInfoCard(data.recl.item));
  loader.hide();
}

// Преобразование полученных данных:

function convertData(data) {
  if (!data) {
    return;
  }
  var recl = data.recl,
      files = data.recl_files,
      messages = data.recl_messages;

  // Cтатус рекламации:
  if (recl.status == 3 || recl.status == 5) {
    recl.status_text = 'Удовлетворена';
  } else if (data.status == 4) {
    recl.status_text = 'Не удовлетворена';
  } else {
    recl.status_text = 'Решение';
  }

  // Блокировка/разблокировка листа возврата:
  recl.isReturnList = recl.status_comment == 'Ожидается товар' ? '' : 'disabled';

  // Данные рекламации:
  recl.user_fio = recl.user_lastname + ' ' + recl.user_name + ' ' + recl.user_parentname;
  recl.manager_fio = recl.manager_lastname + ' ' + recl.manager_name + ' ' + recl.manager_parentname;
  recl.recl_descr = brText(recl.recl_descr);

  // Данные товара:
  recl.isFree = recl.item_free_qty > 0 ? '' : 'displayNone';
  recl.isArrive = recl.item_arrive_qty > 0 ? '' : 'displayNone';
  recl.isWarehouse = recl.item_warehouse_qty > 0 ? '' : 'displayNone';
  recl.item = {};
  recl.item.title = recl.item_title;
  recl.item.images = recl.item_img ? [recl.item_img.replace('.jpg', '')] : [];
  addImgInfo(recl.item);
  recl.item.options = recl.item_options;
  addOptionsInfo(recl.item);
  recl.item.desc = recl.item_descr;
  recl.item.isDesc = recl.item_descr ? '' : 'displayNone';

  // Данные о файлах:

  if (files) {
    files.forEach(el => {
      var type = el.file_type.toLowerCase();
      type = fileTypes[type] ? fileTypes[type] : 'other';
      el.file_folder = imgTypes[type] ? 'images' : videoTypes[type] ? 'videos' : 'other';
      el.file_type_add = type == 'txt' ? '.txt' : '';
      el.isFunc = imgTypes[type] ? 'showImgFile(event)' : '';
      el.style = imgTypes[type] ? `background-image: url(https://api.topsports.ru/recl/storage_remote/${recl.recl_code_1c}/images/${el.file_name}.${el.file_type}); background-color: #D3D6D9;` :`background-image: url(img/${type}.svg); background-size: auto`;
      // el.file = imgTypes[type] ?
      //   `<img src=https://api.topsports.ru/recl/storage_remote/${recl.recl_code_1c}/images/${el.file_name}.${el.file_type}"></https:>` :
      //   type == 'mp4' ?
      //   `<video src="http://127.0.0.1:5500/reclamation/storage/${recl.id}/videos/${el.file_name}.${el.file_type}" controls></video>` :
      //   `<img src="img/${type}.svg">`;
    });
  }

  // Данные сообщений чата:
  if (messages) {
    messages.forEach(el => {
      var arr = el.date.split(' '),
          string = arr[1].replace(/(\d+).(\d+).(\d+)/, '$2/$1/$3');
      el.time = arr[0];
      el.date = arr[1];
      el.dateObj = new Date(string + ' ' + arr[0]);
    });
  }
}

// Заполнение галереи файлов:

function fillFiles(data) {
  fillTemplate({
    area: '#files',
    items: data,
    sign: '@',
    sub: [{area: '.img-wrap', items: 'recl_files'}]
  });
  // document.querySelectorAll('#files img').forEach(el => replaceError(el));
  // document.querySelectorAll('#files video').forEach(el => replaceError(el));
}

// Замена изображений и видео с ошибкой загрузки на иконки:

function replaceError(el) {
  // var type = el.src.split('.').pop().toLowerCase();
  // type = fileTypes[type] ? fileTypes[type] : 'txt';
  // checkMedia(el, 'replace', `img/${type}.svg`);
}

// Заполнение чата:

function fillChat(data) {
  if (!data.recl_messages) {
    return;
  }
  var chat = getEl('#chat .body .wrap'),
      chatText = '',
      user,
      dates = [];
  data.recl_messages.forEach(el => {
    user = data.recl.user_fio == el.user ? 'Вы' : el.user;
    if (!dates.find(date => date.title == el.date)) {
      dates.push({
        title: el.date,
        messages: []
      })
    }
    var message = {
      time: el.dateObj.getTime(),
      content:
      `<div class="message">
        <div class="title">${user}:</div>
        <div class="text">${brText(el.message)}</div>
        <div class="time">${el.time}</div>
      </div>`
    };
    var curDate = dates.find(date => date.title == el.date);
    curDate.messages.push(message);
  });
  dates.sort(sortBy('-title', 'date'));
  dates.forEach(date => {
    date.messages.sort(sortBy('time', 'numb'));
    date.content = '';
    date.messages.forEach(el => {
      date.content += el.content;
    });
    var text =
    `<div class="date">
      <div class="pill">${date.title}</div>
      ${date.content}
    </div>`;
    chatText += text;
  });
  chat.innerHTML = chatText;
  chat.scrollTop = chat.scrollHeight;
  // setTimeout(() => chat.scrollTop = chat.scrollHeight, 100);
}

// Запрет загрузки листа возврата:

function getReturnList(event) {
  if (btn.classlist.contains('disabled')) {
    event.preventDefault();
  }
}

// Загрузка документов:

function uploadFiles() {

}


// Отправка сообщений чата:

function sendMessage() {

}

// Отображение загруженных картинок на весь экран:

function showImgFile(event) {
  // event.preventDefault();
}