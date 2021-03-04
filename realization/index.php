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
    <div id="main">
      <div class="container">
        <div id="main-info" class="template">
          <div id="main-header" class="row">
            <div class="title h0">Реализация #realiz_number# от #realiz_date#
              <span class="dot">, </span>
              <span class="name">#contr_name#</span>
            </div>
          </div>
          <div class="common-info row">
            <div class="info row">
              <div class="side">
                <div class="title h3">Детали реализации</div>
                <div class="row">
                  <div class="title">Номер заказа:</div>
                  <div class="text">#order_number#</div>
                </div>
                <div class="row">
                  <div class="title">Заказчик:</div>
                  <div class="text">#user_fio#</div>
                </div>
                <div class="row">
                  <div class="title">Трекинг:</div>
                  <div class="text">#trac#</div>
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
            <div class="details row">
              <div class="sum">Сумма реализации: <span>#realiz_sum#</span></div>
              <div class="btns">
                <div class="row">
                  <div class="download icon"></div>
                  <a class="btn" href="#">Скачать накладную</a>
                </div>
                <div class="row">
                  <div class="barcode icon"></div>
                  <a class="btn" href="#">Скачать штрихкод</a>
                </div>
              </div>
            </div>
          </div>
          <div class="more">
            <div class="row">
              <div class="download icon"></div>
              <a href="#">Скачать накладную</a>
            </div>
            <div class="row">
              <div class="barcode icon"></div>
              <a href="#">Скачать штрихкод</a>
            </div>
            <div class="comment row #isComment#">
              <div class="title">Комментарий:&nbsp;</div>
              <div class="text">#comment#</div>
            </div>
          </div>
        </div>

        <div id="realization" class="table active">
          <div class="infoblock switch">
            <div class="head row" onclick="switchContent(event)">
              <div class="title white">Информация о товарах</div>
              <div class="open white icon switch-icon"></div>
            </div>
            <div class="switch-cont">
              <div class="control">
                <form id="realiz-search" class="search row" data-type="fast" action="#">
                  <input type="text" data-value="" placeholder="Поиск по артикулу, наименованию...">
                  <input class="search icon" type="submit" value="">
                  <div class="close icon"></div>
                </form>
              </div>
              <div class="table-adaptive">
                <div class="info row">
                  <div>
                    <div>#titl#</div>
                    <div class="articul">#artc#</div>
                  </div>
                  <div>
                    <div>#kolv#</div>
                    <div>#summ#</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
