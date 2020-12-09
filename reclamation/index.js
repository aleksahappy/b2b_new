'use strict';

// Статусы рекламации:
// 1: "Зарегистрирована"
// 2: "Обрабатывается"
// 3: "Удовлетворена"
// 4: "Не удовлетворена"
// 5: "Исполнена"

// Глобальные переменные:

var data;

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

var fullImgCarousel = {
  isNav: true,
  navType: 'dot',
  isAnimate: false
};

// Запуск страницы рекламации:

startReclPage();

function startReclPage() {
  var id = document.location.search.replace(/\D/g, '');
  if (!id) {
    location.href = '/err404.html';
  }
  sendRequest(urlRequest.main, 'recl', {recl_id: id})
  // sendRequest(`../json/reclamation.json`)
  .then(result => {
    if (!result) {
      location.href = '/err404.html';
    }
    data = JSON.parse(result);
    initPage();
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
  });
}

// Инициализация страницы:

function initPage() {
  convertData();
  fillTemplate({
    area: '#main',
    items: data.recl,
    sub: [{area: '.card', items: 'item'}]
  });
  checkMedia(getEl('.card img'));
  fillFiles();
  fillChat();
  getEl('#main .card .img-wrap').addEventListener('click', () => openFullImg(null, data.recl.item));
  getEl('#main .card .card-open').addEventListener('click', () => openInfoCard(data.recl.item));
  setInterval(checkNewMessages, 60000); // Проверка чата на наличие новых сообщений раз в минуту (polling)
  // checkNewMessages(); // Проверка чата на наличие новых сообщений (polling)
  loader.hide();
}

// Преобразование полученных данных:

function convertData() {
  if (!data) {
    return;
  }
  data.recl_files = data.recl_files || [];
  data.recl_messages = data.recl_messages || [];

  var recl = data.recl;

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
  recl.item_price = convertPrice(recl.item_price),
  recl.item = {};
  recl.item.title = recl.item_title;
  recl.item.images = recl.item_img ? [recl.item_img.replace('.jpg', '')] : [];
  addImgInfo(recl.item);
  recl.item.options = recl.item_options;
  addOptionsInfo(recl.item);
  recl.item.desc = recl.item_descr;
  recl.item.isDesc = recl.item_descr ? '' : 'displayNone';

  // Данные для открытия изображений на весь экран:
  recl.images_full = [];

  // Данные для галереи файлов и чата:
  convertFilesData();
  convertMessagesData();
}

// Преобразование данных для заполнения галереи файлов:

function convertFilesData() {
  data.recl_files.forEach(el => {
    var type = el.file_type.toLowerCase();
    type = fileTypes[type] ? fileTypes[type] : 'other';
    el.type = type;
    el.file_folder = imgTypes[type] ? 'images' : videoTypes[type] ? 'videos' : 'other';
    el.url = `https://api.topsports.ru/recl/storage_remote/${data.recl.recl_code_1c}/${el.file_folder}/${el.file_name}.${el.file_type}`;
    el.preview_url = imgTypes[type] ? `https://api.topsports.ru/recl/storage_remote/${data.recl.recl_code_1c}/${el.file_folder}/${el.file_name}_250.${el.file_type}` : `img/${type}.svg`;
    el.class = imgTypes[type] ? 'img' : 'ico';
      // `<img src="${el.url}">` :
      // type == 'mp4' ?
      // `<video src="${el.url}" controls></video>` :
      // `<img src="img/${type}.svg">`;
    if (imgTypes[type]) {
      data.recl.images_full.push(el.url);
    }
  });
}

// Преобразование данных для заполнения чата:

function convertMessagesData() {
  var chat = {};
  data.recl_messages.forEach(el => {
    var arr = el.date.split(' '),
        string = arr[1].replace(/(\d+).(\d+).(\d+)/, '$2/$1/$3'),
        time = arr[0],
        date = arr[1];
    if (!chat[date]) {
      chat[date] = {
        date: date,
        items: []
      };
    }
    chat[date].items.push({
      user: data.recl.user_fio == el.user? 'Вы' : el.user,
      text: brText(el.message),
      time: time,
      timestamp: new Date(string + ' ' + arr[0]).getTime()
    });
  });
  chat = sortObjByKey(chat, 'date', -1);
  for (var date in chat) {
    chat[date].items.sort(sortBy('timestamp', 'numb'));
  }
  data.chat = chat;
}

// Заполнение галереи файлов:

function fillFiles(filesData) {
  fillTemplate({
    area: '.files',
    items: filesData || data.recl_files,
    sign: '@',
    method: filesData ? 'afterbegin' : 'inner'
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

function fillChat() {
  var chat = getEl('#chat .wrap');
  fillTemplate({
    area: chat,
    items: data.chat,
    type: 'list',
    sign: '@',
    sub: [{
      area: '.message',
      items: 'items'
    }]
  });
  chat.scrollTop = chat.scrollHeight;
  setTimeout(() => chat.scrollTop = chat.scrollHeight, 100);
}

// Запрет загрузки листа возврата:

function getReturnList(event) {
  if (btn.classlist.contains('disabled')) {
    event.preventDefault();
  }
}

// Загрузка файлов:

function uploadFiles(event) {
  var files = Array.from(event.currentTarget.files);
  files.forEach(file => {
    var fileName = file.name.split('.').slice(0, -1).join('.');
    // if (!getEl(`#files .item[data-name="${fileName}"]`) && file.size <= 500000) {
    if (!getEl(`#files .item[data-name="${fileName}"]`)) {
      var filesData = {
        file_name_view: fileName,
        file_type: file.name.split('.').pop(),
        isLoading: 'loading'
      };
      var type = filesData.file_type.toLowerCase();
      type = fileTypes[type] ? fileTypes[type] : 'other';
      filesData.type = type;

      if (imgTypes[type]) {
        var reader = new FileReader();
        reader.addEventListener('load', event => {
          filesData.preview_url = event.target.result;
          var img = getEl(`#files .item[data-name="${fileName}"] .img`);
          if (img) {
            img.style.backgroundImage = `url(${event.target.result})`;
          }
        });
        if (file) {
          reader.readAsDataURL(file);
          filesData.class = 'img';
        }
      } else {
        filesData.preview_url = `img/${type}.svg`;
        filesData.class = 'ico';
      }
      fillFiles(filesData);
    }
  });
  getEl('#files input[type="submit"]').click();
}

// Отправка файлов на сервер:

function sendFiles(event) {
  event.preventDefault();
  var inputFile = getEl('#files input[type="file"]'),
      files = Array.from(inputFile.files),
      counter = 0,
      errors = {
        repeat: {
          title: 'Файл с таким именем уже существует',
          items: []
        },
        // size: {
        //   title: 'Размер файла превышает 0.5мб:',
        //   items: []
        // },
        server: {
          title: 'Ошибка сервера',
          items: []
        }
      };
  files.forEach(file => {
    var fileName = file.name.split('.').slice(0, -1).join('.');
    // if (!getEl(`#files .item[data-name="${fileName}"]:not(.loading)`) && file.size <= 500000) {
    if (!getEl(`#files .item:not(.loading)[data-name="${fileName}"]`)) {
      var curItem = getEl(`#files .item[data-name="${fileName}"]`);
      sendFileForm(curItem, file)
      .then(result => {
        result = JSON.parse(result);
        data.recl_files = result;
        updateFile(curItem);
        checkComplete();
      })
      .catch(error => {
        removeFile(curItem);
        errors.server.items.push(fileName);
        checkComplete();
      })
    } else {
      removeFile(curItem);
      errors.repeat.items.push(fileName);
      checkComplete();
    }
    // } else if (file.size > 500000) {
    //   errors.size.push(fileName);
    //   checkComplete();
    // }
  });

  function checkComplete() {
    counter += 1;
    if (counter === files.length) {
      inputFile.value = '';
      showErrors(errors);
    }
  }
}

// Отправка формы с файлом на сервер:

function sendFileForm(curItem, file) {
  return new Promise((resolve, reject) => {
    var formData = new FormData();
    formData.append('action', 'upload_file');
    formData.append('recl_id', data.recl.id);
    formData.append('UserFile', file);

    var request = new XMLHttpRequest();
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        var percentComplete = Math.ceil(event.loaded / event.total * 100) + '%';
        getEl('indicator', curItem).style.width = percentComplete;
        getEl('status', curItem).textContent = percentComplete;
      }
    });
    request.addEventListener('error', () => reject(new Error('Ошибка сети')));
    request.addEventListener('load', () => {
      if (request.status === 200) {
        resolve(request.response);
      } else {
        reject(new Error(request.status + ':' + request.statusText));
      }
    });
    request.open('POST', urlRequest.main);
    request.send(data);
  });
}

// Обновление файла в галерее после его загрузки на сервер:

function updateFile(curItem) {
  convertFilesData();
  var curData = data.recl_files.find(el => curItem.dataset.name == el.file_name_view);
  if (curData) {
    curItem.classList.remove('loading');
    curItem.href = curData.url;
    var img = getEl('div', curItem);
    if (imgTypes[curData.type]) {
      img.style.backgroundImage = `url(${curData.preview_url})`;
    } else {
      img.style.backgroundImage = `url(img/${curData.type}.svg)`;
    }
  } else {
    removeFile(curItem);
  }
}

// Удаление файла из галереи при ошибке загрузки:

function removeFile(curItem) {
  curItem.classList.add('error');
  getEl('.progress .status', curItem).textContent = 'Ошибка';
  setTimeout(() => curItem.remove(), 500);
}

// Отображение ошибок загрузки файлов:

function showErrors(errors) {
  var text = '';
  for (var type in errors) {
    if (errors[type].items.length) {
      var list = '';
      errors[type].items.forEach(el => list += `<li>${el}</г>`);
      text += `<div>${errors[type].title}:</div><ul>${list}</ul>`;
    }
  }
  alerts.show(`
  <div style="text-align: left;">
    <div style="text-transform: uppercase;">Не загружены файлы:</div><br>
    ${text}
  </div>`);
}

// Отображение загруженных картинок на весь экран/ предотвращение открытия ссылки незагруженных изображений:

function showFullImg(event) {
  var curData = data.recl_files.find(el => event.currentTarget.dataset.name == el.file_name_view);
  if (curData) {
    if (imgTypes[curData.type]) {
      event.preventDefault();
      var curImg = data.recl.images_full.findIndex(el => el === curData.url);
      openFullImg(event, data.recl, curImg);
    }
  } else {
    event.preventDefault();
  }
}

// Отправка сообщения на сервер:

function sendMessage(event) {
  if (event && event.type === 'keydown') {
    if (event.keyCode !== 13 || event.keyCode === 13 && event.shiftKey) {
      return;
    }
  }
  event.preventDefault();
  var textarea = getEl('#chat textarea'),
      message = textarea.value.trim();
  if (message === '') {
    return;
  }
  var curDate = new Date(),
      hours = (curDate.getHours() < 10) ? '0' + curDate.getHours() : curDate.getHours(),
      minutes = (curDate.getMinutes() < 10) ? '0' + curDate.getMinutes() : curDate.getMinutes(),
      day = (curDate.getDate() < 10) ? '0' + curDate.getDate() : curDate.getDate(),
      month = (curDate.getMonth() < 10) ? '0' + parseInt(curDate.getMonth() + 1) : parseInt(curDate.getMonth() + 1),
      year = curDate.getFullYear(),
      date = hours + ':' + minutes + ' ' + day + '.' + month + '.' + year;

  data.recl_messages.push({
    date: date,
    user: data.recl.user_fio,
    message: brText(message)
  });
  updateChat();

  var formData = new FormData(getEl('#chat form'));
  formData.append('recl_id', data.recl.id);
  textarea.value = '';
  setTextareaHeight(textarea);

  formData.forEach((value, key) => {
    console.log(key, value);
  });

  sendRequest(urlRequest.main, 'send_message', {recl_id: data.recl.id})
  .then(result => {
    result = JSON.parse(result);
    // console.log(result);
    // Снова обновить чат или просто обновить данные?
    data.recl_files = result;
    // updateChat(result);
  })
  .catch(error => {
    // console.log(error);
    alerts.show(`Ошибка сервера.<br>Сообщение "${message}" не было отправлено.<br>Попробуйте позже.`);
    data.recl_messages.pop();
    updateChat();
  })
}

// Обновление сообщений в чате:

function updateChat(result) {
  if (result) {
    data.recl_messages = result;
  }
  convertMessagesData();
  fillChat();
}

// Проверка чата на наличие новых сообщений (polling):

function checkNewMessages() {
  sendRequest(urlRequest.main, '???', {recl_id: data.recl.id})
  .then(result => {
    result = JSON.parse(result);
    // console.log(result);
    if (JSON.stringify(result) !== JSON.stringify(data.recl_files)) {
      updateChat(result);
    }
  })
  .catch(error => {
    // console.log(error);
  })
}

// Проверка чата на наличие новых сообщений (long polling):

// function checkNewMessages() {
//   sendRequest(urlRequest.main, '???', {recl_id: data.recl.id})
//   .then(result => {
//     result = JSON.parse(result);
//     // console.log(result);
//     if (JSON.stringify(result) !== JSON.stringify(data.recl_files)) {
//       updateChat(result);
//     }
//     checkNewMessages();
//   },
//   reject => {
//     // Статус 502 - это таймаут соединения. Возможен, когда соединение ожидало слишком долго и сервер закрыл его.
//     console.log(reject);
//     checkNewMessages();
//   })
//   .catch(error => {
//     // console.log(error);
//     alerts.show('Произошла ошибка, попробуйте позже.');
//   })
// }
