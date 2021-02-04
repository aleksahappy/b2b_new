<?php include_once "../ver.php";?>

<!DOCTYPE html>
<html lang="ru">
  <head>
    <title>ТОП СПОРТС - Ваш профиль</title>
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
          <div class="title h0">Ваш профиль</div>
        </div>
        <div class="profile-info">
          <div class="head row">
            <div class="title h2">Ваши данные</div>
            <div class="edit icon" onclick="openProfilePopUp()"></div>
          </div>
          <div class="content row template">
            <div>
              <div class="title">Имя: <span class="text">#name#</span></div>
              <div class="title">Фамилия: <span class="text">#lastname#</span></div>
              <div class="title">Отчество: <span class="text">#parentname#</span></div>
              <div class="title">Дата рождения: <span class="text">#birthday#</span></div>
              <div class="title">Должность: <span class="text">#position#</span></div>
              <div class="title">Пол: <span class="text">#gender_text#</span></div>
            </div>
            <div>
              <div class="title">Skype: <span class="text">#skype#</span></div>
              <div class="title">Email: <span class="text">#email#</span></div>
              <div class="title">Мобильный: <span class="text">#phone#</span></div>
              <div class="title">Рабочий: <span class="text">#work_phone#</span></div>
              <div class="title">Добавочный: <span class="text">#work_phone_add#</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="profile-edit" class="pop-up-container">
      <div class="pop-up">
        <div class="pop-up-title row">
          <div class="title h1">Изменить профиль</div>
          <div class="close icon"></div>
        </div>
        <div class="pop-up-body">
          <form id="profile-form" class="post">
            <div class="form-wrap" required>
              <div class="title">Имя<span class="req">*</span></div>
              <input type="text" value="" name="name" data-type="name" placeholder="Введите имя">
            </div>
            <div class="form-wrap" required>
              <div class="title">Фамилия<span class="req">*</span></div>
              <input type="text" value="" name="lastname" data-type="name" placeholder="Введите фамилию">
            </div>
            <div class="form-wrap">
              <div class="title">Отчество</div>
              <input type="text" value="" name="parentname" data-type="name" placeholder="Введите отчество">
            </div>
            <div class="form-wrap" required>
              <div class="title">Должность<span class="req">*</span></div>
              <input type="text" value="" name="position" data-type="text" placeholder="Введите должность">
            </div>
            <div class="form-cols">
              <div class="form-wrap form-col2">
                <div class="title">День рождения</div>
                <div class="calendar-wrap">
                  <input type="text" value="" name="birthday" data-type="date" placeholder="ДД.ММ.ГГГГ" maxlength="10" autocomplete="off" oninput="onlyDateChar(event)">
                </div>
              </div>
              <div class="form-wrap form-col2">
                <div class="title">Пол</div>
                <div class="gender row">
                  <div class="option row">
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
            <div class="form-cols">
              <div class="form-wrap form-col2">
                <div class="title">Email</div>
                <input type="text" value="" name="email" data-type="email" placeholder="Введите email">
              </div>
              <div class="form-wrap form-col2">
                <div class="title">Skype</div>
                <input type="text" value="" name="skype" data-type="nickname" placeholder="Введите skype">
              </div>
            </div>
            <div class="form-wrap" required="">
              <div class="title">Мобильный телефон<span class="req">*</span></div>
              <input type="text" value="" name="phone" data-type="phone" placeholder="+7 ( _ _ _ ) _ _ _ -_ _ -_ _" maxlength="30" oninput="onlyPhoneChar(event)">
            </div>
            <div class="form-wrap">
              <div class="form-cols">
                <div class="form-wrap form-col2">
                  <div class="title">Рабочий номер<span class="req">*</span></div>
                  <input type="text" value="" name="work_phone" data-type="phone" placeholder="+7 ( _ _ _ ) _ _ _ -_ _ -_ _" maxlength="30" oninput="onlyPhoneChar(event)">
                </div>
                <div class="form-wrap form-col2">
                  <div class="title">Добавочный</div>
                  <input type="text" value="" name="work_phone_add" placeholder="Введите цифры" oninput="onlyPhoneChar(event)">
                </div>
              </div>
            </div>
            <div class="btns-wrap">
              <input class="btn sub-act" type="submit" value="Сохранить" disabled>
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
    <script src ="../js/calendar.js?<?php echo $ver?>"></script>
    <script src ="index.js?<?php echo $ver?>"></script>
  </body>
</html>