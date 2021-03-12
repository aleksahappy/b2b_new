<?php include_once "../ver.php";?>

<!DOCTYPE html>
<html lang="ru">
  <head>
    <title>ТОП СПОРТС - Реализации</title>
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
          <div class="title h0">Реализации</div>
        </div>
        <div id="realizations" class="table active">
          <div class="table-adaptive infoblock template">
            <div class="info row" onclick="goToPage(event,`realization/?#id#`)">
              <div>
                <div>#trac#</div>
                <div class="text light">#realiz_number#</div>
              </div>
              <a class="barcode icon" href="../api.php?action=order&order_id=#id#&mode=bar&type=xls&name=#rencname#&id=#rdocid#" data-tooltip="Скачать штрихкоды"></a>
              <a class="download icon" href="../api.php?action=order&order_id=#id#&mode=nakl&type=pdf&name=#rencname#&id=#rdocid#"></a>
              <div>
                <div>#order_number#</div>
                <div class="text light">#realiz_date#</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <script src="../js/main.js?<?php echo $ver?>"></script>
    <script src="../js/table.js?<?php echo $ver?>"></script>
    <script src="../js/calendar.js?<?php echo $ver?>"></script>
    <script src="index.js?<?php echo $ver?>"></script>
  </body>
</html>