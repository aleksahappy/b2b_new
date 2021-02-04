<?php include_once "../ver.php";?>

<!DOCTYPE html>
<html lang="ru">
  <head>
    <title>ТОП СПОРТС - Пользователи</title>
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
          <div class="title h0">Пользователи</div>
          <div class="add icon" onclick="openUserPopUp()"></div>
        </div>
        <div class="btn" onclick="openUserPopUp()">Добавить</div>
        <div id="users" class="table active">
          <div class="table-adaptive template">
            <div class="infoblock">
              <div class="head">
                <div class="title">#fio#</div>
                <div class="toggle dark #isChecked#" onclick="toggleAccess(event,`#id#`)">
                  <div class="toggle-in"></div>
                </div>
              </div>
              <div class="info row">
                <div class="wrap row">
                  <div class="lock icon #status#"></div>
                  <div class="content row">
                    <div>
                      <div class="title">Должность: <span class="text">#position#</span></div>
                      <div class="title">Дата рождения: <span class="text">#birth#</span></div>
                      <div class="title">Пол: <span class="text">#gender#</span></div>
                    </div>
                    <div>
                      <div class="title">Телефон: <a href="tel:#phone#">#phone#</a></div>
                      <div class="title">Email: <a href="mailto:#email#">#email#</a></div>
                      <div class="title">Дата заведения: <span class="text">#date#</span></div>
                    </div>
                  </div>
                </div>
                <div class="edit icon" onclick="openUserPopUp('#id#')"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="user" class="pop-up-container">
      <div class="pop-up">
        <div class="pop-up-title row">
          <div class="title h1">Новый пользователь</div>
          <div class="close icon"></div>
        </div>
        <div class="pop-up-body">
          <form id="user-form" class="post">
            <div class="form-wrap" required>
              <div class="title">Имя<span class="req">*</span></div>
              <input type="text" value="" name="name" data-type="name" placeholder="Введите имя" maxlength="40">
            </div>
            <div class="form-wrap" required>
              <div class="title">Фамилия<span class="req">*</span></div>
              <input type="text" value="" name="surname" data-type="name" placeholder="Введите фамилию" maxlength="40">
            </div>
            <div class="form-wrap">
              <div class="title">Отчество</div>
              <input type="text" value="" name="patronymic" data-type="name" placeholder="Введите отчество" maxlength="40">
            </div>
            <div class="form-cols">
              <div class="form-wrap form-col2" required>
                <div class="title">День рождения<span class="req">*</span></div>
                <div class="calendar-wrap">
                  <input type="text" value="" name="birth" data-type="date" placeholder="ДД.ММ.ГГГГ" maxlength="10" autocomplete="off" oninput="onlyDateChar(event)">
                </div>
              </div>
              <div class="form-wrap form-col2" required>
                <div class="title">Пол<span class="req">*</span></div>
                <div class="gender row">
                  <div class="option row select-qty">
                    <input type="radio" value="1" name="gender">
                    <div class="radio icon"></div>
                    <div>Мужской</div>
                  </div>
                  <div class="option row">
                    <input type="radio" value="2" name="gender">
                    <div class="radio icon"></div>
                    <div>Женский</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-wrap" required>
              <div class="title">Должность<span class="req">*</span></div>
              <input type="text" value="" name="position" placeholder="Введите должность" maxlength="40">
            </div>
            <div class="form-cols">
              <div class="form-wrap form-col2" required>
                <div class="title">Телефон<span class="req">*</span></div>
                <input type="text" value="" name="phone" data-type="phone" placeholder="+7 ( _ _ _ ) _ _ _ -_ _ -_ _"  maxlength="30" oninput="onlyPhoneChar(event)">
              </div>
              <div class="form-wrap form-col2" required>
                <div class="title">Email<span class="req">*</span></div>
                <input type="text" value="" name="email" data-type="email" placeholder="Введите email" maxlength="50">
              </div>
            </div>
            <div class="form-wrap" required>
              <div class="form-cols access">
                <div class="form-col2">
                  <div class="title">Тип доступа<span class="req">*</span></div>
                  <div class="option row">
                    <input type="radio" value="1" name="access">
                    <div class="radio icon"></div>
                    <div>Полный</div>
                  </div>
                  <div class="option row">
                    <input type="radio" value="0" name="access">
                    <div class="radio icon"></div>
                    <div>Частичный</div>
                  </div>
                </div>
                <div class="form-col2">
                  <div class="text midlight">Пользователи с полным доступом могут создавать новых пользователей и просматривать все заказы.</div>
                  <div class="text midlight">Пользователи с частичным доступом не могут создавать новых пользователей, видят только свои заказы</div>
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
    <script src ="../js/calendar.js?<?php echo $ver?>"></script>
    <script src ="index.js?<?php echo $ver?>"></script>
  </body>
</html>