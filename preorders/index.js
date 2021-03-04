'use strict';

// Глобальные переменные:

var preorderId,
    preorderName;

// Ожидаем загрузку итогов корзин и запускаем страницy:

waitCartTotals()
.then(() => {
  definePreorder();
  getPageData('../json/preorders.json')
  // getPageData(urlRequest.main, 'preorder_info',  {type: preorderId})
  .then(result => {
    initPage(result);
    loader.hide();
  });
})

// Инициализация страницы:

function initPage(data = []) {
  data.preorderId = preorderId;
  data.preorderName = preorderName;
  loadData('#main', data);
}

// Определение загружаемого предзаказа:

function definePreorder() {
  var path = location.search ? location.search.slice(1) : undefined,
      curCatalog = cartTotals.find(el => el.id === path);
  if (path && curCatalog) {
    preorderId = path;
    preorderName = curCatalog.title;
  } else {
    location.href = '../404';
  }
}

// Запуск отправки бланка на сервер сразу после выбора файла:

function sendBlank() {
  getEl('#preorder-info input[type="submit"]').click();
}

// Загрузка данных в корзину из файла:

function loadFromBlank(event) {
  event.preventDefault();
  loader.show();
  var form = event.currentTarget,
      inputFile = getEl('input[type="file"]', form),
      formData = new FormData(form);
  sendRequest(urlRequest.main, '???', formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    if (result.error) {
      alerts.show(result.error);
    } else {
      if (result.cart) {
        document.location.href = `../catalogs/?${preorderId}&cart`;
      } else {
        throw new Error('Ошибка.');
      }
    }
  })
  .catch(error => {
    loader.hide();
    inputFile.value = '';
    alerts.show('Произошла ошибка, попробуйте позже.');
  })
}
