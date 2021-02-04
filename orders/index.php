<?php include_once "../ver.php";?>

<!DOCTYPE html>
<html lang="ru">
  <head>
    <title>ТОП СПОРТС - Заказы</title>
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
          <div class="title h0">Заказы</div>
        </div>
        <div id="orderslist" class="table active">
          <div class="table-adaptive template">
            <div class="infoblock" onclick="showOrder(event,`#id#`)">
              <div class="info row">
                <div class="row">
                  <div>#order_number# от #order_date#</div>
                  <div>#order_type#</div>
                </div>
                <div class="pills">
                  <div class="pill ord c10 #display#" data-status="#value#">#sum#</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script src="../js/main.js?<?php echo $ver?>"></script>
    <script src="../js/table.js?<?php echo $ver?>"></script>
    <script src="index.js?<?php echo $ver?>"></script>
  </body>
</html>