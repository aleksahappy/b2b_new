<?php include_once "../ver.php";?>

<!DOCTYPE html>
<html lang="ru">
  <head>
    <title>ТОП СПОРТС - Рекламация</title>
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
          <div class="title h0 row">
            <div>Рекламация №#recl_num#&nbsp;</div>
            <div>от #recl_date#</div>
          </div>
        </div>
        <div class="recl-title row">
          <div class="state row" data-status="#status#">
            <div class="item row">
              <div class="title">Зарегистрирована</div>
              <div class="icon"></div>
            </div>
            <div class="item row">
              <div class="title">Обрабатывается</div>
              <div class="line"></div>
              <div class="icon"></div>
            </div>
            <div class="item row">
              <div class="title">#decision_text#</div>
              <div class="line"></div>
              <div class="icon"></div>
            </div>
            <div class="item row">
              <div class="title">Исполнена</div>
              <div class="line"></div>
              <div class="icon"></div>
            </div>
          </div>
          <div class="return-list row">
            <div class="info">Распечатайте лист возврата и вложите в посылку</div>
            <div class="btn act row disabled" onclick="getReturnList(event)">
              <div>Лист возврата</div>
              <div class="download white icon"></div>
            </div>
          </div>
        </div>
        <div class="recl-main row">
          <div class="recl-info">
            <div class="title h3">Детали рекламации</div>
            <div class="up row">
              <div class="items">
                <div class="side">
                  <div class="title">Инициатор рекламации: <span class="text">#user_fio#</span></div>
                  <div class="title">Ответственный менеджер: <span class="text">#manager_fio#</span></div>
                  <div class="title">Тип заказа: <span class="text">#order_type#</span></div>
                </div>
                <div class="side">
                  <div class="title">Заказ: <span class="text"><a href="../order/?#order_id#">№#order_num#</a> от #order_date#</span></div>
                  <div class="title">Дата реализации: <span class="text">#item_nakl_date#</span></div>
                  <div class="title">Количество единиц товара: <span class="text">#item_count#</span></div>
                  <div class="title">Категория обращения: <span class="text">#recl_category#</span></div>
                </div>
              </div>
              <div class="descr #isDescr#">
                <div class="title">Описание дефекта:</div>
                <div class="text">#recl_descr#</div>
              </div>
            </div>
            <div class="down row">
              <div class="card">
                <div class="img-wrap" onclick="">
                  <img src="https://b2b.topsports.ru/c/itemslist/#image#.jpg">
                </div>
                <div class="card-body">
                  <div class="card-title">
                    <div class="title h3">#item_title#</div>
                    <div class="articul">Артикул: #item_articul#</div>
                  </div>
                  <div class="tooltips row">
                    <div class="free row #isFree#" data-tooltip="#item_free_qty# шт.">
                      <span class="free-qty icon"></span>
                      <span>#item_free_qty#</span>
                    </div>
                    <div class="arrive row #isArrive#" data-tooltip="#item_arrive_qty# шт. #arrive_date#">
                      <span class="arrive-qty icon"></span>
                      <span>#item_arrive_qty#</span>
                    </div>
                  </div>
                  <div class="card-price row">
                    <div>Цена продажи: </div>
                    <div class="title h2">#item_price#</div>
                  </div>
                  <a class="card-open">Подробнее</a>
                </div>
              </div>
              <div id="files">
                <div class="title h3">Загрузите фото, видео или документ</div>
                <div class="row">
                  <form class="item" method="post" enctype="multipart/form-data" onsubmit="sendFiles(event)">
                    <input id="load-files" value="" name="files" type="file"  multiple="multiple" onchange="uploadFiles(event)">
                    <label class="text" for="load-files">загрузить</label>
                    <input type="submit" value="Загрузить">
                  </form>
                  <a class="files-item item img-wrap @isLoading@" data-name="@file_name_view@" data-tooltip="@file_name_view@.@file_type@" href="@url@" target="_blank" onclick="showFullImg(event)">
                    <div class="@class@" style="background-image: url(@preview_url@)"></div>
                    <div class="progress">
                      <div class="indicator"></div>
                      <div class="status">0%</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div id="chat" class="pop-up-container visible"  data-bound="true">
            <div class="pop-up">
              <div class="pop-up-title row">
                <div class="title h3">Чат с менеджером</div>
                <div class="close icon"></div>
              </div>
              <div class="pop-up-body">
                <div class="wrap">
                  <div class="date">
                    <div class="pill">@date@</div>
                    <div class="message">
                      <div class="title">@user@:</div>
                      <div class="text">@text@</div>
                      <div class="time">@time@</div>
                    </div>
                  </div>
                </div>
              </div>
              <form class="btns-wrap" method="post" enctype="multipart/form-data" onsubmit="sendMessage(event)">
                <textarea name="comment" value="" placeholder="Введите сообщение..." oninput="setTextareaHeight(this)" onkeydown="sendMessage(event)"></textarea>
                <input class="btn" type="submit" value="Отправить">
              </form>
            </div>
          </div>
        </div>
        <div class="chat icon" onclick="openChat()"></div>
      </div>
    </div>
    <!-- Подключение информационной карточки и изображения на весь экран: -->
    <div data-html="../modules/infocard_and_img.html"></div>

    <script src="../js/main.js?<?php echo $ver?>"></script>
    <script src="../js/carousel.js?<?php echo $ver?>"></script>
    <script src="index.js?<?php echo $ver?>"></script>
  </body>
</html>
