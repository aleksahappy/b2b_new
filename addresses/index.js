'use strict';

// Динамическе переменные:

var items,
    prevForm;

// Запуск страницы адресов:

startAddressPage();

function startAddressPage() {
  sendRequest(`../json/addresses.json`)
  //sendRequest(urlRequest.main, {action: 'addresses'})
  .then(result => {
    items = JSON.parse(result);
    initPage();
  })
  .catch(err => {
    console.log(err);
    initPage();
  });
}

// Инициализация страницы:

function initPage() {
  items = items || [];
  fillTemplate({
    area: '#shop',
    items: items,
    sign: '@@',
    sub:[{
      area: '.time-block',
      items: 'time'
    }]
  });
  setProperTooltip();
  initForm('#address');
  loader.hide();
}

// Раскрытие/закрытие блока с информацией о магазине:

function toggleOuterBlock(el) {
  if (event.target.className === 'edit icon') {
    return;
  }
  if (el.classList.contains('outer')) {
    var parentEl = el.parentElement;
    var outerTarget = parentEl.querySelector('.outer-target');
    outerTarget.classList.toggle('displayNone');
  }
}

// Показ/скрытие блока со временем работы магазина:

function toggleInnerBlock(event) {
  var parent = event.target.closest('.toggle-block');
  var targetBlock = parent.querySelector('.target-block');

  if (targetBlock) {
    targetBlock.classList.toggle('displayNone');
  }
}

// Добавление соответствующих подсказок к тексту:

function setProperTooltip() {
  var tooltips = document.querySelectorAll('.indicate');

  for (let i = 0; i < tooltips.length; i++) {
    var toolStatus = tooltips[i].firstElementChild;
    if (toolStatus.className == 'approv') {
      toolStatus.setAttribute('data-tooltip', 'Магазин прошел модерацию');
    } else if (toolStatus.className === 'process') {
      toolStatus.setAttribute('data-tooltip', 'Магазин еще проходит модерацию');
    } else if (toolStatus.className === 'denied') {
      toolStatus.setAttribute('data-tooltip', '</div>Магазин не прошел модерацию,</div> <div>свяжитесь с вашим менеджером</div>');
    }
  }
}

// Открытие всплывающего окна с формой:

function openAddressPopUp(id) {
  var addressPopUp = getEl('#address'),
      title = getEl('.pop-up-title .title', addressPopUp);
  if (prevForm !== id) {
    prevForm = id;
    if (id) {
      title.textContent = 'Изменить адрес';
      var data = items.find(el => el.id == id);
      fillForm('#address-form', data);
    } else {
      title.textContent = 'Новый адрес';
      clearForm('#address');
    }
  }
  openPopUp(addressPopUp);
}
