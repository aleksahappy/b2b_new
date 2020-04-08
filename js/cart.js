'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Динамически изменяемые переменные:

var cartTimer = null,
    cartTimeout = 1000;

//=====================================================================================================
// Запросы на сервер:
//=====================================================================================================

// Получение данных о конкретном товаре:

function getItems(data) {
  return new Promise((resolve, reject) => {
    sendRequest(`${urlRequest.api}???`, data)
    .then(result => {
      console.log(result);
      var productList = JSON.parse(result);
      resolve(productList);
    })
    .catch(error => {
      reject(error);
    })
  });
}

// Отправка данных корзины на сервер (только изменившихся данных):

function cartSentServer() {
  clearTimeout(cartTimer);
  cartTimer = setTimeout(function () {
    console.log(cartChanges);
    sendRequest(`${urlRequest.api}baskets/set_cart.php`, cartChanges)
      .then(response => {
        cartChanges = {};
        console.log(response);
      })
      .catch(err => {
        console.log(err);
        // cartSentServer();
      })
  }, cartTimeout);
}

// Отправка данных о заказе на сервер:

function orderSentServer(event) {
  event.preventDefault()
  loader.show();
  var info = getOrderData();
  var idList = getIdList();
  if (!idList) {
    return;
  }
  var cartInfo = {};
  cartInfo[cartId] = {};
  idList.forEach(id => {
    cartInfo[cartId]['id_' + id] = cart[cartId]['id_' + id];
  });

  var data = {
    info: info,
    cart: cartInfo
  };
  console.log(data);
  sendRequest(`${urlRequest.api}baskets/???`, data)
  .then(result => {
    // var orderId = JSON.parse(result);
    deleteFormCart(idList);
    // document.location.href = `../order/?order_id=${orderId}`;
  })
  .catch(error => {
    console.log(error);
    message.show('Заказ не отправлен. Попробуйте еще раз.');
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
  console.log(info)
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
      changeCartInHeader(countFromCart());
      if (location.search === '?cart') {
        renderCart();
      } else {
        var cards;
        if (view === 'list') {
          cards = document.querySelectorAll('.big-card');
        }
        if (view === 'blocks') {
          cards = document.querySelectorAll('.min-card');
        }
        cards.forEach(card => checkCart(card));
      }
    },
    reject => {
      console.log(reject);
    }
  );
}

// Проверка наличия всех необходимых items для рендеринга корзины:

function checkFullnessItems() {
  var data = [];
  for (var key in cart[cartId]) {
    if (!cartItems[key]) {
      data.push(cart[cartId][key].id);
    }
  }
  if (data.length) {
    getItems(data)
    .then(
      result => {
        result.forEach(item => convertItem(item));
        items.push(result);
      },
      reject => {
        console.log(reject);
        // checkFullnessItems();
      }
    )
  }
}

// Изменение информации о корзине в шапке сайта:

function changeCartInHeader(totals) {
  var qty = totals.qty,
      sum = totals.sum,
      headerCart = getEl('header-cart'),
      catalogCart = getEl(`cart-${cartId}`);
  if (headerCart) {
    fillCartInHeader(qty, sum, headerCart);
  }
  if (catalogCart) {
    fillCartInHeader(qty, sum, catalogCart);
  }
  changeCartName(qty);
}

// Заполнение конкретной корзины в шапке сайта данными:

function fillCartInHeader(qty, sum, curCart) {
  var cartQty = getEl('.qty', curCart),
      cartSum = getEl('.sum span', curCart),
      cartType = curCart.id;
  if (cartSum) {
    cartSum.textContent = sum.toLocaleString('ru-RU');
  }
  if (website === 'skipper') {
    cartQty.textContent = qty;
  } else {
    if (qty > 0) {
      if (qty > 99) {
        if (cartType === 'header-cart') {
          cartQty.textContent = '99';
        } else {
          cartQty.textContent = '99+';
        }
      } else {
        cartQty.textContent = qty;
      }
      if (cartType === 'header-cart') {
        showElement(cartQty);
      } else {
        cartQty.classList.add('full');
      }
    } else {
      if (cartType === 'header-cart') {
        hideElement(cartQty);
      } else {
        cartQty.classList.remove('full');
      }
    }
  }
}

// Добавление информации о корзине в заголовок страницы:

function changeCartName(qty) {
  var cartName = getEl('cart-name');
  if (cartName) {
    cartName.textContent = ': ' + getEl('.topmenu-item.active').textContent + ' - ' + qty + ' ' + getWord(qty);
  }
}

// Отображение правильного окончания в слове "товар":
// * товар - 1 | 21 | 31 | 41 | 51 | 61 |71 | 81 | 91 | 101 ...
// * товара - 2 | 3 | 4 | 22 | 23 | 24 | 32 | 33 | 34 ...
// * товаров - 0 | 5 | 6 | 7 | 8 | 9 | 10-20 | 25-30 | 35-40 ...

function getWord(qty) {
  if ((qty === 1) || (qty > 20 && qty % 10 === 1)) {
    return 'товар';
  } else if ((qty >= 2 && qty <= 4) || (qty > 20 && qty % 10 >= 2 && qty % 10 <= 4)) {
    return 'товара';
  } else {
    return 'товаров';
  }
}

// Сохранение в корзину с отправкой на сервер только изменившихся данных:

function saveInCart(id, qty) {
  id = 'id_' + id;
  if (!cart[cartId]) {
    cart[cartId] = {};
  }
  if (!qty && !cart[cartId][id]) {
    return;
  }
  if (cart[cartId][id] && cart[cartId][id].qty == qty) {
    return;
  }
  if (!cart[cartId][id]) {
    cart[cartId][id] = {};
  }
  cart[cartId][id].id = id.replace('id_', '');
  cart[cartId][id].qty = qty;
  cart[cartId][id].cartId = cartId;
  cart[cartId][id].actionId = cartItems[id].action_id;
  cart[cartId][id].actionName = cartItems[id].action_name;

  if (!cartChanges[cartId]) {
    cartChanges[cartId] = {};
  }
  cartChanges[cartId][id] = cart[cartId][id];
  cartSentServer();

  if (!qty) {
    delete cart[cartId][id];
  }
  saveCartTotals();
}

// Удаление данных из корзины:

function deleteFormCart(idList) {
  idList.forEach(id => {
    delete cart[cartId]['id_' + id];
  });
  saveCartTotals();
}

// Сохранение данных об итогах корзины:

function saveCartTotals() {
  var totals = countFromCart();
  cartTotals.forEach(el => {
    if (el.id === cartId) {
      el.qty = totals.qty;
      el.sum = totals.sum;
    }
  });
  changeCartInHeader(totals);
}

//=====================================================================================================
// Подсчет корзины:
//=====================================================================================================

// Подсчет по корзине (всей корзины целиком или только выбранных элементов):

function countFromCart(idList = undefined, totals = true) {
  var info = cart[cartId],
      qty = 0,
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

  if (info) {
    var curItem, curQty;
    if (idList) {
      idList.forEach(id => {
        countTotals('id_' + id, info['id_' + id]);
      });
    } else {
      for (let id in info) {
        countTotals(id, info[id]);
      }
    }
  }

  function countTotals(id, el) {
    if (!el) {
      return;
    }
    curItem = cartItems[id];
    if (!curItem || curItem.total_qty == 0) {
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

function getIdList(area) {
  var list;
  if (area) {
    list = area.querySelectorAll('.choiced-qty');
  } else {
    list = getEl('cart-rows').querySelectorAll('.cart-row.checked:not(.bonus):not(.not-available)');
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
        showElement(qty);
        showElement(cartInfo);
      } else {
        hideElement(qty);
        hideElement(cartInfo);
      }
    }
  } else {
    var input, qty;
    card.querySelectorAll('.card-size').forEach(size => {
      input = getEl('.choiced-qty', size);
      qty = getQty(input.dataset.id);
      input.value = qty;
      changeColors(getEl('.qty', size), qty);
      changeNameBtn(getEl('.name.click', size), qty);
      changeCardInfo(card);
    });
  }
}

// Получение даннных о количестве товара из корзины:

function getQty(id) {
  var info = cart[cartId],
      id = 'id_' + id,
      qty, totalQty;
  if (info && info[id]) {
    qty = parseInt(info[id].qty, 10);
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
        createCart('id_' + bonusId, qty, row, tableRow);
        bonusRow = row.nextElementSibling;
        checkImg(bonusRow);
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
  var idList = getIdList(),
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
      showElement('order-btn');
      return;
    }
  } else {
    getEl('.qty', cartInfo).textContent = 0;
    var notAvailable = getEl('cart-rows').querySelectorAll('.cart-row.checked.not-available');
    if (notAvailable.length > 0) {
      showElement('.cart-make-order', 'flex');
    } else {
      hideElement('.cart-make-order');
    }
  }
  getEl('.sum-opt', cartInfo).textContent = 0;
  getEl('.sum-retail', cartInfo).textContent = 0;
  hideElement(cartDiscount);
  hideElement('order-btn');
}

//=====================================================================================================
// Создание и отображение контента корзины:
//=====================================================================================================

// Отображение контента корзины:

function renderCart() {
  changeContent('cart');
  showElement('cart-name');
  if (createCart()) {
    getEl('check-all').classList.add('checked');
    document.querySelectorAll('.cart-row').forEach(row => {
      checkImg(row);
      changeCartRow(row);
    });
    closeOrderForm();
    changeCartInfo();
    hideElement('cart-empty');
    showElement('cart-full');
  } else {
    hideElement('cart-full');
    showElement('cart-empty');
  }
  showElement('cart');
}

// Создание корзины:

function createCart(id, qty, row = null, tableRow = null) {
  var isBonus = row ? true : false;
  var data = getCartData(id, qty, isBonus);
  if (data.length) {
    fillTemplate({
      area: 'cart-rows',
      items: data,
      target: row,
      method: row ? 'end' : null
    });
    fillTemplate({
      area: 'cart-table',
      items: data,
      target: tableRow,
      method: tableRow ? 'end' : null
    });
    return true;
  } else {
    return false;
  }
}

// Подготовка данных для создания корзины:

function getCartData(id, qty, isBonus) {
  var data = [];
  if (id && qty) {
    getRowData(id, qty);
  } else {
    for (var id in cart[cartId]) {
      qty = cart[cartId][id].qty
      if (qty) {
        getRowData(id, qty);
      }
    }
  }

  function getRowData(id, qty) {
    if (!cartItems[id]) {
      return;
    }
    var cartItem = Object.assign(cartItems[id]);
    if (isBonus) {
      cartItem.isBonus = 'bonus';
      cartItem.price_cur = 'Подарок';
    }
    if (cartItem.total_qty > 0) {
      cartItem.qty = qty > cartItem.total_qty ? cartItem.total_qty : qty;
    } else {
      cartItem.qty = qty;
    }
    data.push(cartItem);
  }
  return data;
}

//=====================================================================================================
// Работа с данными корзины:
//=====================================================================================================

// Загрузка корзины из текстового поля:

function loadInCart() {
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
    .map(el => el.filter(el => el != ''))
    .filter(el => el.length > 0);

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
    message.show(error);
    return;
  }
  addInCart.forEach(el => {
    saveInCart(el.id, el.qty);
  });
  renderCart();
  if (addInCart.length < strings.length) {
    message.show('При загрузке были найдены не все артикулы');
  }
  loadText.value = '';
}

// Копирование корзины:

function copyCart() {
  var cartCopy = getEl('cart-copy');
  cartCopy.textContent = getEl('cart-table').outerHTML;
  cartCopy.focus();
  cartCopy.setSelectionRange(0, cartCopy.value.length);
  try {
    document.execCommand('copy');
    alert('Содержимое корзины скопировано в буфер обмена.');
  } catch (error) {
    alert('Не удалось скопировать cодержимое корзины.');
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

function deleteSelected() {
  if (confirm('Удалить выделенные товары из корзины?')) {
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
}

//=====================================================================================================
// Работа с формой заказа:
//=====================================================================================================

// Открытие формы заказа:

function openOrderForm() {
  sendRequest(`${urlRequest.api}baskets/ajax.php?action=get_contr_delivery`)
  .then(result => {
    var data = JSON.parse(result);
    console.log(data);
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
