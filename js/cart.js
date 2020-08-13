'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Динамически изменяемые переменные:

var cartData = {},
    cartTimer = null,
    cartTimeout = 1000,
    cartChanges = {};
cartChanges[cartId] = {};

//=====================================================================================================
// Запросы на сервер:
//=====================================================================================================

// Отправка данных корзины на сервер (только изменившихся данных):

function cartSentServer() {
  clearTimeout(cartTimer);
  cartTimer = setTimeout(function () {
    console.log(JSON.stringify(cartChanges));
    sendRequest(urlRequest.main, {action: 'set_cart', data: cartChanges})
      .then(response => {
        cartChanges[cartId] = {};
        console.log(response);
      })
      .catch(err => {
        console.log(err);
        // cartSentServer();
      })
  }, cartTimeout);
}

// Отправка данных корзины на сервер если при закрытии страницы остались неотправленные данные (только изменившихся данных):

window.addEventListener('unload', () => {
  if(!isEmptyObj(cartChanges[cartId])) {
    var data = {
      action: 'set_cart',
      data: cartChanges
    };
    navigator.sendBeacon(urlRequest.main, JSON.stringify(data));
  }
}, false);

// Отправка данных о заказе на сервер:

function sendOrder(formData) {
  var idList = getIdList('cart', false);
  if (!idList) {
    return;
  }
  var cartInfo = {};
  cartInfo[cartId] = {};
  idList.forEach(id => {
    cartInfo[cartId]['id_' + id] = cart['id_' + id];
  });
  formData.cart_name = cartId;
  var data = {
    info: formData,
    cart: cartInfo
  };
  console.log(data);

  sendRequest(urlRequest.main, {action: 'send_order', data: data})
  .then(result => {
    console.log(result);
    if (result) {
      var orderId = JSON.parse(result);
      if (orderId.length !== idList.length) {
        alerts.show('Были отправлены не все позиции из заказа.');
      }
      deleteFromCart(orderId);
      document.location.href = '../orders';
    }
  })
  .catch(error => {
    console.log(error);
    alerts.show('Заказ не был отправлен. Попробуйте еще раз.');
  })
}

//=====================================================================================================
// Работа с данными корзины:
//=====================================================================================================

// Обновление корзины при возвращении на страницу:

function updateCart() {
  getCart()
  .then(result => {
    if (result === 'cart') {
      fillOrderForm();
      createCartData()
      .then(result => {
        if (location.search === '?cart') {
          createCart();
          if (getComputedStyle(getEl('#order-form')).display === 'none') {
            showActualCart();
          }
        } else {
          var cards;
          if (view === 'list') {
            cards = document.querySelectorAll('.big-card');
          } else if (view === 'blocks') {
            cards = document.querySelectorAll('.min-card');
          } else if (view === 'product') {
            cards = document.querySelectorAll('.product-card');
          }
          cards.forEach(card => checkCart(card));
        }
      });
    } else {
      fillOrderForm();
    }
  }, reject => console.log(reject))
}

// Создание данных для рендеринга корзины:

function createCartData() {
  return new Promise((resolve, reject) => {
    getMissingItems()
    .then(result => {
      for (var id in cart) {
        var qty = cart[id].qty
        if (qty) {
          saveInCartData(id, qty);
        }
      }
      resolve();
    })
  });
}

// Получение недостающих items для рендеринга корзины:

function getMissingItems() {
  return new Promise((resolve, reject) => {
    var data = [];
    for (var key in cart) {
      if (!cartItems[key]) {
        data.push(cart[key].id);
      }
    }
    if (data.length) {
      data = data.join(',');
      getItems(data)
      .then(result => {
        for (var key in result.items) {
          console.log(result.items[key]);
          convertItem(result.items[key]);
        }
        resolve();
      }, reject => resolve())
    } else {
      resolve();
    }
  });
}

// Создание данных строки корзины:

function createCartItemData(id, qty, status = '') {
  if (!cartItems[id]) {
    return;
  }
  var item = Object.assign(cartItems[id]);
  item.status = status;
  if (status === 'bonus') {
    item.price_cur = 'Подарок';
  }
  if (item.total_qty > 0) {
    item.qty = qty > item.total_qty ? item.total_qty : qty;
  } else {
    item.qty = qty;
    item.price_cur = 0;
  }
  return item;
}

// Сохранение в корзину с отправкой на сервер только изменившихся данных:

function saveInCart(id, qty) {
  id = 'id_' + id;
  if ((!qty && !cart[id]) || (cart[id] && cart[id].qty == qty)) {
    return;
  }
  if (!cart[id]) {
    cart[id] = {};
  }
  cart[id].id = id.replace('id_', '');
  cart[id].qty = qty;
  cart[id].cartId = cartId;
  cart[id].actionId = cartItems[id].action_id;
  cart[id].actionName = cartItems[id].actiontitle || 'Склад';

  cartChanges[cartId][id] = cart[id];
  cartSentServer();

  if (!qty) {
    delete cart[id];
    deleteFromCartData(id);
  } else {
    saveInCartData(id, qty);
  }
  saveCartTotals();
}

// Удаление данных из корзины:

function deleteFromCart(idList) {
  idList.forEach(id => {
    delete cart['id_' + id];
  });
  saveCartTotals();
}

// Сохранение в данные для ренедеринга корзины:

function saveInCartData(id, qty) {
  var item = createCartItemData(id, qty);
  if (!item) {
    return;
  }
  var action = item.action_name;
  if (!cartData[action]) {
    cartData[action] = {};
    cartData[action].action_name = action;
    cartData[action].type = item.action === 'Нет в наличии' ? 'sold' : '';
    cartData[action].items = {};
  }
  if (!cartData[action].items[id]) {
    cartData[action].items[id] = item;
  }
}

// Удаление из данных для ренедеринга корзины:

function deleteFromCartData(id) {
  var action = cartItems[id].action_name;
  if (!action) {
    return;
  }
  delete cartData[action][id];
  if (isEmptyObj(cartData[action])) {
    delete cartData[action];
  }
}

// Сохранение данных об итогах корзины:

function saveCartTotals() {
  var curTotal = cartTotals.find(el => el.id === cartId);
  if (!curTotal) {
    return;
  }
  var totals = countFromCart();
  curTotal.qty = totals.qty;
  curTotal.sum = totals.sum;
  changeCartInHeader(totals);
}

//=====================================================================================================
// Подсчет корзины:
//=====================================================================================================

// Подсчет по корзине (всей корзины целиком или только выбранных элементов):

function countFromCart(idList = undefined, totals = true) {
  var qty = 0,
      sum = 0;

  if (totals) {
    var sumOpt = 0,
        sumRetail = 0,
        orderSum = 0,
        sumDiscount = 0,
        percentDiscount = 0;
  } else {
    var bonusQty = 0,
        bonusId = 0;
  }

  if (!isEmptyObj(cart)) {
    var curItem, curQty;
    if (idList) {
      idList.forEach(id => {
        countTotals('id_' + id, cart['id_' + id]);
      });
    } else {
      for (var id in cart) {
        countTotals(id, cart[id]);
      }
    }
  }

  function countTotals(id, el) {
    if (!el) {
      return;
    }
    curItem = cartItems[id];
    if (!curItem || curItem.total_qty == 0) {
      qty += el.qty;
      return;
    }
    curQty = el.qty > curItem.total_qty ? curItem.total_qty : el.qty;
    qty += curQty;

    if (totals) {
      sumOpt += curQty * curItem.price_cur1;
      sumRetail += curQty * curItem.price_user1;
    }

    var discount = checkDiscount(el.id, qty, curItem);
    if (!discount || !discount.sum) {
      sum += curQty * curItem.price_cur1;
    }
    if (discount) {
      if (discount.sum) {
        sum += discount.sum;
      }
      if (!totals && discount.bonusQty >= 0) {
        bonusQty += discount.bonusQty;
        bonusId = discount.bonusId;
      }
    } else if (totals && window.actions && window.actions[cartId]) {
      orderSum += curQty * curItem.price_user1;
    }
  }

  if (totals && orderSum > 0) {
    discount = sumLessProc(orderSum);
    sumDiscount = discount.sum;
    percentDiscount = discount.percent;
  }

  var result = {
    qty: qty,
    sum: sum
  };
  if (totals) {
    result.sumRetail = sumRetail;
    result.sumDiscount = sumDiscount;
    result.percentDiscount = percentDiscount;
  } else {
    result.bonusQty = bonusQty;
    result.bonusId = bonusId;
  }
  return result;
}

//=====================================================================================================
// Подсчет скидок:          !!! ДОРАБОТАТЬ actions, а затем доработать подсчет скидок
//=====================================================================================================

// Проверка скидки на артикул:

function checkDiscount(id, qty, curItem) {
  return null;
  if (!curItem.action_id) {
    return null;
  }
  var action = actions[id],
      price = curItem.price_cur1,
      retailPrice = curItem.price_user1;
  if (action.type) {
    switch (action.type) {
      case 'numplusnum':
        return numPlusNum(action, qty, price);
        break;
      case 'numplusart':
        return numPlusArt(action, qty);
        break;
      case 'numminusproc':
        return numMinusProc(action, qty, price, retailPrice);
        break;
      case 'numkorobkaskidka':
        return numKorobka();
        break;
      case 'numupakovka':
        return numUpakovka();
        break;
    }
  } else {
    return null;
  }
}

// Расчет скидки "покупаешь определенное кол-во - из него определенное кол-во в подарок":

function numPlusNum(action, qty, price) {
  return {sum: (qty - findBonus(action, qty)) * price};
}

// Расчет скидки "покупаешь определенное кол-во - определенное кол-во другого артикула в подарок":

function numPlusArt(action, qty) {
  return {
    bonusQty: findBonus(action, qty),
    bonusId: action.bonus
  }
}

// Расчет количества бонусов:

function findBonus(action, qty) {
  return Math.floor(qty / action.condition) * action.profit;
}

// Расчет скидки "покупаешь определенное кол-во - скидка в % от РРЦ":

function numMinusProc(action, qty, price, retailPrice) {
  var rest = qty % action.condition;
  return {sum: (qty - rest) * (retailPrice - retailPrice * action.profit / 100) + (rest * price)};
}

// Расчет скидки типа "скидка при покупке коробки":

function numKorobka(params) {
}

// Расчет скидки типа "скидка при покупке упаковки":

function numUpakovka(params) {
}

// Расчет скидки "итоговая сумма заказа минус %":

function sumLessProc(sum) {
  var discount = discounts.find(item => !item.diart && checkCondition(item.dcondition));
  if (!discount) {
    return undefined;
  }
  var current;
  discount.dnv.forEach((item, index) => {
    if (sum >= item) {
      current = index;
    }
  });
  if (current >= 0) {
    var result = {};
    result.sum = sum * discount.dnvex[current] / 100;
    result.percent = discount.dnvex[current];
    return result;
  } else {
    return null;
  }
}

//=====================================================================================================
// Изменение данных о количестве в шапке сайта и заголовке страницы:
//=====================================================================================================

// Изменение информации о корзине в шапке сайта:

function changeCartInHeader(totals) {
  var qty = totals.qty,
      sum = totals.sum;
  fillCartInHeader(qty, sum, 'cart');
  fillCartInHeader(qty, sum, 'catalog');
  changeCartName(qty);
}

// Заполнение конкретной корзины в шапке сайта данными:

function fillCartInHeader(qty, sum, type) {
  var area = type === 'cart' ? getEl('#header-cart') : getEl('#catalogs');
  if (!area) {
    return;
  }
  var curCart = getEl(`.cart-${cartId}`, area),
      cartQty = getEl('.qty', curCart),
      cartSum = getEl('.sum span', curCart);
  if (cartSum) {
    cartSum.textContent = sum.toLocaleString('ru-RU');
  }
  if (website === 'skipper') {
    cartQty.textContent = qty;
  } else {
    if (qty > 0) {
      if (qty > 99) {
        cartQty.textContent = type === 'cart' ? '99' : '99+';
      } else {
        cartQty.textContent = qty;
      }
      cartQty.classList.add('full');
    } else {
      cartQty.textContent = qty;
      cartQty.classList.remove('full');
    }
    if (type === 'cart') {
      var sum = 0;
      cartTotals.forEach(el => {
        sum += el.sum;
      });
      getEl('.sum span', area).textContent = sum.toLocaleString('ru-RU');
    }
  }
}

// Добавление информации о корзине в заголовок страницы:

function changeCartName(qty) {
  var cartName = getEl('#cart-name');
  if (cartName) {
    if (!qty) {
      var curTotal = cartTotals.find(el => el.id === cartId);
      qty = curTotal ? curTotal.qty : 0;
    };
    if (qty == 0) {
      cartName.textContent = ': пуста';
    } else {
      cartName.textContent = ': ' + getEl('.topmenu-item.active').textContent + ' - ' + qty + ' ' + declOfNum(qty, ['товар', 'товара', 'товаров']);
    }
  }
}

//=====================================================================================================
// Изменение данных о количестве в карточках товара и корзине:
//=====================================================================================================

// Получение списка id товаров, выбранных в корзине:

function getIdList(area, isAll = true) {
  var list;
  if (area === 'cart') {
    if (isAll) {
      list = getEl('#cart-list').querySelectorAll('.cart-row.checked:not(.bonus)');
    } else {
      list = getEl('#cart-list').querySelectorAll(':not(.sold) .cart-row.checked:not(.bonus)');
    }
  } else {
    list = area.querySelectorAll('.choiced-qty');
  }
  return Array.from(list).map(el => el.dataset.id);
}

// Проверка наличия товара в корзине и отображение в карточке товара (степпере/кружке):

function checkCart(card) {
  if (!isCart) {
    return;
  }
  if (card.classList.contains('min-card')) {
    var cartInfo = getEl('.cart', card);
    if (cartInfo) {
      var curProduct = curItems.find(item => item.object_id == card.dataset.id),
          sizeInfo = curProduct.sizes,
          totalQty = 0;
      for (var el in sizeInfo) {
        totalQty += getQty(sizeInfo[el].object_id);
      }
      var qty = getEl('.qty', cartInfo);
      if (totalQty > 0) {
        if (totalQty > 99) {
          qty.textContent = '99';
        } else {
          qty.textContent = totalQty;
        }
        showElement(cartInfo);
      } else {
        hideElement(cartInfo);
      }
    }
  } else {
    var input, qty;
    card.querySelectorAll('.card-size').forEach(size => {
      input = getEl('.choiced-qty', size);
      qty = getQty(input.dataset.id);
      input.value = qty;
      input.dataset.value = qty;
      changeColors(getEl('.qty', size), qty);
      changeCard(card);
    });
  }
}

// Получение даннных о количестве товара из корзины:

function getQty(id) {
  var id = 'id_' + id,
      qty, totalQty;
  if (cart[id]) {
    qty = parseInt(cart[id].qty, 10);
    totalQty = parseInt(cartItems[id].total_qty, 10);
    if (totalQty > 0) {
      return qty > totalQty ? totalQty : qty;
    } else {
      return qty;
    }
  } else {
    return 0;
  }
}

// Изменение выбранного количества степпером:

function changeCart(event, id) {
  var curEl = event.currentTarget.closest('.manage'),
      totalQty = cartItems['id_' + id].total_qty,
      qty = changeQty(event, totalQty);
  saveInCart(id, qty);
  if (curEl.classList.contains('card')) {
    changeCard(curEl);
    if (curEl.classList.contains('full-card')) {
      checkCart(getEl(`#gallery .card[data-id="${curEl.dataset.id}"]`));
    }
  } else {
    changeCartRow(curEl);
    changeCheckout();
  }
}

// Изменение информации в карточке товара:

function changeCard(card) {
  var selectInfo = getEl('.select-info', card),
      bonusRow = getEl('.bonus', selectInfo),
      idList = getIdList(card),
      totals = countFromCart(idList, false);

  if (bonusRow && totals.bonusQty) {
    var bonusItem = cartItems[totals.bonusId];
    if (bonusItem) {
      getEl('.bonus-qty span', bonusRow).textContent = totals.bonusQty;
      getEl('.bonus-img', bonusRow).src = bonusItem.image;
      checkImg(bonusRow);
      showElement(bonusRow, 'flex');
    }
  } else {
    hideElement(bonusRow);
  }

  if (totals.qty > 0) {
    getEl('.select-qty span', card).textContent = totals.qty;
    getEl('.select-sum span', card).textContent = totals.sum.toLocaleString('ru-RU');
    selectInfo.style.visibility = 'visible';
  } else {
    selectInfo.style.visibility = 'hidden';
  }
}

// Изменение информации в строке корзины:

function changeCartRow(row) {
  if (row.closest('.sold') || row.classList.contains('bonus')) {
    return;
  }
  var input = getEl('.choiced-qty', row),
      id = input.dataset.id,
      totals = countFromCart([id], false);

  getEl('.sum span', row).textContent = totals.sum.toLocaleString('ru-RU');
  changeCopyCartRow(id, parseInt(input.value ,10), totals.sum);

  if (totals.bonusId) {
    var bonusRow = getEl(`.cart-row.bonus[data-parent-id="${id}"]`);
    if (totals.bonusQty > 0) {
      var qty = totals.bonusQty;
      if (bonusRow) {
        getEl('.qty .bonus span', bonusRow).textContent = qty;
      } else {
        createCartRow('id_' + bonusId, qty, row, 'bonus');
        bonusRow = row.nextElementSibling;
        checkImg(bonusRow);
        bonusRow.dataset.parentId = id;
        if (!row.classList.contains('checked')) {
          bonusRow.classList.remove('checked');
        }
      }
    } else {
      if (bonusRow) {
        getEl('#cart-rows').removeChild(bonusRow);
      }
    }
  }
}

// Изменение информации в строке корзины:

function changeCopyCartRow(id, qty, sum) {
  var cartCopy = getEl('#cart-copy');
  if (cartCopy) {
    var row = getEl(`tr:not(.bonus)[data-id="${id}"]`);
    getEl('.qty', row).textContent = qty;
    getEl('.sum', row).textContent = sum;
  }
}

// Изменение информации о количестве заказов (рядом с кнопкой оформления заказа):

function changeCheckoutInfo(qty, sum) {
  var info = getEl('#checkout-info');
  if (qty > 1) {
    info.style.visibility = 'visible';
    getEl('.qty', info).textContent = declOfNum(qty, ['заказ', 'заказа', 'заказов']);
    getEl('.sum', info).textContent = sum;
  } else {
    info.style.visibility = 'hidden';
  }
}

// Изменение информации в форме заказа:

function changeCheckout() {
  var idList = getIdList('cart');
  if (idList) {
    var checkout = getEl('#checkout'),
        warnblock = getEl('#checkout .warnblock'),
        totals = countFromCart(idList);
    getEl('.qty', cartInfo).textContent = totals.qty;
    showElement('.cart-make-order', 'flex');
    if (totals.qty > 0) {
      getEl('.sum-opt', cartInfo).textContent = totals.sum.toLocaleString('ru-RU');
      getEl('.sum-retail', cartInfo).textContent = totals.sumRetail.toLocaleString('ru-RU');
      if (totals.sumDiscount) {
        getEl('.discount-amount', cartDiscount).textContent = totals.sumDiscount.toLocaleString('ru-RU');
        getEl('.discount-percent', cartDiscount).textContent = totals.percentDiscount;
        showElement(cartDiscount);
      } else {
        hideElement(cartDiscount);
      }
      var notAvailable = getEl('#cart-rows').querySelectorAll('.cart-row.checked.not-available');
      if (idList.length === notAvailable.length ) {
        hideElement('#order-btn');
      } else {
        showElement('#order-btn');
      }
      return;
    }
  }
  getEl('.sum-opt', cartInfo).textContent = 0;
  getEl('.sum-retail', cartInfo).textContent = 0;
  hideElement(cartDiscount);
  hideElement('.cart-make-order');
  hideElement('#order-btn');
}

//=====================================================================================================
// Создание и отображение контента корзины:
//=====================================================================================================

// Отображение контента корзины:

function renderCart() {
  toggleEventListeners('off');
  changeCartName();
  createCart();
  showActualCart();
  showElement('#main-header', 'flex');
  showElement('#cart-name');
  showElement('#cart');
}

// Cоздание корзины:

function createCart() {
  if (!isEmptyObj(cartData)) {
    var data = {
      area: '#cart-list',
      items: cartData,
      type: 'list',
      sub: [{
        area: '.cart-row',
        items: 'items',
        type: 'list'
      }]
    };
    fillTemplate(data);
    data.area = 'cart-table';
    fillTemplate (data);
  }
}

// Отображение контента пустой или полной корзины:

function showActualCart() {
  if (isEmptyObj(cartData)) {
    hideElement('#cart-full');
    showElement('#cart-empty', 'flex');
  } else {
    document.querySelectorAll('.cart-block .head .checkbox').forEach(el => el.classList.add('checked'));
    document.querySelectorAll('.cart-row').forEach(row => {
      checkImg(row);
      changeCartRow(row);
    });
    changeCheckout();
    hideElement('#cart-empty');
    showElement('#cart-full');
  }
}

// Cоздание строки корзины:

function createCartRow(id, qty, row = null, status) {
  var data = createCartItemData(id, qty, status);
  if (data) {
    fillTemplate({
      area: '#cart-rows',
      items: data,
      target: row,
      method: row ? 'afterend' : 'beforeend'
    });
    fillTemplate({
      area: '#cart-table',
      items: data,
      target: tableRow,
      method: tableRow ? 'afterend' : 'beforeend'
    });
  }
}

//=====================================================================================================
// Работа с данными корзины:
//=====================================================================================================

// Открытие окна для загрузки данных в корзину:

function openLoadContainer() {
  openPopUp('#load-container');
  getEl('#load-text').value = '';
}

// Загрузка данных в корзину из текстового поля:

function loadInCart() {
  loader.show();
  var loadText = getEl('#load-text');
  if (!loadText.value || !/\S/.test(loadText.value)) {
    loader.hide();
    return;
  }
  var addInCart = [],
      error = '',
      strings;

  strings = loadText.value
  .split(/\n|\r\n/)
  .map(el => el.split(/\s/))
  .map(el => el.filter(el => el))
  .filter(el => el.length);

  strings.forEach(el => {
    if (el.length != 2) {
      error = 'Неверный формат вводимых данных';
      return;
    }
    var curItem;
    for (var key in cartItems) {
      if (cartItems[key].articul === el[0]) {
        curItem = cartItems[key];
        break;
      }
    }
    if (curItem) {
      var id = curItem.object_id;
      var qty = parseInt(el[1], 10);
      if (isNaN(+qty)) {
        error = 'Неверно введено количество';
        return;
      }
      if (qty > 0) {
        var totalQty = parseInt(curItem.total_qty, 10);
        if (totalQty > 0) {
          qty = qty > totalQty ? totalQty : qty;
          addInCart.push({id: id, qty: qty});
        }
      }
    }
  });
  if (!error && addInCart.length == 0) {
    error = 'Не найдено ни одного артикула';
  }
  if (error) {
    loader.hide();
    alerts.show(error, 2000);
    return;
  }
  addInCart.forEach(el => {
    saveInCart(el.id, el.qty);
  });
  createCart();
  showActualCart();
  loader.hide();
  closePopUp(null, 'load-container');
  if (addInCart.length < strings.length) {
    alerts.show('При загрузке были найдены не все артикулы', 3000);
  }
  loadText.value = '';
}

//Загрузка данных в корзину из файла:

function addInCart(event) {
  event.preventDefault();
  loader.show();
  var form = event.currentTarget,
      formData = new FormData(form),
      loadBtn = getEl('label', form),
      submitBtn = getEl('input[type="submit"]', form);
  sendRequest(`${urlRequest.api}???`, formData, 'multipart/form-data')
  .then(result => {
    // console.log(result);
    var data = JSON.parse(result);
    if (data.cart) {
      cart[cartId] = data.cart[cartId];
      closePopUp(null, 'load-container');
      changeCartInHeader(countFromCart());
      createCart();
      showActualCart();
    } else {
      alerts.show('Файл не загружен. Неверный формат данных.', 2000);
      showElement(loadBtn);
      hideElement(submitBtn);
    }
    loader.hide();
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Файл не загружен. Ошибка сервера.', 2000);
    showElement(loadBtn);
    hideElement(submitBtn);
  })
}

// Копирование корзины:

function copyCart() {
  var cartCopy = getEl('#cart-copy');
  cartCopy.textContent = getEl('#cart-table').parentElement.outerHTML;
  cartCopy.focus();
  cartCopy.setSelectionRange(0, cartCopy.value.length);
  try {
    document.execCommand('copy');
    alerts.show('Содержимое корзины скопировано в буфер обмена.', 2000)
  } catch (error) {
    alerts.show('Не удалось скопировать cодержимое корзины.', 2000)
  }
}

// Выделение/снятие выделения всех пунктов корзины:

function toggleAllCart(event) {
  if (event.currentTarget.classList.contains('checked')) {
    event.currentTarget.classList.remove('checked');
    getEl('#cart-rows').querySelectorAll('.cart-row:not(.displayNone)').forEach(row => row.classList.remove('checked'));
    hideElement('.cart-make-order');
  } else {
    event.currentTarget.classList.add('checked');
    getEl('#cart-rows').querySelectorAll('.cart-row:not(.displayNone)').forEach(row => row.classList.add('checked'));
    showElement('.cart-make-order', 'flex');
  }
  changeCheckout();
}

// Выделение/снятие выделения одного пункта корзины:

function toggleInCart(event) {
  var curRow = event.currentTarget.parentElement;
  if (curRow.classList.contains('bonus')) {
    return;
  }
  curRow.classList.toggle('checked');
  var bonusRow = getEl(`.cart-row[data-parent-id="${curRow.dataset.id}"]`);
  if (bonusRow) {
    bonusRow.classList.toggle('checked');
  }
  if (!getEl('.cart-row:not(.checked)', 'cart-rows')) {
    getEl('#check-all').classList.add('checked');
  } else {
    getEl('#check-all').classList.remove('checked');
  }
  changeCheckout();
}

// Удаление выбранных пунктов корзины:

function deleteSelected(isConfirm) {
  if (!isConfirm) {
    getConfirmDeleteFromCart();
    return;
  }
  alerts.hide();
  var cartRows = getEl('#cart-rows'),
      cartTable = getEl('#cart-table');
  var id, copyRow, bonusRow, tableBonusRow;

  cartRows.querySelectorAll('.cart-row.checked:not(.bonus)').forEach(row => {
    id = row.dataset.id;
    copyRow = getEl(`.cart-table-row[data-id="${id}"]`);
    cartRows.removeChild(row);
    cartTable.removeChild(copyRow);
    saveInCart(id, 0);

    bonusRow = getEl(`.cart-row.bonus[data-parent-id="${id}"]`);
    if (bonusRow) {
      tableBonusRow = getEl(`.cart-table-row.bonus[data-parent-id="${id}"]`);
      cartRows.removeChild(bonusRow);
      cartTable.removeChild(tableBonusRow);
    }
  });
  getEl('#check-all').classList.remove('checked');
  changeCheckout();
  if (cartRows.querySelectorAll('.cart-row').length == 0) {
    showElement('#cart-empty', 'flex');
    hideElement('#cart-full');
  }
}

function getConfirmDeleteFromCart() {
  alerts.show(
  `<div style="margin-bottom: 1em;">Удалить выделенные товары из корзины?</div><div class="row">
    <div class="basic btn" onclick="alerts.hide()" style="margin-right: 1em;">Отмена</div>
    <div class="active btn" onclick="deleteSelected(true)">Ок</div>
  </div>`)
}

//=====================================================================================================
// Работа с формой заказа:
//=====================================================================================================

// Открытие формы заказа:

function openCheckout() {
  if (!userData.contr) {
    alerts.show('Оформление заказа невозможно: отсутствуют активные контрагенты!<br>Перейдите в раздел <a href="http://new.topsports.ru/contractors" target="_blank">Контрагенты</a> для их добавления/включения.');
    return;
  }
  if (!userData.address) {
    alerts.show('Внимание: отсутствуют активные адреса!<br>Перейдите в раздел <a href="http://new.topsports.ru/addresses" target="_blank">Адреса доставки</a> для их добавления/включения.');
    getEl('#order-form .activate.delivery .item[data-value="2"]').style.display = 'none';
    getEl('#order-form .activate.delivery .item[data-value="3"').style.display = 'none';
  }
  clearForm('#order-form');
  toggleAddressField();
  openPopUp('#checkout');
}

// Заполнение формы заказа данными:

function fillOrderForm() {
  fillTemplate({
    area: '#contr .drop-down',
    items: userData.contr
  });
  fillTemplate({
    area: '#address .drop-down',
    items: userData.address,
  });
  toggleAddressField();
}

// Показ/ скрытие поля выбора адреса доставки:

function toggleAddressField() {
  var deliveryType = getEl('#delivery'),
      address = getEl('#address');
  if (deliveryType.value === '2' || deliveryType.value === '3') {
    address.removeAttribute('disabled');
    address.closest('.form-wrap').required = true;
  } else {
    clearDropDown(address);
    address.setAttribute('disabled', 'disabled');
    address.closest('.form-wrap').required = false;
  }
}
