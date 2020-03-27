'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Элементы DOM для работы с ними:

var cartFull = document.getElementById('cart-full'),
    cartEmpty = document.getElementById('cart-empty'),
    cartMakeOrder = document.querySelector('.cart-make-order'),
    deleteBtn = document.getElementById('delete-btn'),
    orderBtn = document.getElementById('order-btn'),
    orderForm = document.getElementById('order-form'),
    checkAllBtn = document.getElementById('check-all'),
    cartRows = document.getElementById('cart-rows'),
    cartTable = document.getElementById('cart-table');

// Получение шаблонов из HTML:

var cartRowTemplate = cartRows.innerHTML,
    cartTableRowTemplate = cartTable.querySelector('tr').outerHTML;

// Динамические переменные:

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
      var product = JSON.parse(result);
      resolve(product);
    })
    .catch(error => {
      reject(error);
    })
  });
}

// // Отправка данных корзины на сервер (корзины целиком):

// function cartSentServer() {
//   clearTimeout(cartTimer);
//   cartTimer = setTimeout(function () {
//     sendRequest(`${urlRequest.api}baskets/set_cart.php`, cart[cartId])
//     .then(response => {
//       console.log(response);
//     })
//     .catch(err => {
//       console.log(err);
//       // cartSentServer();
//     })
//   }, cartTimeout);
// }

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
  .then(response => {
    deleteFormCart(idList);
    // document.location.href = "../orders";
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
  if (!data.length) {
    changeCartInHeader(countFromCart());
  } else {
    getItems(data)
    .then(
      result => {
        result.forEach(item => convertItem(item));
        items.push(result);
      },
      reject => {
        console.log(reject);
        checkFullnessItems();
      }
    )
  }
}

// Изменение информации о корзине в шапке сайта:

function changeCartInHeader(totals) {
  var qty = totals.qty,
      sum = totals.amountResult,
      headerCart = getEl('header-cart'),
      headerQty = getEl('.qty', headerCart),
      headerSum = getEl('.sum span', headerCart),
      catalogCart = getEl(`cart-${cartId}`),
      catalogQty = getEl('.qty', catalogCart);

  headerSum.textContent = sum.toLocaleString('ru-RU');
  if (website === 'skipper') {
    headerQty.textContent = qty;
  } else {
    if (qty > 0) {
      if (qty > 99) {
        headerQty.textContent = '99';
        catalogQty.textContent = '99+';
      } else {
        headerQty.textContent = qty;
        catalogQty.textContent = qty;
      }
      catalogQty.classList.add('full');
      showElement(headerQty);
    } else {
      catalogQty.classList.remove('full');
      hideElement(headerQty);
    }
  }
}

// Сохранение в корзину с отправкой на сервер всей корзины:

// function saveInCart(id, qty, options) {
//   id = 'id_' + id;
//   if (!cart[cartId]) {
//     cart[cartId] = {};
//   }
//   if (qty) {
//     if (cart[cartId][id] && cart[cartId][id].qty == qty) {
//       return;
//     }
//     if (!cart[cartId][id]) {
//       cart[cartId][id] = {};
//     }
//     cart[cartId][id].id = id.replace('id_', '');
//     cart[cartId][id].qty = qty;
//     cart[cartId][id].cartId = cartId;
//     cart[cartId][id].actionName = '';

//     for (let key in options) {
//       cart[cartId][id][key] = options[key];
//       if (key == 'actionId' && actions && actions[options[key]]) {
//         cart[cartId][id].actionName = actions[options[key]].title;
//       }
//     }
//   } else {
//     if (cart[cartId][id]) {
//       delete cart[cartId][id];
//     } else {
//       return;
//     }
//   }
//   saveCartTotals();
//   cartSentServer();
// }

// Сохранение в корзину с отправкой на сервер только изменившихся данных:

function saveInCart(id, qty, options) {
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
  cart[cartId][id].actionName = '';

  for (let key in options) {
    cart[cartId][id][key] = options[key];
    if (key == 'actionId' && window.actions && actions[options[key]]) {
      cart[cartId][id].actionName = actions[options[key]].title;
    }
  }
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
  // cartSentServer();
}

// Сохранение данных об итогах корзины:

function saveCartTotals() {
  var totals = countFromCart();
  cartTotals.forEach(el => {
    if (el.id === cartId) {
      el.qty = totals.qty;
      el.sum = totals.amountResult;
    }
  });
  changeCartInHeader(totals);
  changeCartName(totals.qty);
}

//=====================================================================================================
// Подсчет корзины:
//=====================================================================================================

// Подсчет по корзине:

function countFromCart(idList = undefined, isTotals = true) {
  var info = cart[cartId],
      curId,
      curItem,
      curQty,
      qty = 0,
      amountOpt = 0,
      amountResult = 0,
      amountRetail = 0,
      bonusQty = 0,
      bonusId = 0,
      orderSum = 0,
      amountDiscount = 0,
      percentDiscount = 0;

  if (info) {
    if (!idList) {
      for (let id in info) {
        if (cartItems[id]) {
          countTotals(id, info[id]);
        }
      }
    } else {
      idList.forEach(id => {
        curId = 'id_' + id;
        if (info[curId]) {
          countTotals(curId, info[curId]);
        }
      });
    }
  }

  function countTotals(id, el) {
    curItem = cartItems[id];
    curQty = el.qty > curItem.total_qty ? curItem.total_qty : el.qty;
    qty += curQty;
    amountOpt += curQty * curItem.price_cur1;
    amountRetail += curQty * curItem.price_user1;
    var discount = checkDiscount(el.id, qty);
    if (discount && discount.price) {
      amountResult += discount.price;
    } else {
      amountResult += curQty * curItem.price_cur1;
    }
    if (!isTotals) {
      if (discount && discount.bonusQty >= 0) {
        bonusQty += discount.bonusQty;
        bonusId = discount.bonusId;
      }
    } else {
      if (discount && discount.sum) {
        orderSum += curQty * discount.sum;
      }
      if (orderSum > 0) {
        discount = sumLessProc(orderSum);
        amountDiscount = discount.amount;
        percentDiscount = discount.percent;
      }
    }
  }

  var result = {};
  result.qty = qty;
  if (isTotals) {
    result.amountResult = amountResult;
    result.amountRetail = amountRetail;
    result.amountDiscount = amountDiscount;
    result.percentDiscount = percentDiscount;
  } else {
    result.amount = amountResult;
    result.bonusQty = bonusQty;
    result.bonusId = bonusId;
  }
  return result;
}

//=====================================================================================================
// Подсчет скидок:
//=====================================================================================================

// Проверка скидки на артикул:
// !!! ПЕРЕДЕЛАТЬ НА ИСПОЛЬЗОВАНИЕ actions/preorders

function checkDiscount(id, qty) {
  // var discount = findDiscount(id),
  //     curItem = cartItems['id_' + id],
  //     price = curItem.price_cur1,
  //     retailPrice = curItem.price_user1;
  // if (discount) {
  //   switch (discount.dtype) {
  //     case 'numplusnum':
  //       return numPlusNum(discount, qty, price);
  //       break;
  //     case 'numplusart':
  //       return numPlusArt(discount, qty);
  //       break;
  //     case 'numminusproc':
  //       return numMinusProc(discount, qty, price, retailPrice);
  //       break;
  //     case 'numkorobkaskidka':
  //       return numKorobka();
  //       break;
  //     case 'numupakovka':
  //       return numUpakovka();
  //       break;
  //     case 'sumlessproc':
  //       return {sum: retailPrice};
  //       break;
  //   }
  // } else {
  //   return undefined;
  // }
}

// Расчет скидки "покупаешь определенное кол-во - из него определенное кол-во в подарок":

function numPlusNum(discount, qty, price) {
  return {price: (qty - findBonus(discount, qty)) * price};
}

// Расчет скидки "покупаешь определенное кол-во - определенное кол-во другого артикула в подарок":

function numPlusArt(discount, qty) {
  return {
    bonusQty: findBonus(discount, qty),
    bonusId: discount.diartex
  }
}

// Расчет количества бонусов:

function findBonus(discount, qty) {
  return Math.floor(qty / discount.dnv) * discount.dnvex;
}

// Расчет скидки "покупаешь определенное кол-во - скидка в % от РРЦ":

function numMinusProc(discount, qty, price, retailPrice) {
  var rest = qty % discount.dnv;
  return {price: (qty - rest) * (retailPrice - retailPrice * discount.dnvex / 100) + (rest * price)};
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
    result.amount = sum * discount.dnvex[current] / 100;
    result.percent = discount.dnvex[current];
    return result;
  } else {
    return undefined;
  }
}

//=====================================================================================================
// Проверка скидок:
//=====================================================================================================

// Проверка наличия акции на товар:

function findDiscount(id) {
  if (!discounts) {
    return 0;
  }
  var discount = discounts.find(item => {
    if (item.diart) {
      for (let key of item.diart) {
        return key == id ? true : false;
      }
    }
  });
  if (!discount) {
    discount = discounts.find(item => !item.diart && checkCondition(item.dcondition));
  }
  if (!discount) {
    return 0;
  }
  var relevance = true;
  if (discount.ddatestart && discount.ddateend) {
    relevance = checkDate(discount.ddatestart, discount.ddateend)
  }
  if (relevance) {
    return discount;
  }
}

// Проверка условия скидки:

function checkCondition(condition) {
  if (condition.cartId == cartId) {
    return true;
  }
  return false;
}

// Добавление информации об акции в элемент:

function checkAction(curEl) {
  if (!window.actions) {
    return;
  }
  var actionId = curEl.dataset.actionId,
  curAction = actions[actionId];
  if (!curAction) {
    if (curEl.classList.contains('cart-row')) {
      curEl.querySelector('.action .value').textContent = 'Склад';
    }
    return;
  }

  if (curEl.classList.contains('cart-row')) {
    curEl.classList.add('discount');
    curEl.querySelector('.action .value').textContent = curAction.title;
  }

  if (curEl.classList.contains('card')) {
    curEl.querySelector('.card-action').classList.remove('hidden');

    var title = curEl.querySelector('.action-title');
    title.textContent = curAction.title;
    title.style.backgroundColor = '#' + curAction.color;

    var date = curEl.querySelector('.action-date');
    if (date && curAction.expire) {
      date.querySelector('span').textContent = curAction.expire;
      showElement(date);
    }

    if (curAction.descr) {
      title.setAttribute('tooltip', curAction.descr.replace(/<br>/gi, ''));
      title.setAttribute('align', 'left');
      var desc = curEl.querySelector('.action-desc');
      if (desc) {
        desc.querySelector('.text').innerHTML = curAction.descr;
        showElement(desc);
      }
    }
  }
}

//=====================================================================================================
// Изменение данных о количестве:
//=====================================================================================================

// Вывод информации о корзине в карточке товара:

function checkCart(card) {
  if (card.classList.contains('min-card')) {
    var cartInfo = card.querySelector('.cart');
    if (cartInfo) {
      var curProduct = curItems.find(item => item.object_id == card.dataset.id),
          sizeInfo = curProduct.sizes && curProduct.sizes != 0 ? curProduct.sizes : '',
          totalQty = 0;
      if (sizeInfo) {
        for (let el in sizeInfo) {
          totalQty += getQty(sizeInfo[el].object_id);
        }
      } else {
        totalQty += getQty(curProduct.object_id);
      }
      var qty = cartInfo.querySelector('.qty');
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
      input = size.querySelector('.choiced-qty');
      qty = getQty(input.dataset.id);
      input.value = qty;
      changeColors(size.querySelector('.qty'), qty);
      changeNameBtn(size.querySelector('.name.click'), qty);
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
  } else {
    qty = 0;
  }
  return qty = qty > totalQty ? totalQty : qty;
}

// Выбор количества пользователем:

function changeCart(event) {
  var current = event.currentTarget,
      curEl = current.closest('.manage'),
      sign = current.textContent,
      qtyWrap = current.closest('.qty'),
      input = qtyWrap.querySelector('.choiced-qty'),
      qty = parseInt(input.value, 10),
      id = input.dataset.id,
      actionId = curEl.dataset.actionId,
      totalQty = cartItems['id_' + id].total_qty;

  qty = changeValue(sign, qty, totalQty);
  input.value = qty;
  saveInCart(id, qty, {actionId: actionId});
  changeColors(qtyWrap, qty);
  if (curEl.classList.contains('card')) {
    var clicable = qtyWrap.querySelector('.name.click');
    changeNameBtn(clicable, qty);
    changeCardInfo(curEl);
    if (curEl.classList.contains('full-card')) {
      checkCart(gallery.querySelector(`.card[data-id="${curEl.dataset.id}"]`));
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
  var selectInfo = card.querySelector('.select-info'),
      bonusRow = selectInfo.querySelector('.bonus'),
      idList = Array.from(card.querySelectorAll('.choiced-qty')).map(item => item.dataset.id),
      totals = countFromCart(idList, false);

  if (bonusRow && totals.bonusQty) {
    var curItem = cartItems[totals.bonusId];
    bonusRow.querySelector('.bonus-qty span').textContent = totals.bonusQty;
    bonusRow.querySelector('.bonus-img').src = `http://b2b.topsports.ru/c/productpage/${curItem.image}.jpg`;
    checkImg(bonusRow);
    showElement(bonusRow, 'flex');
  } else {
    hideElement(bonusRow);
  }

  if (totals.qty > 0) {
    card.querySelector('.select-qty span').textContent = totals.qty;
    card.querySelector('.select-sum span').textContent = totals.amount.toLocaleString('ru-RU');
    selectInfo.style.visibility = 'visible';
  } else {
    selectInfo.style.visibility = 'hidden';
  }
}

// Изменение информации в строке корзины:

function changeCartRow(row) {
  if (row.classList.contains('not-available')) {
    return;
  }
  checkAction(row);
  var input = row.querySelector('.choiced-qty'),
      id = input.dataset.id,
      tableRow = cartTable.querySelector(`:not(.bonus)[data-id="${id}"]`),
      totals = countFromCart([id], false);

  row.querySelector('.total .value').textContent = totals.amount.toLocaleString('ru-RU');

  tableRow.querySelector('.qty').textContent = parseInt(input.value ,10);
  tableRow.querySelector('.total').textContent = totals.amount;

  if (totals.bonusQty >= 0) {
    var bonusRow = document.querySelector(`.cart-row.bonus[data-parent-id="${id}"]`);
    if (bonusRow) {
      var bonusId = bonusRow.dataset.id;
    }
    if (totals.bonusQty > 0) {
      var qty = totals.bonusQty;
      if (bonusRow) {
        bonusRow.querySelector('.amount .bonus span').textContent = qty;
        cartTable.querySelector(`.bonus[data-id="${bonusId}"] .qty`).textContent = qty;
      } else {
        row.insertAdjacentHTML('afterend', createCartRow('id_' + totals.bonusId, qty, true));
        bonusRow = row.nextElementSibling;
        checkImg(bonusRow);
        bonusRow.dataset.parentId = id;
        bonusRow.dataset.actionId = row.dataset.actionId;
        bonusRow.querySelector('.action .value').textContent = row.querySelector('.action .value').textContent;
        if (!row.classList.contains('checked')) {
          bonusRow.classList.remove('checked');
        }
        tableRow.insertAdjacentHTML('afterend', createCartTableRow('id_' + totals.bonusId, qty));
        tableRow.nextElementSibling.classList.add('bonus');
      }
    } else {
      if (bonusRow) {
        cartRows.removeChild(bonusRow);
        cartTable.firstChild.removeChild(cartTable.querySelector(`.bonus[data-id="${bonusRow.dataset.id}"]`));
      }
    }
  }
}

// Изменение общей информации о корзине:

function changeCartInfo() {
  var idList = getIdList(),
      cartInfo = document.getElementById('cart-info'),
      cartQty = cartInfo.querySelector('.qty'),
      cartAmountRetail = cartInfo.querySelector('.amount-retail'),
      cartAmountOpt = cartInfo.querySelector('.amount-opt'),
      cartDiscount = cartInfo.querySelector('.cart-discount');
  if (idList) {
    var totals = countFromCart(idList);
    cartQty.textContent = totals.qty;
    showElement(cartMakeOrder, 'flex');

    if (totals.qty > 0) {
      cartAmountOpt.textContent = totals.amountResult.toLocaleString('ru-RU');
      cartAmountRetail.textContent = totals.amountRetail.toLocaleString('ru-RU');
      if (totals.amountDiscount) {
        cartDiscount.querySelector('.discount-amount').textContent = totals.amountDiscount.toLocaleString('ru-RU');
        cartDiscount.querySelector('.discount-percent').textContent = totals.percentDiscount;
        showElement(cartDiscount);
      } else {
        hideElement(cartDiscount);
      }
    }
    return;
  } else {
    var notAvailable = cartRows.querySelectorAll('.cart-row.checked.not-available');
    if (notAvailable.length > 0) {
      showElement(cartMakeOrder, 'flex');
      hideElement(orderBtn);
    } else {
      hideElement(cartMakeOrder);
    }
    cartQty.textContent = 0;
  }
  cartAmountOpt.textContent = 0;
  cartAmountRetail.textContent = 0;
  hideElement(cartDiscount);
}

// Получение списка id товаров, выбранных в корзине:

function getIdList() {
  var selectedRows = cartRows.querySelectorAll('.cart-row.checked:not(.bonus):not(.not-available)');
  if (selectedRows.length === 0) {
    return undefined;
  }
  return Array.from(selectedRows).map(item => item.dataset.id);
}

//=====================================================================================================
// Отображение контента корзины:
//=====================================================================================================

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

// Отображение контента корзины:

function renderCart() {
  changeContent('cart');
  showElement('cart-name');
  if (createCartList(cart[cartId])) {
    checkAllBtn.classList.add('checked');
    document.querySelectorAll('.cart-row').forEach(row => {
      changeCartRow(row);
    });
    closeOrderForm();
    changeCartInfo();
    hideElement(cartEmpty);
    showElement(cartFull);
  }
  showElement('cart');
}

// Создание списка товаров корзины:

function createCartList(data) {
  var cartList = '',
      cartTableList = '',
      newItem,
      qty;
  for (var id in data) {
    qty = data[id].qty;
    newItem = createCartRow(id, qty);
    cartList += newItem;
    newItem = createCartTableRow(id, qty);
    cartTableList += newItem;
  }
  if (!cartList) {
    hideElement(cartFull);
    showElement(cartEmpty);
  } else {
    cartRows.innerHTML = cartList;
    document.querySelectorAll('.cart-row').forEach(row => {
      checkImg(row);
    });
    cartTable.innerHTML = cartTableList;
  }
  return cartList;
}

// Создание одной строки корзины:

function createCartRow(id, qty, isBonus = false) {
  var curItem = cartItems[id],
      newRow = cartRowTemplate,
      options = '',
      status = '';
  if (!curItem) {
    return;
  }
  if (curItem.size) {
    options = `(${curItem.options[40]}, ${curItem.size})`;
  }
  if (curItem.total_qty > 0) {
    var totalQty = parseInt(curItem.total_qty, 10),
        qty = qty > totalQty ? totalQty : qty;
  } else {
    status = 'not-available';
  }
  if (isBonus) {
    status = 'bonus';
  }

  if (status === 'bonus') {
    newRow = newRow
      .replace('#bonus#', qty)
      .replace('#price_cur#', 'Подарок');
  } else if (status === 'not-available') {
    newRow = newRow
      .replace('#price_cur#', '0');
  }
  newRow = newRow
  .replace('#status#', status)
  .replace('#options#', options)
  .replace('#qty#', qty)
  .replace('#isFree#', curItem.free_qty > 0 ? '' : 'displayNone')
  .replace('#isArrive#', curItem.arrive_qty > 0 ? '' : 'displayNone')
  .replace('#isWarehouse#', curItem.warehouse_qty > 0 ? '' : 'displayNone');
  newRow = createElByTemplate(newRow, curItem);
  return newRow;
}

// Создание одной строки корзины для копирования:

function createCartTableRow(id, qty) {
  var curItem = cartItems[id],
      totalQty = parseInt(curItem.total_qty, 10);
  if (!curItem) {
    return;
  }
  var newRow = cartTableRowTemplate
    .replace('#qty#', qty > totalQty ? totalQty : qty);
  newRow = createElByTemplate(newRow, curItem);
  return newRow;
}

//=====================================================================================================
// Работа с данными корзины:
//=====================================================================================================

// Загрузка корзины из текстового поля:

function loadInCart() {
  var loadText = document.getElementById('load-text');
  if (!loadText.value || !/\S/.test(loadText.value)) {
    return;
  }
  var addInCart = [],
      error = '',
      strings, id, qty, totalQty, actionId;

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
        qty = totalQty > 0 && qty > totalQty ? totalQty : qty;
        actionId = curItem.action_id;
        addInCart.push({id: id, qty: qty, options: {actionId: actionId}});
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
    saveInCart(el.id, el.qty, el.options);
  });
  renderCart();
  if (addInCart.length < strings.length) {
    message.show('При загрузке были найдены не все артикулы');
  }
  loadText.value = '';
}

// Копирование корзины:

function copyCart() {
  var cartCopy = document.getElementById('cart-copy');
  cartCopy.textContent = cartTable.outerHTML;
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
    cartRows.querySelectorAll('.cart-row:not(.displayNone)').forEach(row => row.classList.remove('checked'));
    hideElement(cartMakeOrder);
  } else {
    event.currentTarget.classList.add('checked');
    cartRows.querySelectorAll('.cart-row:not(.displayNone)').forEach(row => row.classList.add('checked'));
    showElement(cartMakeOrder, 'flex');
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
  var bonusRow = document.querySelector(`.cart-row[data-parent-id="${curRow.dataset.id}"]`);
  if (bonusRow) {
    bonusRow.classList.toggle('checked');
  }
  if (!cartRows.querySelector('.cart-row:not(.checked)')) {
    checkAllBtn.classList.add('checked');
  } else {
    checkAllBtn.classList.remove('checked');
  }
  changeCartInfo();
}

// Удаление выбранных пунктов:

function deleteSelected() {
  var id;
  if (confirm('Удалить выделенные товары из корзины?')) {
    cartRows.querySelectorAll('.cart-row.checked').forEach(row => {
      cartRows.removeChild(row);
      id = row.dataset.id;
      if (row.classList.contains('bonus')) {
        cartTable.firstChild.removeChild(cartTable.querySelector(`.bonus[data-id="${id}"]`));
      } else {
        cartTable.firstChild.removeChild(cartTable.querySelector(`[data-id="${id}"]`));
        saveInCart(id, 0);
      }
    });
    checkAllBtn.classList.remove('checked');
    changeCartInfo();
    if (cartRows.querySelectorAll('.cart-row').length == 0) {
      showElement(cartEmpty);
      hideElement(cartFull);
    }
  }
}

//=====================================================================================================
// Работа с формой заказа:
//=====================================================================================================

// Как присылал Паша:
// var partnerInfo = {
//   "user_contr": {
//     "472":["ООО \"АСПОРТ\""],
//     "347":["ТРИАЛ-СПОРТ ООО"]},
//   "user_address_list": {
//     "278":["443082, Самара, Тухачевского, 22"],
//     "279":["443079, Самара, Карла Маркса, 177в"],
//     "468":["354392, Россия, Краснодарский край, городской округ Сочи, посёлок городского типа Красная Поляна, улица Мичурина, 1"]
//   }
// };

// Открытие формы заказа:

function openOrderForm() {
  // sendRequest(`${urlRequest.???}???`)
  // .then(result => {
  //   if (result.user_contr) {
  //     var contrData = {
  //       area: 'select-contr',
  //       items: result,
  //       sub: {'user_contr': '.item'},
  //     };
  //     fillTemplate(contrData);
  //   }
  //   if (result.user_address_list) {
  //     var addressData = {
  //       area: 'select-address',
  //       items: result,
  //       sub: {'user_address_list': '.item'},
  //     };
  //     fillTemplate(addressData);
  //   }
  //   showElement(orderForm, 'flex');
  //   hideElement(cartMakeOrder);
  //   document.querySelectorAll('.cart-list').forEach(el => hideElement(el));
  // })
  // .catch(error => {
  //   console.log(error);
  //   // openOrderForm();
  // })

  var partnerInfo = {
    "user_contr": [{
      id: "472",
      title: "ООО \"АСПОРТ\""
    }, {
      id: "347",
      title: "ТРИАЛ-СПОРТ ООО"
    }],
    "user_address_list": [{
      id: "278",
      title: "443082, Самара, Тухачевского, 22"
    }, {
      id: "279",
      title: "443079, Самара, Карла Маркса, 177в"
    }, {
      id: "468",
      title: "354392, Россия, Краснодарский край, городской округ Сочи, посёлок городского типа Красная Поляна, улица Мичурина, 1"
    }]
  };
  var contrData = {
    area: 'select-contr',
    items: partnerInfo,
    sub: {'user_contr': '.item'},
  };
  fillTemplate(contrData);
  var addressData = {
    area: 'select-address',
    items: partnerInfo,
    sub: {'user_address_list': '.item'},
  };
  fillTemplate(addressData);
  showElement(orderForm, 'flex');
  hideElement(cartMakeOrder);
  document.querySelectorAll('.cart-list').forEach(el => hideElement(el));
}

// Закрытие формы заказа:

function closeOrderForm() {
  orderForm.querySelectorAll('select').forEach(el => el.value = '');
  orderForm.querySelectorAll('textarea').forEach(el => el.value = '');
  toggleOrderAddress(orderForm.querySelector('[name="delivery_type"]'));
  hideElement(orderForm, 'flex');
  showElement(cartMakeOrder);
  document.querySelectorAll('.cart-list').forEach(el => showElement(el));
}

// Показ/ скрытие поля выбора адреса доставки:

function toggleOrderAddress(el) {
  var address = orderForm.querySelector('.address'),
      addressSelect = address.querySelector('select');
  if (el.value === '3') {
    addressSelect.required = true;
    showElement(address);
  } else {
    addressSelect.value = '';
    addressSelect.required = false;
    hideElement(address);
  }
}
