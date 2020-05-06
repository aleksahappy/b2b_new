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
    sendRequest(`${urlRequest.api}baskets/set_cart.php`, cartChanges)
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
      sessid: getCookie('iam'),
      data: cartChanges
    };
    navigator.sendBeacon(`${urlRequest.api}baskets/set_cart.php`, JSON.stringify(data));
  }
}, false);

// Отправка данных о заказе на сервер:

function orderSentServer(event) {
  event.preventDefault()
  loader.show();
  var info = getOrderData();
  var idList = getIdList('cart', false);
  if (!idList) {
    return;
  }
  var cartInfo = {};
  cartInfo[cartId] = {};
  idList.forEach(id => {
    cartInfo[cartId]['id_' + id] = cart['id_' + id];
  });

  var data = {
    info: info,
    cart: cartInfo
  };
  // console.log(data);
  sendRequest(`${urlRequest.api}baskets/???`, data)
  .then(result => {
    // var orderId = JSON.parse(result);
    deleteFormCart(idList);
    // document.location.href = `../order/?order_id=${orderId}`;
  })
  .catch(error => {
    console.log(error);
    message.show('Заказ не был отправлен. Попробуйте еще раз.');
  })
}

// Получение данных о заказе из формы:

function getOrderData() {
  var info = {
    cart_name: cartId
  }
  var formData = new FormData(event.currentTarget);
  formData.forEach(function(value, key){
    info[key] = value;
  });
  // console.log(info);
  return info;
}

//=====================================================================================================
// Работа с корзиной:
//=====================================================================================================

// Обновление корзины при возвращении на страницу:

function updateCart() {
  getCart()
  .then(
    result => {
      createCartData();
      if (location.search === '?cart') {
        createCart();
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
    },
    reject => {
      console.log(reject);
    }
  );
}

// Создание данных для рендеринга корзины:

function createCartData() {
  // getMissingItems();
  for (var id in cart) {
    qty = cart[id].qty
    if (qty) {
      cartData[id] = createCartItemData(id, qty);
    }
  }
}

// Создание данных строки корзины:

function createCartItemData(id, qty, status = '') {
  console.log(cartItems[id]);
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
  console.log(item);
  return item;
}

// Получение недостающих items для рендеринга корзины:

function getMissingItems() {
  var data = [];
  for (var key in cart) {
    if (!cartItems[key]) {
      data.push(cart[key].id);
    }
  }
  if (data.length) {
    getItems(data)
    .then(
      result => {
        result.forEach(item => convertItem(item));
      },
      reject => {
        console.log(reject);
        // getMissingItems();
      }
    )
  }
}

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
  var area = type === 'cart' ? getEl('header-cart') : getEl('catalogs');
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
      getEl('.cart-sum span', area).textContent = sum.toLocaleString('ru-RU');
    }
  }
}

// Добавление информации о корзине в заголовок страницы:

function changeCartName(qty) {
  var cartName = getEl('cart-name');
  if (cartName) {
    if (!qty) {
      var curTotal = cartTotals.find(el => el.id === cartId);
      qty = curTotal ? curTotal.qty : 0;
    };
    cartName.textContent = ': ' + getEl('.topmenu-item.active').textContent + ' - ' + qty + ' ' + getWordEnd('товар', qty);
  }
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
  cart[id].actionName = cartItems[id].actiontitle || 'Cклад';

  cartChanges[cartId][id] = cart[id];
  cartSentServer();

  if (!qty) {
    delete cart[id];
    delete cartData[id];
  } else {
    cartData[id] = createCartItemData(id, qty);
  }
  saveCartTotals();
}

// Удаление данных из корзины:

function deleteFormCart(idList) {
  idList.forEach(id => {
    delete cart['id_' + id];
  });
  saveCartTotals();
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
// Изменение данных о количестве:
//=====================================================================================================

// Получение списка id товаров, выбранных в корзине:

function getIdList(area, isAll = true) {
  var list;
  if (area === 'cart') {
    if (isAll) {
      list = getEl('cart-rows').querySelectorAll('.cart-row.checked:not(.bonus)');
    } else {
      list = getEl('cart-rows').querySelectorAll('.cart-row.checked:not(.bonus):not(.not-available)');
    }
  } else {
    list = area.querySelectorAll('.choiced-qty');
  }
  return Array.from(list).map(el => el.dataset.id);
}

// Вывод информации о корзине в карточке товара:

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
      for (let el in sizeInfo) {
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
      changeNameBtn(getEl('.name.click', size), qty);
      changeCardInfo(card);
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

// Выбор количества пользователем:

function changeCart(event) {
  var current = event.currentTarget,
      curEl = current.closest('.manage'),
      sign = current.textContent,
      qtyWrap = current.closest('.qty'),
      input = getEl('.choiced-qty', qtyWrap),
      qty = parseInt(input.value, 10),
      id = input.dataset.id,
      totalQty = cartItems['id_' + id].total_qty;

  qty = changeValue(sign, qty, totalQty);
  input.value = qty;
  input.dataset.value = qty;
  saveInCart(id, qty);
  changeColors(qtyWrap, qty);
  if (curEl.classList.contains('card')) {
    changeNameBtn(getEl('.name.click', qtyWrap), qty);
    changeCardInfo(curEl);
    if (curEl.classList.contains('full-card')) {
      checkCart(getEl(`.card[data-id="${curEl.dataset.id}"]`, 'gallery'));
    }
  } else {
    changeCartRow(curEl);
    changeCartInfo();
  }
}

// Изменение количества выбранного товара:

function changeValue(sign, qty, totalQty) {
  if (sign) {
    if (sign == '-') {
      if (qty > 0) {
        qty--;
      }
    } else if (sign == '+') {
      if (qty < totalQty) {
        qty++;
      }
    } else if (sign == 'В корзину') {
      qty = 1;
    } else if (sign == 'Удалить') {
      qty = 0;
    }
  } else {
    if (isNaN(qty)) {
      qty = 0;
    }
    if (qty > totalQty) {
      qty = totalQty;
    }
  }
  return qty;
}

// Изменение цвета элементов панели выбора:

function changeColors(el, qty) {
  if (el) {
    if (qty == 0) {
      el.classList.remove('in-cart');
    } else {
      el.classList.add('in-cart');
    }
  }
}

// Изменение названия кнопки в панели выбора:

function changeNameBtn(el, qty) {
  if (el) {
    if (qty == 0) {
      el.textContent = 'В корзину';
    } else {
      el.textContent = 'Удалить';
    }
  }
}

// Изменение информации в карточке товара:

function changeCardInfo(card) {
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
  if (row.classList.contains('not-available') || row.classList.contains('bonus')) {
    return;
  }
  var input = getEl('.choiced-qty', row),
      id = input.dataset.id,
      tableRow = getEl(`.cart-table-row:not(.bonus)[data-id="${id}"]`),
      totals = countFromCart([id], false);

  getEl('.sum .value', row).textContent = totals.sum.toLocaleString('ru-RU');
  getEl('.qty', tableRow).textContent = parseInt(input.value ,10);
  getEl('.sum', tableRow).textContent = totals.sum;

  if (totals.bonusId) {
    var bonusRow = getEl(`.cart-row.bonus[data-parent-id="${id}"]`),
        tableBonusRow = getEl(`.cart-table-row.bonus[data-parent-id="${id}"]`);
    if (totals.bonusQty > 0) {
      var qty = totals.bonusQty;
      if (bonusRow) {
        getEl('.qty .bonus span', bonusRow).textContent = qty;
        getEl('.qty', tableBonusRow).textContent = qty;
      } else {
        createCartRow('id_' + bonusId, qty, row, tableRow, 'bonus');
        bonusRow = row.nextElementSibling;
        checkImg(bonusRow);
        getEl('.prop.action', bonusRow).textContent = getEl('.prop.action', row).textContent;
        bonusRow.dataset.parentId = id;
        if (!row.classList.contains('checked')) {
          bonusRow.classList.remove('checked');
        }
        tableBonusRow = tableRow.nextElementSibling;
        tableBonusRow.dataset.parentId = id;
      }
    } else {
      if (bonusRow) {
        getEl('cart-rows').removeChild(bonusRow);
        getEl('cart-table').removeChild(tableBonusRow);
      }
    }
  }
}

// Изменение общей информации о корзине:

function changeCartInfo() {
  var idList = getIdList('cart'),
      cartInfo = getEl('cart-info'),
      cartDiscount = getEl('.cart-discount', cartInfo);
  if (idList) {
    var totals = countFromCart(idList);
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
      var notAvailable = getEl('cart-rows').querySelectorAll('.cart-row.checked.not-available');
      if (idList.length === notAvailable.length ) {
        hideElement('order-btn');
      } else {
        showElement('order-btn');
      }
      return;
    }
  }
  getEl('.sum-opt', cartInfo).textContent = 0;
  getEl('.sum-retail', cartInfo).textContent = 0;
  hideElement(cartDiscount);
  hideElement('.cart-make-order');
  hideElement('order-btn');
}

//=====================================================================================================
// Создание и отображение контента корзины:
//=====================================================================================================

// Отображение контента корзины:

function renderCart() {
  toggleEventListeners('off');
  changeCartName();
  createCart();
  showElement('cart-name');
  showElement('cart');
}

// Cоздание корзины:

function createCart() {
  if (!isEmptyObj(cartData)) {
    var data = {
      area: 'cart-rows',
      items: cartData,
      type: 'list'
    };
    fillTemplate(data);
    data.area = 'cart-table';
    fillTemplate (data);
  }
  showActualCart();
}

// Отображение контента пустой или полной корзины:

function showActualCart() {
  if (isEmptyObj(cartData)) {
    hideElement('cart-full');
    showElement('cart-empty');
  } else {
    getEl('check-all').classList.add('checked');
    document.querySelectorAll('.cart-row').forEach(row => {
      checkImg(row);
      changeCartRow(row);
    });
    closeOrderForm();
    changeCartInfo();
    hideElement('cart-empty');
    showElement('cart-full');
  }
}

// Cоздание строки корзины:

function createCartRow(id, qty, row = null, tableRow = null, status) {
  var data = createCartItemData(id, qty, status);
  if (data) {
    fillTemplate({
      area: 'cart-rows',
      items: data,
      target: row,
      method: row ? 'afterend' : 'beforeend'
    });
    fillTemplate({
      area: 'cart-table',
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
  openPopUp('load-container');
  getEl('load-text').value = '';
}

// Загрузка данных в корзину из текстового поля:

function loadInCart() {
  loader.show();
  var loadText = getEl('load-text');
  if (!loadText.value || !/\S/.test(loadText.value)) {
    return;
  }
  var addInCart = [],
      error = '',
      strings, id, qty, totalQty;

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
    var curItem = cartItems.find(el => el.articul = el[0]);
    if (curItem) {
      id = curItem.id;
      qty = parseInt(el[1], 10);
      if (isNaN(+qty)) {
        error = 'Неверно введено количество';
        return;
      }
      if (qty > 0) {
        totalQty = parseInt(curItem.total_qty, 10);
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
    message.show(error, 2000);
    return;
  }
  addInCart.forEach(el => {
    saveInCart(el.id, el.qty);
  });
  createCart();
  loader.hide();
  closePopUp(null, 'load-container');
  if (addInCart.length < strings.length) {
    message.show('При загрузке были найдены не все артикулы', 3000);
  }
  loadText.value = '';
}

//Загрузка данных в корзину из файла:

function addInCart(event) {
  event.preventDefault();
  loader.show();
  var form = event.currentTarget,
      data = new FormData(form),
      loadBtn = getEl('label',form),
      submitBtn = getEl('input[type="submit"]', form);
  sendRequest(`${urlRequest.api}???`, data, 'multipart/form-data')
  .then(result => {
    // console.log(result);
    var data = JSON.parse(result);
    if (data.cart) {
      cart[cartId] = data.cart[cartId];
      closePopUp(null, 'load-container');
      changeCartInHeader(countFromCart());
      createCart();
    } else {
      message.show('Файл не загружен. Неверный формат данных.', 2000);
      showElement(loadBtn);
      hideElement(submitBtn);
    }
    loader.hide();
  })
  .catch(error => {
    loader.hide();
    message.show('Файл не загружен. Ошибка сервера.', 2000);
    showElement(loadBtn);
    hideElement(submitBtn);
    console.log(error);
  })
}

// Копирование корзины:

function copyCart() {
  var cartCopy = getEl('cart-copy');
  cartCopy.textContent = getEl('cart-table').parentElement.outerHTML;
  cartCopy.focus();
  cartCopy.setSelectionRange(0, cartCopy.value.length);
  try {
    document.execCommand('copy');
    message.show('Содержимое корзины скопировано в буфер обмена.', 2000)
  } catch (error) {
    message.show('Не удалось скопировать cодержимое корзины.', 2000)
  }
}

// Выделение/снятие выделения всех пунктов корзины:

function toggleAllCart(event) {
  if (event.currentTarget.classList.contains('checked')) {
    event.currentTarget.classList.remove('checked');
    getEl('cart-rows').querySelectorAll('.cart-row:not(.displayNone)').forEach(row => row.classList.remove('checked'));
    hideElement('.cart-make-order');
  } else {
    event.currentTarget.classList.add('checked');
    getEl('cart-rows').querySelectorAll('.cart-row:not(.displayNone)').forEach(row => row.classList.add('checked'));
    showElement('.cart-make-order', 'flex');
  }
  changeCartInfo();
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
    getEl('check-all').classList.add('checked');
  } else {
    getEl('check-all').classList.remove('checked');
  }
  changeCartInfo();
}

// Удаление выбранных пунктов корзины:

function deleteSelected(isConfirm) {
  if (!isConfirm) {
    getConfirmDeleteFromCart();
    return;
  }
  message.hide();
  var cartRows = getEl('cart-rows'),
      cartTable = getEl('cart-table');
  var id, tableRow, bonusRow, tableBonusRow;

  cartRows.querySelectorAll('.cart-row.checked:not(.bonus)').forEach(row => {
    id = row.dataset.id;
    tableRow = getEl(`.cart-table-row[data-id="${id}"]`);
    cartRows.removeChild(row);
    cartTable.removeChild(tableRow);
    saveInCart(id, 0);

    bonusRow = getEl(`.cart-row.bonus[data-parent-id="${id}"]`);
    if (bonusRow) {
      tableBonusRow = getEl(`.cart-table-row.bonus[data-parent-id="${id}"]`);
      cartRows.removeChild(bonusRow);
      cartTable.removeChild(tableBonusRow);
    }
  });
  getEl('check-all').classList.remove('checked');
  changeCartInfo();
  if (cartRows.querySelectorAll('.cart-row').length == 0) {
    showElement('cart-empty');
    hideElement('cart-full');
  }
}

function getConfirmDeleteFromCart() {
  message.show(
  `<div style="margin-bottom: 1em;">Удалить выделенные товары из корзины?</div><div class="row">
    <div class="basic btn" onclick="message.hide()" style="margin-right: 1em;">Отмена</div>
    <div class="active btn" onclick="deleteSelected(true)">Ок</div>
  </div>`)
}

//=====================================================================================================
// Работа с формой заказа:
//=====================================================================================================

// Открытие формы заказа:

function openOrderForm() {
  sendRequest(`${urlRequest.api}baskets/ajax.php?action=get_contr_delivery`)
  .then(result => {
    var data = JSON.parse(result);
    // console.log(data);
    if (data.user_contr && data.user_address_list) {
      fillTemplate({
        area: 'select-contr',
        items: data,
        sub: [{
          area: '.item',
          items: 'user_contr'
        }]
      });
      fillTemplate({
        area: 'select-address',
        items: data,
        sub: [{
          area: '.item',
          items: 'user_address_list'
        }]
      });
      showElement('order-form', 'flex');
      hideElement('.cart-make-order');
      document.querySelectorAll('.cart-list').forEach(el => hideElement(el));
    } else {
      if (!data.user_contr) {
        message.show('Оформление заказа невозможно: отсутствуют активные контрагенты!<br>Перейдите в <a href="http://new.topsports.ru/cabinet">профиль</a> для их добавления/включения.')
      } else {
        message.show('Оформление заказа невозможно: отсутствуют активные адреса!<br>Перейдите в <a href="http://new.topsports.ru/cabinet">профиль</a> для их добавления/включения.')
      }
    }
  })
  .catch(error => {
    console.log(error);
    // openOrderForm();
  })
}

// Закрытие формы заказа:

function closeOrderForm() {
  var orderForm = getEl('order-form');
  orderForm.querySelectorAll('select').forEach(el => el.value = '');
  orderForm.querySelectorAll('textarea').forEach(el => el.value = '');
  toggleOrderAddress(getEl('[name="delivery_type"]'), 'order-form');
  hideElement('order-form');
  showElement('.cart-make-order');
  document.querySelectorAll('.cart-list').forEach(el => showElement(el));
}

// Показ/ скрытие поля выбора адреса доставки:

function toggleOrderAddress(el) {
  var address = getEl('.address', 'order-form'),
      addressSelect = getEl('select', address);
  if (el.value === '3') {
    addressSelect.required = true;
    showElement(address);
  } else {
    addressSelect.value = '';
    addressSelect.required = false;
    hideElement(address);
  }
}
