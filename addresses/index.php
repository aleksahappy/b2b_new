<?php include_once "../ver.php";?>

<!DOCTYPE html>
<html lang="ru">
  <head>
    <title>ТОП СПОРТС - Мои адреса</title>
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
          <div class="title h0">Адреса</div>
          <div class="row">
            <div class="question icon" data-tooltip="Добавьте магазин,<br>чтобы он отобразился<br>на карте дилера" help></div>
            <div class="add icon" onclick="openAddressPopUp()"></div>
          </div>
        </div>
        <div class="basic btn" data-tooltip="Добавьте магазин,<br>чтобы он отобразился<br>на карте дилера" onclick="openAddressPopUp()">Добавить</div>
        <div id="addresses" class="table active">
        </div>
      </div>
    </div>

    <div id="address" class="pop-up-container">
      <div class="pop-up">
        <div class="pop-up-title row">
          <div class="title h1">Добавление адреса</div>
          <div class="close icon"></div>
        </div>
        <div class="pop-up-body">
          <form id="address-form" class="post">
            <div class="top form-cols">
              <div class="form-wrap" required>
                <div class="title">Город<span class="req">*</span></div>
                <input type="text" value="" name="city" data-type="text" placeholder="Введите город" data-kladr-type="city">
                <div class="err">Поле заполнено неверно</div>
              </div>
              <div class="form-wrap" required>
                <div class="title">Улица<span class="req">*</span></div>
                <input type="text" value="" name="street" data-type="text" placeholder="Введите улицу" data-kladr-type="street">
                <div class="err">Поле заполнено неверно</div>
              </div>
              <div class="form-wrap" required>
                <div class="title">Дом<span class="req">*</span></div>
                <input type="text" value="" name="house" placeholder="Введите №" data-kladr-type="building">
                <div class="err">Поле заполнено неверно</div>
              </div>
            </div>
            <div class="bottom form-cols">
              <div class="form-wrap">
                <div class="title">Строение</div>
                <input type="text" value="" name="building" placeholder="Введите строение">
              </div>
              <div class="form-wrap">
                <div class="title">Корпус</div>
                <input type="text" value="" name="block" placeholder="Введите корпус">
              </div>
              <div class="form-wrap">
                <div class="title">Офис</div>
                <input type="text" value="" name="office" placeholder="Введите офис">
              </div>
              <div class="form-wrap" required>
                <div class="title">Индекс<span class="req">*</span></div>
                <input type="text" value="" name="index" data-type="text" placeholder="Введите индекс" oninput="onlyNumb(event)">
              </div>
            </div>
            <div class="btns-wrap">
              <input class="btn sub-act" type="submit" value="Отправить">
            </div>
            <div class="loader">
              <div class="loader icon"></div>
              <div class="text">Пожалуйста, подождите</div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <script src="../js/main.js?<?php echo $ver?>"></script>
    <script src="../js/table.js?<?php echo $ver?>"></script>
    <script src="../js/jquery-1.12.4.min.js?<?php echo $ver?>"></script>
    <script src="../js/jquery.kladr.js?<?php echo $ver?>"></script>
    <script src="../js/kladr.js?<?php echo $ver?>"></script>
    <script src="index.js?<?php echo $ver?>"></script>

  </body>
</html>
