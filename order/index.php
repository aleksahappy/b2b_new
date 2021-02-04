<?php include_once "../ver.php";?>

<!DOCTYPE html>
<html lang="ru">
  <head>
    <title>ТОП СПОРТС - Заказ</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="keywords" content="ТОП СПОРТС">
    <meta name="description" content="ТОП СПОРТС">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="icon" href="../img/top_sports_logo_black_short_transparency.png">
    <script src="../js/check_auth.js?<?php echo $ver?>"></script>
    <link rel="stylesheet" type="text/css" href="../css/fonts.css?<?php echo $ver?>">
    <link rel="stylesheet" type="text/css" href="../css/main.css?<?php echo $ver?>">
    <link rel="stylesheet" type="text/css" href="../css/main_media.css?<?php echo $ver?>">
    <link rel="stylesheet" type="text/css" href="index.css?<?php echo $ver?>">
    <link rel="stylesheet" type="text/css" href="index_media.css?<?php echo $ver?>">
  </head>

  <body>
    <div id="main" class="template">
      <div class="container">
        <div id="main-header" class="row">
          <div class="title h0">Заказ #order_number# от #order_date#
            <span class="dot">, </span>
            <span class="name">#contr_name#</span>
          </div>
        </div>
        <div class="info row">
          <div class="main row">
            <div class="side">
              <div class="title h3">Детали заказа</div>
              <div class="row">
                <div class="title">Тип заказа:</div>
                <div class="text">#order_type#</div>
              </div>
              <div class="row">
                <div class="title">Заказчик:</div>
                <div class="text">#user_fio#</div>
              </div>
              <div class="row">
                <div class="title">Статус заказа:</div>
                <div id="order-status" class="text">#order_status#</div>
              </div>
            </div>
            <div class="side">
              <div class="title h3">Параметры доставки</div>
              <div class="row">
                <div class="title">Способ доставки:</div>
                <div class="text">#delivery_type#</div>
              </div>
              <div class="row">
                <div class="title">Отгрузочные документы:</div>
                <div class="text">#shipping_docs#</div>
              </div>
              <div class="row">
                <div class="title">Адрес доставки:</div>
                <div class="text">#order_address#</div>
              </div>
            </div>
          </div>
          <div class="details col">
            <div class="sum">Сумма заказа: <span>#order_sum#</span></div>
            <div class="btns">
              <div class="btn #isShipments#" onclick="openPopUp('#shipments', event)">Отгрузки</div>
              <div class="btn #isPayments#" onclick="openPopUp('#payments', event)">Платежи</div>
            </div>
            <a class="docs row" href="../api.php?action=order&order_id=#id#&mode=bill&type=pdf">
              <div class="download icon"></div>
              <div>Скачать счет</div>
            </a>
          </div>
        </div>
        <div class="more row #isMoreRow#">
          <div class="comment row #isComment#">
            <div class="title">Комментарий:</div>
            <div class="text">#comment#</div>
          </div>
          <div class="btns #isOrderBnts#">
            <div id="cancel" class="btn" onclick="changeOrderStatus(event)">Отменить заказ</div>
            <div id="confirm" class="btn sub-act" onclick="changeOrderStatus(event)">Подтвердить заказ</div>
          </div>
        </div>
        <div class="tabs row">
          <div class="tab nomen c30 checked" data-area="nomen">Итого</div>
          <div class="tab vputi c30" data-area="vputi">Ожидается</div>
          <div class="tab vnali c30" data-area="vnali">В наличии</div>
          <div class="tab sobrn c30" data-area="sobrn">Собран</div>
          <div class="tab otgrz c30" data-area="otgrz">Отгружен</div>
          <div class="tab nedop c30" data-area="nedop">Непоставка</div>
          <div class="tab reclm c30" data-area="reclm">Рекламации</div>
        </div>
        <div id="nomen" class="table active"></div>
        <div id="vputi" class="table"></div>
        <div id="vnali" class="table"></div>
        <div id="sobrn" class="table"></div>
        <div id="otgrz" class="table"></div>
        <div id="nedop" class="table"></div>
        <div id="reclm" class="table"></div>
      </div>
    </div>

    <div id="make-reclm" class="pop-up-container">
      <div class="pop-up">
        <div class="pop-up-title row">
          <div class="title h1">Оформление рекламации</div>
          <div class="close icon"></div>
        </div>
        <div class="pop-up-body">
          <div class="order-info">
            <div>К заказу <a href="../order/?#id#">№#order_number#</a> от #order_date#</div>
            <div>#titl#</div>
            <div class="text midlight">Артикул #artc#</div>
          </div>
          <form id="reclm-form" class="post">
            <input type="hidden" name="code_str" value="#cods#">
            <input type="hidden" name="articul" value="#artc#">
            <input type="hidden" name="item_code_1c" value="#harid#">
            <input type="hidden" name="doc_id" value="#naklid#">
            <input type="hidden" name="nakl" value="#nakl#">
            <input type="hidden" name="nakl_date" value="#dotg#">
            <input type="hidden" name="item_title" value="#titl#">
            <input type="hidden" name="max_otgrz" value="#kolv#">
            <div class="form-cols">
              <div class="form-wrap form-col2" required>
                <div class="title">Категория обращения<span class="req">*</span></div>
                <div class="option row">
                  <input type="radio" value="Пересорт" name="category">
                  <div class="radio icon"></div>
                  <div>Пересорт</div>
                </div>
                <div class="option row">
                  <input type="radio" value="Недосдача" name="category">
                  <div class="radio icon"></div>
                  <div>Недосдача</div>
                </div>
                <div class="option row">
                  <input type="radio" value="Некомплектность" name="category">
                  <div class="radio icon"></div>
                  <div>Некомплектность</div>
                </div>
                <div class="option row">
                  <input type="radio" value="Производственный брак" name="category">
                  <div class="radio icon"></div>
                  <div>Производственный брак</div>
                </div>
                <div class="option row">
                  <input type="radio" value="Несоответствие описанию" name="category">
                  <div class="radio icon"></div>
                  <div>Несоответствие описанию</div>
                </div>
                <div class="option row">
                  <input type="radio" value="Не могу определить" name="category">
                  <div class="radio icon"></div>
                  <div>Не могу определить</div>
                </div>
              </div>
              <div class="form-col2">
                <div class="form-wrap">
                  <div class="title">Количество бракованных изделий</div>
                  <div class="qty qty-box row added">
                    <div class="btn minus" data-tooltip="Уменьшить" onclick="changeQty(event, `#max_kolv#`, 1)"></div>
                    <input class="choiced-qty" name="amount" type="text" value="1" data-value="1" autocomplete="off" onchange="changeQty(event, `#max_kolv#`, 1)" onblur="onBlurInput(this)" onfocus="onFocusInput(this)" oninput="onlyNumb(event)">
                    <div class="btn plus" data-tooltip="Добавить" onclick="changeQty(event,`#max_kolv#`, 1)"></div>
                  </div>
                </div>
                <div class="img-wrap">
                  <img src="https://b2b.topsports.ru/c/itemslist/#image#.jpg">
                </div>
              </div>
            </div>
            <div class="form-wrap" required>
              <div class="title">Комментарий<span class="req">*</span></div>
              <textarea name="comment" data-type="text" maxlength="250" autocomplete="off" placeholder="Введите текст" oninput="textareaCounter(this)"></textarea>
              <div class="text-counter" data-count="comment">Знаков осталось: <span>250</span></div>
            </div>
            <div class="btns-wrap">
              <input class="btn sub-act" type="submit" value="Отправить" disabled>
            </div>
            <div class="loader">
              <div class="loader icon"></div>
              <div class="text">Пожалуйста, подождите</div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Всплывающее окно отгрузок: -->
    <div id="shipments" class="pop-up-container">
      <div class="pop-up">
        <div class="pop-up-title row">
          <div class="title h1">Отгрузки</div>
          <div class="close icon"></div>
        </div>
        <div class="pop-up-body">
          <table>
            <thead>
              <tr>
                <th class="title">Документ</th>
                <th class="title">Количество</th>
                <th class="title">Сумма</th>
                <th class="title">Трекинг</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <a class="row" href="../api.php?action=order&order_id=#id#&mode=nakl&type=pdf&name=#rencname#&id=#rdocid#">
                    <div class="download icon"></div>
                    <div>#rdocname#</div>
                  </a>
                </td>
                <td>
                  <div class="row">
                    <a href="../api.php?action=order&order_id=#id#&mode=bar&type=xls&name=#rencname#&id=#rdocid#">
                      <div class="barcode icon" data-tooltip="Скачать штрихкоды"></div>
                    </a>
                    <div>#rkolall#</div>
                  </div>
                </td>
                <td>#rsummall#</td>
                <td>#rtrac#</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="loader">
          <div class="loader icon"></div>
          <div class="text">Пожалуйста, подождите</div>
        </div>
      </div>
    </div>

    <!-- Всплывающее окно платежей: -->
    <div id="payments" class="pop-up-container">
      <div class="pop-up">
        <div class="pop-up-title row">
          <div class="title h1">Платежи</div>
          <div class="close icon"></div>
        </div>
        <div class="pop-up-body row">
          <div class="head row">
            <div class="info">
              <div class="title">Тип платежа</div>
              <div>График платежей</div>
              <!-- <div>Аванс</div> -->
              <div>Поступление</div>
              <div>К оплате</div>
              <div>Переплата</div>
            </div>
            <div class="info">
              <div class="title">Итого</div>
              <div>#summ#</div>
              <!-- <div>#summ_pre#</div> -->
              <div>#summ_paid#</div>
              <div>#summ_to_pay#</div>
              <div>#summ_over#</div>
            </div>
          </div>
          <div class="scroll row">
            <div class="info">
              <div class="title">#date#</div>
              <div>#summ#</div>
              <!-- <div>#summ_pre#</div> -->
              <div>#summ_paid#</div>
              <div>#summ_to_pay#</div>
              <div>#summ_over#</div>
            </div>
          </div>
        </div>
        <div class="loader">
          <div class="loader icon"></div>
          <div class="text">Пожалуйста, подождите</div>
        </div>
      </div>
    </div>

    <!-- Подключение информационной карточки и изображения на весь экран: -->
    <div data-html="../modules/infocard_and_img.html"></div>

    <script src="../js/main.js?<?php echo $ver?>"></script>
    <script src="../js/table.js?<?php echo $ver?>"></script>
    <script src="../js/calendar.js?<?php echo $ver?>"></script>
    <script src="../js/carousel.js?<?php echo $ver?>"></script>
    <script src="index.js?<?php echo $ver?>"></script>
  </body>
</html>