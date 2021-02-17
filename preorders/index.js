'use strict';

// Глобальные переменные:

var preorderId,
    preorderName;

// Запуск страницы предзаказов:

function startPage() {
  definePreorder();
  changePageTitle();
  sendRequest(`../json/preorders.json`)
  // sendRequest(urlRequest.main, 'preorder_info',  {type: preorderId})
  .then(result => {
    if (result) {
      result = JSON.parse(result);
    }
    initPage(result);
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
  });
}

// Инициализация страницы:

function initPage(data) {
  data.preorderId = preorderId;
  loadData('#preorder-info', data);
  loader.hide();
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

// Изменение заголовка страницы:

function changePageTitle() {
  var pageTitle = getEl('#page-title');
  if (pageTitle) {
    pageTitle.textContent = preorderName;
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
