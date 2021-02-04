<?php include_once "../ver.php";?>

<!DOCTYPE html>
<html lang="ru">
  <head>
    <title>ТОП СПОРТС - Сертификаты</title>
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
          <div class="title h0">Сертификаты</div>
        </div>
        <div class="control row">
          <div class="wrap">
            <div class="title">Поиск по ключевым словам</div>
            <form id="cert-search" class="search row" data-type="fast" action="#">
              <input type="text" data-value="" autocomplete="off" placeholder="Введите слово...">
              <input class="search icon" type="submit" value="">
              <div class="close icon"></div>
            </form>
          </div>
          <div class="wrap">
            <div class="title">Бренд</div>
            <div id="cert-brand" class="activate select">
              <div class="head row">
                <div class="title">Выберите бренд</div>
                <div class="triangle icon"></div>
              </div>
              <div class="drop-down">
                <div class="item" data-value="#item#">#item#</div>
              </div>
            </div>
          </div>
          <div class="relay icon"></div>
        </div>
        <div id="cert" class="template">
          <div class="item row">
            <div class="view"></div>
            <div class="cont">
              <div class="text">#descr#</div>
              <div class="row">
                <a href="../api.php?action=files&type=cert&id=#id#" target="_blank">
                  <div class="download icon"></div>
                </a>
                <a href="../api.php?action=files&type=cert&mode=view&id=#id#" target="_blank">#title#</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script src="../js/main.js?<?php echo $ver?>"></script>
    <script src="../js/calendar.js?<?php echo $ver?>"></script>
    <script src="index.js?<?php echo $ver?>"></script>
  </body>
</html>