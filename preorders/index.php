<?php include_once "ver.php";?>

<!DOCTYPE html>
<html lang="ru">
  <head>
    <title>ТОП СПОРТС - информация о предзаказе</title>
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
        <div id="main-header" class="row">
          <div id="page-title" class="title h0"></div>
        </div>
        <div id="preorder-info">
          <div class="info">Прочитайте условия участия в предзаказе и <a class="catalog-link" href="../catalogs/?#preorderId#">перейдите в каталог</a> для выбора товаров. Или скачайте бланк и заполните его вручную. После чего загрузите его на этой странице (корзина наполнится товарами из файла).</div>
          <div class="warnblock row">
            <span class="attention red icon"></span>
            <div>Предзаказ проходит с 23.02 по 31.03.2021&nbsp;г. Доступ к каталогу и корзине предзаказа будет невозможен после этой даты. Для размещения заказа вы можете <a class="catalog-link" href="../catalogs/?#preorderId#">перейти в каталог</a> или скачать бланк заказа. При загрузке бланка заказа его содержимое отобразится в корзине.</div>
          </div>
          <div class="conditions">
            <div class="title h2">Условия участия в предзаказе</div>
            <div class="row">
              <div class="left-side">
                <div class="table-wrap">
                  <table>
                    <tr class="preorder-descr">
                      <td>
                        <div class="title">Сумма заказа в розничных ценах до 149 999 руб.</div>
                        <div class="text">Сумма со скидкой до 104 999 руб.</div>
                      </td>
                      <td class="percent">35%</td>
                    </tr>
                    <tr class="preorder-descr">
                      <td>
                        <div class="title">Сумма заказа в розничных ценах 150 000 — 299 999 руб.</div>
                        <div class="text">Сумма со скидкой 105 000 — 194 999 руб.</div>
                      </td>
                      <td class="percent">40%</td>
                    </tr>
                    <tr class="preorder-descr">
                      <td>
                        <div class="title">Сумма заказа в розничных ценах от 300 000 руб.</div>
                        <div class="text">Сумма со скидкой от 195 000 руб.</div>
                      </td>
                      <td class="percent">45%</td>
                    </tr>
                  </table>
                </div>
                <div class="btns-wrap">
                  <a class="btn act" href="../catalogs/?#preorderId#">Перейти в каталог</a>
                  <a class="btn sub-act" href="../api.php?action=???" target="_blank">Скачать бланк</a>
                  <form method="post" enctype="multipart/form-data" onsubmit="loadFromBlank(event)">
                    <input id="load-blank" value="" name="file" type="file" accept=".xls,.xlsx" onchange="sendBlank()">
                    <label class="btn" for="load-blank"><img src="../img/download.svg">Загрузить бланк</label>
                    <input type="submit" value="Загрузить">
                  </form>
                </div>
              </div>
              <div class="right-side">
                Аванс 20% от суммы выставленного счета необходимо внести не позднее 5 (пяти) рабочих дней с момента выставления счета.
                <br>
                Заказы, по которым не будет произведен авансовый платеж, будут расформированы и обязательства по данным предзаказам будут автоматически сняты с поставщика.
                <br><br>
                Оставшиеся 80% необходимо оплатить в течении 5 (пяти) рабочих дней после уведомления о поступлении товара на наш склад.
                <br>
                В случае отказа от выкупа товара, после его поступления на склад, аванс подлежит удержанию в счет поставщика, как неустойка за отказ от поставки.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script src="../js/main.js?<?php echo $ver?>"></script>
    <script src="index.js?<?php echo $ver?>"></script>
  </body>
</html>