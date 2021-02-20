<?php include_once "../ver.php";?>

<!DOCTYPE html>
<html lang="ru">
  <head>
    <title>ТОП СПОРТС - Контрагенты</title>
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
          <div class="title h0">Контрагенты</div>
          <div class="add icon" onclick="openPopUp('#contractor')"></div>
        </div>
        <div class="basic btn" onclick="openPopUp('#contractor')">Добавить</div>
        <div id="contr" class="table active">
          <div class="table-adaptive template">
            <div class="infoblock">
              <div class="head">
                <div class="title">#title#</div>
                <div class="toggle dark #isChecked#" onclick="toggleAccess(event, `#contr_id#`)">
                  <div class="toggle-in"></div>
                </div>
              </div>
              <div class="info content">
                <div class="title">ИНН/КПП: <span class="text">#inn##kpp#</span></div>
                <div class="title">Система налогообложения: <span class="text">#system#</span></div>
                <div class="title">Дата заведения: <span class="text">#date#</span></div>
                <div class="title">Юридический адрес: <span class="text">#address#</span></div>
                <div class="docs row">
                  <div class="mark icon" data-status="#status#" data-tooltip="#status_text#"></div>
                  <a href="../api.php?action=get_dog&contr_id=#contr_id#&id=#id#" target="_blank" data-tooltip="#info#" help>Договор с #title# от #date_start#</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="contractor" class="pop-up-container">
      <div class="pop-up">
        <div class="pop-up-title row">
          <div class="title h1">Добавление контрагента</div>
          <div class="close icon"></div>
        </div>
        <div class="pop-up-body">
          <form id="contr-form" class="post">
            <div class="title">Добавьте ИНН, данные юридического лица загрузятся автоматически</div>
            <div class="form-cols">
              <div class="form-wrap" required>
                <div class="title">ИНН<span class="req">*</span></div>
                <div class="row">
                  <input type="text" value="" name="contr_inn" data-type="inn" placeholder="Введите ИНН" maxlength="12" oninput="addByInn(event)">
                  <div id="inn-loader" class="loader icon"></div>
                </div>
              </div>
              <div class="form-wrap">
                <div class="title">КПП</div>
                <input class="after-inn" type="text" value="" name="kpp" data-type="kpp" placeholder="" maxlength="9" readonly disabled>
              </div>
            </div>
            <div class="form-wrap" required>
              <div class="title">Название<span class="req">*</span></div>
              <input class="after-inn" type="text" value="" name="contr_name" placeholder="" readonly disabled>
            </div>
            <div class="form-wrap" required>
              <div class="title">Юридический адрес<span class="req">*</span></div>
              <textarea class="after-inn" name="address" maxlength="250" placeholder="" readonly disabled></textarea>
            </div>
            <div class="form-wrap" required>
              <div class="title">Система налогообложения<span class="req">*</span></div>
              <div class="activate select after-inn" disabled>
                <input type="hidden" value="" name="nalog">
                <div class="head row">
                  <div class="title">Выберите систему</div>
                  <div class="triangle icon"></div>
                </div>
                <div class="drop-down">
                  <div class="item" data-value="Общая">Общая</div>
                  <div class="item" data-value="Упрощенная">Упрощенная</div>
                  <div class="item" data-value="Прочая">Прочая</div>
                </div>
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

    <script src ="../js/main.js?<?php echo $ver?>"></script>
    <script src="../js/table.js?<?php echo $ver?>"></script>
    <script src="../js/calendar.js?<?php echo $ver?>"></script>
    <script src ="index.js?<?php echo $ver?>"></script>
  </body>
</html>
