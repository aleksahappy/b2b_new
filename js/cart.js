'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Динамически изменяемые переменные:

var soldOutItems = [],
    cartData,
    cartTimer = null,
    cartTimeout = 1000,
    cartChanges = {};

// Шаблоны корзины (сохраняем, потому что данные перезапишутся):

var cartSectionTemp, cartRowTemp;

//=====================================================================================================
// Запросы на сервер:
//=====================================================================================================

// Отправка данных корзины на сервер (только изменившихся данных):

function cartSentServer() {
  clearTimeout(cartTimer);
  cartTimer = setTimeout(function () {
    // console.log(JSON.stringify(cartChanges));
    sendRequest(urlRequest.main, 'set_cart', {[cartId]: cartChanges})
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

// Отправка данных корзины на сервер если при закрытии страницы остались неотправленные данные (только изменившихся данных):

window.addEventListener('unload', () => {
  if(!isEmptyObj(cartChanges)) {
    var data = {
      action: 'set_cart',
      data: {[cartId]: cartChanges}
    };
    navigator.sendBeacon(urlRequest.main, JSON.stringify(data));
  }
}, false);

// Отправка данных о заказе на сервер:

function sendOrder(formData) {
  var idList = getCheckedId();
  if (!idList) {
    hideElement('#checkout .loader');
    alerts.show('Заказ не был отправлен. Попробуйте еще раз.');
    return;
  }
  var cartInfo = {};
  cartInfo[cartId] = {};
  idList.forEach(id => {
    cartInfo[cartId]['id_' + id] = cart['id_' + id];
  });
  var orderInfo = {
    cart_name: cartId,
    comments: {}
  };
  formData.forEach((value, key) => {
    if (key.indexOf('comment') >= 0) {
      orderInfo.comments[key.replace('comment-', '')] = value;
    } else {
      orderInfo[key] = value;
    }
  });
  var data = {
    cart: cartInfo,
    info: orderInfo
  };
  // console.log(data);

  sendRequest(urlRequest.main, 'send_order', data)
  .then(result => {
    console.log(result);
    if (result.error) {
      throw new Error('Ошибка');
    } else {
      document.location.href = '../orders';
    }
  })
  .catch(error => {
    console.log(error);
    hideElement('#checkout .loader');
    alerts.show('Заказ не был отправлен. Попробуйте еще раз.');
  })
}

//=====================================================================================================
// Создание и отображение контента корзины:
//=====================================================================================================

// Создание контента корзины:

function renderCart() {
  toggleEventListeners('off');
  addCatalogLink();
  changeCartName();
  clearSearch('#cart-search');
  clearForm('#order-form');
  showElement('#cart-name', 'flex');
  showElement('#cart');
  showCart();
}

// Добавление ссылки на текущий каталог в пустую корзину:

function addCatalogLink() {
  var curSection = getEl('.topmenu-item.active');
  if (curSection) {
    getEl('#catalog-link').href = curSection.href;
  }
}

// Отображение контента корзины:

function showCart() {
  if (isEmptyObj(cartData)) {
    hideElement('#header-cart');
    hideElement('#cart-full');
    showElement('#cart-empty', 'flex');
  } else {
    createCart();
    createCartCopy();
    hideElement('#cart-empty');
    showElement('#header-cart');
    showElement('#cart-full');
  }
}

// Cоздание корзины:

function createCart(data) {
  if (data && !data.search.items.length) {
    getEl('#cart-full').innerHTML = '<div class="notice">По вашему запросу ничего не найдено.</div>';
    return;
  }
  var isData = data ? true : false;
  if (!data) {
    cartData = sortObjByKey(cartData);
    moveToEndObj(cartData, 'Нет в наличии');
    data = cartData;
  }
  fillTemplate({
    area: '#cart-full',
    items: data,
    type: 'list',
    sub: [{
      area: '.cart-row',
      items: 'items',
      type: 'list'
    }]
  });
  document.querySelectorAll('.cart-row').forEach(row => {
    row.classList.add('checked');
    checkMedia(getEl('img', row));
    changeCartRow(row);
  });
  document.querySelectorAll('.cart-section').forEach(el => changeCartSectionInfo(el));
  if (!isData) {
    changeCheckoutInfo();
  }
  setTimeout(() => setPaddingToBody(), 0);
}

// Cоздание копии корзины:

function createCartCopy() {
  var data = [];
  for (var key in cartData) {
    for (var id in cartData[key].items) {
      data.push(cartData[key].items[id]);
    }
  }
  fillTemplate({
    area: '#cart-table',
    items: data
  });
}

// Cоздание строки корзины:

function createCartRow(id, qty, row, status) {
  var data = createCartItemData(id, qty, '0', status);
  if (data) {
    fillTemplate({
      area: cartRowTemp,
      items: data,
      source: 'outer',
      target: row,
      method: 'afterend'
    });
  }
}

//=====================================================================================================
// Работа с данными корзины:
//=====================================================================================================

// Обновление корзины при возвращении на страницу:

function updateCart() {
  getCart()
  .then(result => {
    if (result === 'cart') {
      createCartData()
      .then(result => {
        if (location.search === '?cart') {
          renderCart();
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
    }
    fillOrderForm();
  }, reject => console.log(reject))
}

// Создание данных для рендеринга корзины:

function createCartData() {
  return new Promise((resolve, reject) => {
    getSoldOutItems()
    .then(result => {
      cartData = {};
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

// Получение items распроданных товаров для рендеринга корзины:

function getSoldOutItems() {
  return new Promise((resolve, reject) => {
    var data = [];
    for (var key in cart) {
      if (cart[key].qty > 0 && !cartItems[key]) {
        data.push(cart[key].id);
      }
    }
    if (data.length) {
      // getItems(data.join(','))
      sendRequest(`../json/equip_missing.json`)
      .then(result => {
        result = JSON.parse(result); //удалить
        // console.log(result);
        for (var key in result.items) {
          soldOutItems.push(convertItem(result.items[key]));
        }
        resolve();
      })
      .catch(err => {
        console.log(err);
        resolve();
      })
    } else {
      resolve();
    }
  });
}

// Создание данных строки корзины:

function createCartItemData(id, qty, checker, status = '') {
  if (!cartItems[id]) {
    return;
  }
  if (status === 'bonus' && item.total_qty < 0) {
    return;
  }
  var item = Object.assign(cartItems[id]);
  item.qty = qty;
  item.price_cur = status === 'bonus' ? 'Подарок' : item.total_qty > 0 ? item.price_cur : 0;
  item.status = status === 'bonus' ? 'bonus' : item.total_qty > 0 ? qty > item.total_qty ? 'attention' : '' : 'sold';
  // item.isChecked = checker > 0 ? 'checked' : '';
  item.search = `${item.articul};${item.options};${item.title};${convertToString(item.price_cur)}`;
  return item;
}

// Сохранение изменений количества товара в корзину:

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
  cart[id].actionName = cartItems[id].action_name;
  // cart[id].checker = '1';

  cartChanges[id] = cart[id];
  cartSentServer();

  if (!qty) {
    delete cart[id];
    deleteFromCartData(id);
  } else {
    saveInCartData(id);
  }
  saveCartTotals();
}

// Сохранение значения чекера товара в корзину (выбран/не выбран в корзине):

// function saveCheckerInCart(id, checker) {
//   id = 'id_' + id;
//   if (!cart[id]) {
//     return;
//   }
//   cart[id].checker = checker;
//   cartChanges[id] = cart[id];
//   cartSentServer();
//   saveInCartData(id);
// }

// Сохранение изменений товара в данные для рендеринга корзины:

function saveInCartData(id) {
  if (!cart[id]) {
    return;
  }
  var data = cart[id],
      qty = data.qty,
      checker = data.checker > 0 ? data.checker : '0';
  var item = createCartItemData(id, qty, checker);
  if (!item) {
    return;
  }
  var action = item.total_qty && item.total_qty > 0 ? item.action_name : 'Нет в наличии';
  if (!cartData[action]) {
    cartData[action] = {};
    cartData[action].action_name = action;
    cartData[action].type = action === 'Нет в наличии' ? 'sold' : '';
    cartData[action].items = {};
  }
  if (!cartData[action].items[id]) {
    cartData[action].items[id] = item;
  }
}

// Удаление товара из данных для рендеринга корзины:

function deleteFromCartData(id) {
  var item = cartItems[id];
  if (!item) {
    return;
  }
  var action = item.total_qty && item.total_qty > 0 ? item.action_name : 'Нет в наличии';
  if (!action) {
    return;
  }
  delete cartData[action].items[id];
  if (isEmptyObj(cartData[action].items)) {
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

// Получение списка всех выбранных товаров из данных корзины (за исключением проданных):

function getCheckedId() {
  var list = [];
  getEl('#cart-full').querySelectorAll('.cart-row:not(.sold):not(.bonud).checked').forEach(el => {
    list.push(el.dataset.id);
  });
  // for (var id in cart) {
  //   var checker = cart[id].checker ? cart[id].checker : 0;
  //   if (checker > 0) {
  //     list.push(id);
  //   }
  // }
  return list;
}

//=====================================================================================================
// Подсчет корзины:
//=====================================================================================================

// Подсчет по корзине (всей корзины целиком или только выбранных элементов):

function countFromCart(idList = undefined, totals = true, soldOut = true) {
  var qty = 0,
      sum = 0,
      sumOpt = 0;

  if (totals) {
    var sumRetail = 0,
        orders = [],
        itemsForOrderDiscount = [],
        sumForOrderDiscount = 0;
  } else {
    var bonusQty = 0,
        bonusId = 0;
  }

  if (!isEmptyObj(cart)) {
    var curItem, curQty, curOrder;
    if (idList) {
      idList.forEach(id => {
        id = id.indexOf('id_') === 0 ? id : 'id_' + id;
        countTotals(id, cart[id]);
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
    if (!curItem || !(curItem.total_qty > 0)) {
      qty += el.qty;
      return;
    }
    if (soldOut) {
      curQty = el.qty;
    } else {
      curQty = el.qty > curItem.total_qty ? curItem.total_qty : el.qty;
    }
    qty += curQty;
    sumOpt += curQty * curItem.price_cur1;

    if (totals) {
      sumRetail += curQty * curItem.price_user1;
      curOrder = orders.find(order => order.title === curItem.action_name);
      if (!curOrder) {
        orders.push({
          title: curItem.action_name,
          id: curItem.action_id,
          qty: 0,
          sum: 0,
          sumOpt: 0,
          sumRetail: 0
        });
        curOrder = orders.find(order => order.title === curItem.action_name);
      }
      curOrder.qty += curQty;
      curOrder.sumOpt += curQty * curItem.price_cur1;
      curOrder.sumRetail += curQty * curItem.price_user1;
    }

    var discount = checkDiscount(curItem, curQty);
    if (!discount || !discount.sum) {
      sum += curQty * curItem.price_cur1;
      if (totals) {
        curOrder.sum += curQty * curItem.price_cur1;
      }
    }
    if (discount) {
      if (discount.sum) {
        sum += discount.sum;
        if (totals) {
          curOrder.sum += discount.sum;
        }
      }
      if (!totals && discount.bonusQty >= 0) {
        bonusQty += discount.bonusQty;
        bonusId = discount.bonusId;
      }
    } else if (totals && actions && actions[cartId]) {
      itemsForOrderDiscount.push(id);
      sumForOrderDiscount += curQty * curItem.price_user1;
    }
  }

  if (totals && sumForOrderDiscount > 0) {
    itemsForOrderDiscount.forEach(id => {
      sum = sum - (cartItems[id].price_user1 * discount.percent / 100);
    });
  }

  var result = {
    qty: qty,
    sum: sum
  };
  if (totals) {
    orders.forEach(el => {
      el.sumDiscount = el.sumOpt - el.sum;
      el.percentDiscount = (el.sumDiscount * 100 / el.sumOpt).toFixed(0);
      el.sum = convertPrice(el.sum);
      el.sumRetail = convertPrice(el.sumRetail);
      el.sumDiscount = convertPrice(el.sumDiscount);
      el.isDiscount = el.sumDiscount == 0 ? 'displayNone' : '';
      el.isPrepaid = pageId.indexOf('preorder') == 0 ? '' : 'displayNone';
      el.isDate = pageId.indexOf('preorder') == 0 ? '' : 'displayNone';
      el.date = el.isDate ? '' : getDateStr(getDateExpires(5));
    });
    result.orders = orders.sort(sortBy('title'));
    result.sumRetail = sumRetail;
    result.sumDiscount = sumOpt - sum;
    result.percentDiscount = (result.sumDiscount * 100 / sumOpt).toFixed(0);
  } else {
    result.percentDiscount = ((sumOpt - sum) * 100 / sumOpt).toFixed(0);
    result.bonusQty = bonusQty;
    result.bonusId = bonusId;
  }
  return result;
}

//=====================================================================================================
// Подсчет скидок: (ДОРАБОТАТЬ actions, а затем доработать подсчет скидок)
//=====================================================================================================

// Проверка скидки на артикул:

// type_discount, discount_from, discount_percent, art_cnt_perc
// price = curItem.price_cur1,
// retailPrice = curItem.price_user1;

function checkDiscount(curItem, qty) {
  if (!actions || !curItem.action_id) {
    return null;
  }
  var action = actions[curItem.action_id];
  if (action && action.type_discount) {
    switch (action.type_discount) {
      case 'proc':
        return numMinusProc(action.art_cnt_perc, curItem, qty);
      // case 'numplusnum':
      //   return numPlusNum(action, qty, price);
      // case 'numplusart':
      //   return numPlusArt(action, qty);
      // case 'numkorobkaskidka':
      //   return numKorobka();
      // case 'numupakovka':
      //   return numUpakovka();
    }
  } else {
    return null;
  }
}

// Расчет скидки "покупаешь определенное кол-во - скидка в % от РРЦ":

function numMinusProc(condition, curItem, qty) {
  if (!condition) {
    return null;
  }
  for (var el of condition) {
    if (el[0].toLowerCase() === curItem.articul.toLowerCase()) {
      var price = curItem.price_cur1,
          retailPrice = curItem.price_user1,
          rest = qty % el[1];
      return {sum: (qty - rest) * (retailPrice - retailPrice * (el[2] / 100)) + (rest * price)};
    }
  }
  return null;
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
  if (!totals) {
    totals = countFromCart();
    console.log(totals);
  }
  var qty = totals.qty,
      sum = totals.sum;
  fillCartInHeader(qty, sum, '#carts', 'cart');
  fillCartInHeader(qty, sum, '#catalogs', 'catalogs');
  fillCartInHeader(qty, sum, '#mob-catalogs', 'catalogs');
  changeCartName(qty);
}

// Заполнение конкретной корзины в шапке сайта данными:

function fillCartInHeader(qty, sum, area, type) {
  area = getEl(area);
  if (!area) {
    return;
  }
  var curCart = getEl(`.cart-${cartId}`, area),
      cartQty = getEl('.qty', curCart),
      cartSum = getEl('.sum span', curCart);
  if (cartSum) {
    cartSum.textContent = convertPrice(sum);
  }
  if (qty > 0) {
    if (qty > 99) {
      cartQty.textContent = type === 'cart' ? '99' : '99+';
    } else {
      cartQty.textContent = qty;
    }
    curCart.classList.add('full');
  } else {
    cartQty.textContent = qty;
    curCart.classList.remove('full');
  }
  if (type === 'cart') {
    var sum = 0;
    cartTotals.forEach(el => {
      if (!el.id) {
        return;
      }
      sum += el.sum;
    });
    getEl('.totals span', area).textContent = convertPrice(sum);
  }
}

// Изменение информации о корзине в заголовке страницы:

function changeCartName(qty) {
  var cartName = getEl('#cart-name');
  if (cartName) {
    if (!qty) {
      var curTotal = cartTotals.find(el => el.id === cartId);
      qty = curTotal ? curTotal.qty : 0;
    };
    if (qty == 0) {
      cartName.textContent = 'Корзина: пуста';
    } else {
      cartName.innerHTML = `<div>Корзина: ${getEl('.topmenu-item.active').textContent}<span class="mobile-hide">&ensp;-&ensp;</span></div><div>${qty} ${declOfNum(qty, ['товар', 'товара', 'товаров'])}</div>`
    }
  }
}

//=====================================================================================================
// Изменение данных о количестве в карточках товара и корзине:
//=====================================================================================================

// Получение списка id товаров из верстки:

function getIdList(area) {
  var list;
  if (area.classList.contains('card')) {
    // список всех id в карточке товара:
    list = area.querySelectorAll('.choiced-qty');
  } else {
    // список id, выбранных в секции корзины:
    list = area.querySelectorAll('.cart-row:not(.bonus).checked');
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
    curEl.classList.remove('attention');
    changeCartRow(curEl);
  }
}

// Изменение информации в карточке товара:

function changeCard(card) {
  var selectInfo = getEl('.select-info', card),
      bonusRow = getEl('.bonus', selectInfo),
      idList = getIdList(card),
      totals = countFromCart(idList, false, false);

  if (bonusRow && totals.bonusQty) {
    var bonusItem = cartItems[totals.bonusId];
    if (bonusItem) {
      getEl('.bonus-qty span', bonusRow).textContent = totals.bonusQty;
      getEl('.bonus-img', bonusRow).src = bonusItem.image;
      checkMedia(getEl('img', bonusRow));
      showElement(bonusRow, 'flex');
    }
  } else {
    hideElement(bonusRow);
  }

  if (totals.qty >= 0) {
    getEl('.select-qty span', card).textContent = totals.qty;
    getEl('.select-sum span', card).textContent = convertPrice(totals.sum);
  }
  // if (totals.qty > 0) {
  //   selectInfo.classList.add('show');
  // } else {
  //   selectInfo.classList.remove('show');
  // }
}

// Изменение информации в строке корзины:

function changeCartRow(row) {
  if (row.closest('.sold') || row.classList.contains('bonus')) {
    return;
  }
  var curSection = row.closest('.cart-section'),
      input = getEl('.choiced-qty', row),
      id = input.dataset.id,
      totals = countFromCart([id], false, false),
      sum = convertPrice(totals.sum);

  getEl('.discount', row).textContent = totals.percentDiscount > 0 ? totals.percentDiscount + '%' : '';
  getEl('.sum span', row).textContent = sum;
  changeCartRowCopy(id, totals.qty, sum);
  changeCartSectionInfo(curSection);
  if (!curSection.classList.contains('search')) {
    changeCheckoutInfo();
  }

  if (totals.bonusId) {
    var bonusRow = getEl(`.cart-row.bonus[data-parent-id="${id}"]`);
    if (totals.bonusQty > 0) {
      var qty = totals.bonusQty;
      if (bonusRow) {
        getEl('.qty .bonus span', bonusRow).textContent = qty;
      } else {
        createCartRow('id_' + bonusId, qty, row, 'bonus');
        bonusRow = row.nextElementSibling;
        checkMedia(getEl('img', bonusRow));
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

// Изменение информации в строке корзины для копирования:

function changeCartRowCopy(id, qty, sum) {
  var copyRow = getEl(`#cart-table tr[data-id="${id}"]`);
  if (copyRow) {
    getEl('.qty', copyRow).textContent = qty;
    getEl('.sum', copyRow).textContent = sum;
  }
}

//=====================================================================================================
// Работа элементов корзины:
//=====================================================================================================

// Изменение информации о заказах и блокировка/разблокировка кнопки оформления заказа:

function changeCheckoutInfo() {
  var totals = countFromCart(getCheckedId(), true, false),
      info = getEl('#checkout-info'),
      btn = getEl('#checkout-btn');
  getEl('.qty', info).textContent = getCheckoutInfo(totals.orders.length);
  getEl('.sum', info).textContent = convertPrice(totals.sum);
  if (totals.sum) {
    info.style.visibility = 'visible';
    btn.classList.remove('disabled');
  } else {
    info.style.visibility = 'hidden';
    btn.classList.add('disabled');
  }
}

// Изменение информации о заказе:

function fillCheckout() {
  var totals = countFromCart(getCheckedId(), true, false),
      warnblock = getEl('#checkout .warnblock'),
      ordersQty = totals.orders.length;
  if (ordersQty > 1) {
    getEl('.qty', warnblock).textContent = getCheckoutInfo(ordersQty);
    showElement(warnblock, 'flex');
  } else {
    hideElement(warnblock);
  }
  getEl('#checkout .totals .sum').textContent = convertPrice(totals.sum);
  getEl('#checkout .totals .orders-qty').textContent = ordersQty;
  getEl('#checkout .totals .sum-retail').textContent = convertPrice(totals.sumRetail);
  getEl('#checkout .totals .sum-discount').textContent = convertPrice(totals.sumDiscount);
  fillTemplate({
    area: '#order-details',
    items: totals.orders
  });
}

// Создание актуальной инфомации о количестве и сумме заказов:

function getCheckoutInfo(qty) {
  return declOfNum(qty, ['создан', 'создано', 'создано']) + ' ' + qty + ' ' + declOfNum(qty, ['заказ', 'заказа', 'заказов']);
}

// Изменение чекбокса и информации о количестве и сумме в секции корзины:

function changeCartSectionInfo(cartSection) {
  if (!cartSection) {
    return;
  }
  var mainCheckbox = getEl('.head .checkbox', cartSection),
      totals = countFromCart(getIdList(cartSection), false, false);
  getEl('.select-qty span', cartSection).textContent = totals.qty;
  getEl('.select-sum span', cartSection).textContent = convertPrice(totals.sum);
  if (!getEl('.cart-row:not(.bonus):not(.checked)', cartSection)) {
    mainCheckbox.classList.add('checked');
  } else {
    mainCheckbox.classList.remove('checked');
  }
}

// Выделение/снятие пунктов корзины:

function toggleInCart(event) {
  var cartSection = event.currentTarget.closest('.cart-section'),
      curRow = event.currentTarget.closest('.cart-row'),
      checker;
  if (curRow) {
    if (!curRow.classList.contains('bonus')) {
      checker = curRow.classList.contains('checked') ? 0 : 1;
      toggleCartRow(curRow, checker);
    }
  } else {
    var mainCheckbox = getEl('.head .checkbox', cartSection);
    checker = mainCheckbox.classList.contains('checked') ? '0' : '1';
    cartSection.querySelectorAll('.cart-row:not(.bonus)').forEach(row => toggleCartRow(row, checker));
  }
  changeCartSectionInfo(cartSection);
  if (!cartSection.classList.contains('search')) {
    changeCheckoutInfo();
  }
}

// Выделение/снятие одного пункта корзины:

function toggleCartRow(row, checker) {
  if (checker > 0) {
    row.classList.add('checked');
  } else {
    row.classList.remove('checked');
  }
  // saveCheckerInCart(row.dataset.id, checker);
}

// Удаление данных из корзины:

function deleteFromCart(event) {
  var btn = event.currentTarget,
      curRow = btn.closest('.cart-row:not(.bonus)'),
      question = curRow ? 'Удалить данный товар из корзины' : event.currentTarget.closest('.search') ? 'Удалить найденное из корзины' : 'Удалить данный раздел из корзины';
  alerts.confirm(question, function() {
    var cartSection = btn.closest('.cart-section'),
        cartList = getEl('#cart-full');
    if (curRow) {
      // Удаление одного пункта корзины:
      deleteCartRow(curRow.dataset.id);
      if (cartSection) {
        cartSection.removeChild(curRow);
      } else {
        cartList.removeChild(curRow);
      }
      var bonusRow = getEl(`.cart-row.bonus[data-parent-id="${curRow.dataset.i}"]`);
      if (bonusRow && cartSection) {
        cartSection.removeChild(bonusRow);
      }
      if (cartSection && !cartSection.querySelectorAll('.cart-row').length) {
        cartList.removeChild(cartSection);
        cartSection = null;
      }
    } else {
      // Удаление секции корзины:
      cartSection.querySelectorAll('.cart-row').forEach(el => {
        deleteCartRow(el.dataset.id);
      });
      cartList.removeChild(cartSection);
      cartSection = null;
    }
    if (isEmptyObj(cart)) {
      hideElement('#header-cart');
      hideElement('#cart-full');
      showElement('#cart-empty', 'flex');
    } else {
      if (cartSection) {
        changeCartSectionInfo(cartSection);
      } else {
        if (!cartList.querySelectorAll('.cart-row').length) {
          clearSearch('#cart-search');
          createCart();
        }
      }
    }
    changeCheckoutInfo();
  })
}

// Удаление одного пункта корзины:

function deleteCartRow(id) {
  saveInCart(id, 0);
  var copyRow = getEl(`#cart-table tr[data-id="${id}"]`);
  if (copyRow) {
    getEl('#cart-table').removeChild(copyRow);
  }
}

// Поиск по корзине:

function findInCart(search, textToFind) {
  var data;
  if (textToFind) {
    data = {
      'search': {
        action_name: 'Результаты поиска',
        items: [],
        type: 'search'
      }
    }
    cartData = sortObjByKey(cartData);
    moveToEndObj(cartData, 'Нет в наличии');
    var regExp = getRegExp(textToFind);
    for (var key in cartData) {
      for (var id in cartData[key].items) {
        if (findByRegExp(cartData[key].items[id].search, regExp)) {
          data.search.items.push(cartData[key].items[id]);
        }
      }
    }
  }
  createCart(data);
  if (data) {
    return data.length;
  }
}

//=====================================================================================================
// Загрузка данных в корзину из текстового поля/файла
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
    alerts.show(error);
    return;
  }
  addInCart.forEach(el => {
    saveInCart(el.id, el.qty);
  });
  showCart();
  changeCartInHeader();
  loader.hide();
  closePopUp(null, 'load-container');
  if (addInCart.length < strings.length) {
    alerts.show('При загрузке были найдены не все артикулы.');
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
  sendRequest(urlRequest.main, '???', formData, 'multipart/form-data')
  .then(result => {
    // console.log(result);
    var data = JSON.parse(result);
    if (data.cart) {
      cart[cartId] = data.cart[cartId];
      closePopUp(null, 'load-container');
      showCart();
      changeCartInHeader();
    } else {
      alerts.show('Файл не загружен. Неверный формат данных.');
      showElement(loadBtn);
      hideElement(submitBtn);
    }
    loader.hide();
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Файл не загружен. Ошибка сервера.');
    showElement(loadBtn);
    hideElement(submitBtn);
  })
}

//=====================================================================================================
// Копирование корзины:
//=====================================================================================================

function copyCart() {
  var cartCopy = getEl('#cart-copy textarea');
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

//=====================================================================================================
// Работа с формой заказа:
//=====================================================================================================

// Открытие формы заказа:

function openCheckout(event) {
  if (event.currentTarget.classList.contains('disabled')) {
    return;
  }
  if (!userData.contr) {
    alerts.show('Оформление заказа невозможно: отсутствуют активные контрагенты!<br>Перейдите в раздел <a href="http://new.topsports.ru/contractors">Контрагенты</a> для их добавления/включения.');
    return;
  }
  if (!userData.address) {
    alerts.show('Внимание: отсутствуют активные адреса!<br>Перейдите в раздел <a href="http://new.topsports.ru/addresses">Мои адреса</a> для их добавления/включения.');
    getEl('#order-form .activate.delivery .item[data-value="2"]').style.display = 'none';
    getEl('#order-form .activate.delivery .item[data-value="3"').style.display = 'none';
  }
  // togglePaymentChoice();
  toggleAddressField();
  fillCheckout();
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
}

// Блокировка/разблокировка чекеров выбора способа оплаты:

function togglePaymentChoice() {
  // var paymentType = getEl('#payment'),
  //     paymentChoice = getEl('#payment-choice');
  // if (paymentType.value) {
  //   paymentChoice.removeAttribute('disabled');
  //   paymentChoice.querySelectorAll('input').forEach(el => el.removeAttribute('disabled'));
  // } else {
  //   paymentChoice.setAttribute('disabled', 'disabled');
  //   paymentChoice.querySelectorAll('input').forEach(el => el.setAttribute('disabled', 'disabled'));
  // }
}

// Блокировка/разблокировка поля выбора адреса доставки:

function toggleAddressField() {
  var deliveryType = getEl('#delivery'),
      address = getEl('#address'),
      formWrap = address.closest('.form-wrap'),
      title = getEl('.title', formWrap);
  if (deliveryType.value === '2' || deliveryType.value === '3') {
    address.removeAttribute('disabled');
    formWrap.setAttribute('required', 'required');
    title.textContent = 'Адрес доставки*';
  } else {
    addressDropdown.clear();
    address.setAttribute('disabled', 'disabled');
    formWrap.removeAttribute('required', 'required');
    title.textContent = 'Адрес доставки';
  }
}
