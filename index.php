<?php include_once "ver.php";?>

<!DOCTYPE html>
<html>
  <head>
    <title>ТОП СПОРТС - Вход</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="keywords" content="ТОП СПОРТС">
    <meta name="description" content="ТОП СПОРТС">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="icon" href="img/top_sports_logo_black_short_transparency.png">
    <script src="js/check_auth.js?<?php echo $ver?>"></script>
    <link rel="stylesheet" type="text/css" href="css/fonts.css?<?php echo $ver?>">
    <link rel="stylesheet" type="text/css" href="css/main.css?<?php echo $ver?>">
    <link rel="stylesheet" type="text/css" href="css/main_media.css?<?php echo $ver?>">
  </head>

  <body id="auth">
    <div id="main">
      <div class="container center">
        <div class="pop-up-container locked">
          <div class="pop-up">
            <div class="pop-up-title row" style="text-align: center;">
              <div class="title h1">Вход в личный кабинет</div>
            </div>
            <div class="pop-up-body">
              <div id="error" class="err">Пользователь не найден</div>
              <form id="log-in" class="post">
                <div class="form-wrap" required>
                  <div class="title">Логин<span class="req">*</span></div>
                  <input type="text" value="" name="login" placeholder="Введите логин">
                  <div class="err">Поле не заполнено</div>
                </div>
                <div class="form-wrap" required>
                  <div class="title">Пароль<span class="req">*</span></div>
                  <input type="password" value="" name="pass" placeholder="Введите пароль">
                  <div class="err">Поле не заполнено</div>
                </div>
                <div class="form-wrap">
                  <div class="option row">
                    <input type="checkbox" value="1" name="remember">
                    <div class="checkbox orange icon"></div>
                    <div>Запомнить меня</div>
                  </div>
                </div>
                <div class="btns-wrap">
                  <input class="btn act" type="submit" value="Войти" onclick="logIn(event)">
                  <a href="registr/" class="btn sub-act">Стать дилером</a>
                </div>
                <div class="notice title">Если вы забыли логин или пароль обратитесь в отдел продаж<br>+7 (846) 300-44-99</div>
                <div class="loader">
                  <div class="loader icon"></div>
                  <div class="text">Пожалуйста, подождите</div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script src ="js/main.js?<?php echo $ver?>"></script>
    <script src ="js/log_in.js?<?php echo $ver?>"></script>
  </body>
</html>