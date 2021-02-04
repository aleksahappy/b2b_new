<?php include_once "../ver.php";?>

<!DOCTYPE html>
<html lang="ru">
  <head>
    <title>ТОП СПОРТС - Artboard</title>
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
    <!-- Основное содержимое страницы -->
    <div id="main">
      <div class="container">

       <!-- Заголовок страницы -->
        <div id="main-header" class="row">
          <div class="title h0">Artboard</div>
        </div>

        <!-- Текст -->
        <div class="artboard-title">Текст</div>
        <div class="arboard-block text-temp">

          <div class="title h0">Стиль  главного заголовка страницы (30px, uppercase, #34495E)</div>
          <div class="title h1">Стиль  заголовка H1, для модулей и pop up (24px, uppercase, #34495E)</div>
          <div class="title h2">Стиль  заголовка H2, для текстовых разделов и таблиц (18px, font-weight: 600, #34495E)</div>
          <div class="title h3">Стиль  заголовка H3, для текстовых подразделов (16px, font-weight: 600, #34495E)</div>
          <div class="title">Стиль  заголовка H4, для подразделов и полей (14px, #34495E)</div>
          <div class="text">Основной текст (14px, #666666)</div>
          <div class="text midlight">midlight текст (14px, #8596A6)</div>
          <div class="text light">light текст (14px, #C6C6C6)</div>
          <div class="text orange">orange текст (14px, #F05A28)</div>
          <div class="text red">red текст (14px, #CE0014)</div>

        </div>

        <!-- Текст на темном фоне -->
        <div class="artboard-title">Текст на темном фоне</div>
        <div class="arboard-block text-white-temp">

          <div class="title white h0">Стиль  главного заголовка страницы</div>
          <div class="title white h1">Стиль  заголовка H1, для модулей и pop up</div>
          <div class="title white h2">Стиль  заголовка H2, для текстовых разделов и таблиц</div>
          <div class="title white h3">Стиль  заголовка H3, для текстовых подразделов</div>
          <div class="title white">Стиль  заголовка H4, для подразделов и полей (основной текст, но цветом #34495E)</div>
          <div class="text white">Основной текст</div>

        </div>

        <!-- Подсказки при наведении -->
        <div class="artboard-title">Подсказки при наведении</div>
        <div class="arboard-block tooltips-temp">

          <div class="title h3">C помощью атрибута tooltip и CSS</div>
          <div>
            <div tooltip="Подсказка">Обычная подсказка сверху</div>
            <div tooltip="Подсказка" flow="down">Обычная подсказка снизу</div>
            <div tooltip="Подсказка" flow="left">Обычная подсказка слева</div>
            <div tooltip="Подсказка" flow="right">Обычная подсказка справа</div>
            <div tooltip="Подсказка" help>Желтая подсказка</div>
            <div tooltip="Договор от 31.10.2016&#10Дата завершения 04.12.2019&#10Заключен с ООО «ТОП СПОРТС»">Подcказка в несколько строк</div>
            <div tooltip="Подсказка&#10в несколько строк&#10с текстом по центру" text="center">Подcказка в несколько строк c текстом по центру</div>
          </div>
          <br>
          <div class="title h3">C помощью дата-атрибута data-toolti и JS</div>
          <div>
            <div data-tooltip="Подсказка">Обычная подсказка сверху</div>
            <div data-tooltip="Подсказка" flow="down">Обычная подсказка снизу</div>
            <div data-tooltip="Подсказка" flow="left">Обычная подсказка слева</div>
            <div data-tooltip="Подсказка" flow="right">Обычная подсказка справа</div>
            <div data-tooltip="Подсказка" help>Желтая подсказка</div>
            <div data-tooltip="<div>Договор от 31.10.2016</div><div>Дата завершения 04.12.2019</div><div>Заключен с ООО «ТОП СПОРТС»</div>">Подcказка в несколько строк</div>
            <div data-tooltip="<div>Подсказка</div><div>в несколько строк</div><div>с текстом по центру</div>" text="center">Подcказка в несколько строк c текстом по центру</div>
            <div id="tooltip" data-tooltip="Подсказка<br>в несколько строк">Подсказка с html-таблицей (текст добавлен через js)</div>
          </div>

        </div>

        <!-- Иконки (ecли нужно вставить как svg, то заходим в файл и копируем) -->
        <div class="artboard-title">Иконки</div>
        <div class="arboard-block icons-temp row">

          <div class="profile icon"></div>
          <div class="notifications icon"></div>
          <div class="burger icon"></div>
          <div class="question icon"></div>
          <div class="settings icon"></div>
          <div class="add icon"></div>
          <div class="relay icon" style="display: block;"></div>

          <div class="triangle icon"></div>
          <div class="triangle white icon"></div>
          <div class="triangle dark icon"></div>
          <div disabled>
            <div class="triangle dark icon"></div>
          </div>

          <div class="close icon"></div>
          <div class="close white icon"></div>
          <div class="close dark icon"></div>
          <div class="disabled">
            <div class="close white icon"></div>
          </div>

          <div class="lock icon full"></div>
          <div class="lock icon limit"></div>
          <div class="lock icon off"></div>

          <div class="mark icon process"></div>
          <div class="mark icon done"></div>
          <div class="mark icon fail"></div>

          <div class="search icon"></div>
          <div class="search white icon"></div>
          <div class="search dark icon"></div>

          <div class="open icon"></div>
          <div class="open white icon"></div>
          <div class="open dark icon"></div>
          <div class="close">
            <div class="open icon"></div>
          </div>
          <div class="close">
            <div class="open white icon"></div>
          </div>
          <div class="close">
            <div class="open dark icon"></div>
          </div>

          <div class="sort down icon"></div>
          <div class="checked">
            <div class="sort down icon"></div>
          </div>
          <div class="sort up icon"></div>
          <div class="checked">
            <div class="sort up icon"></div>
          </div>

          <div class="cart icon"></div>
          <div class="cart white icon"></div>
          <div class="cart red icon"></div>
          <div class="cart in-circle icon"></div>

          <div class="attention icon"></div>
          <div class="attention white icon"></div>
          <div class="attention red icon"></div>

          <div class="filter icon"></div>
          <div class="sum icon"></div>
          <div class="edit icon"></div>
          <div class="maximize icon"></div>
          <div class="trash icon"></div>
          <div class="download icon"></div>
          <div class="download icon disabled"></div>
          <div class="wallet icon"></div>
          <div class="barcode icon"></div>

          <div class="arrow icon"></div>
          <div class="arrow blue icon"></div>

          <div class="carousel for-slider">
            <div class="left-btn"></div>
            <div class="right-btn"></div>
          </div>

          <div class="loader icon"></div>

        </div>

        <!-- Кнопки -->
        <div class="artboard-title">Кнопки</div>
        <div class="arboard-block btns-temp">

          <div class="row">
            <div class="btn">Базовая кнопка</div>
            <div class="sub-act btn">Кнопка второстепенного действия</div>
            <div class="act btn">Кнопка действия</div>
            <div class="btn trash">Кнопка удаления</div>
          </div>
          <br>
          <div>Заблокированные кнопки (можно с помощью класса, а можно с помощь атрибута disabled):</div>
          <div class="sub-act btn disabled">Любая кнопка - КЛАСС disabled</div>
          <div class="sub-act btn" disabled>Любая кнопка - АТРИБУТ disabled</div>

        </div>

        <!-- Пилюли -->
        <div class="artboard-title">Пилюли</div>
        <div class="arboard-block pill-temp">

          <div>Cо статусами заказа (как чекбоксы, можно попереключать):</div>
          <div class="pill ctr vputi c10 checked" onclick="toggle(event)">Ожидается</div>
          <div class="pill ctr vnali c10 checked" onclick="toggle(event)">В наличии</div>
          <div class="pill ctr sobrn c10 checked" onclick="toggle(event)">Собран</div>
          <div class="pill ctr otgrz c10 checked" onclick="toggle(event)">Отружен</div>
          <div class="pill ctr nedop c10 checked" onclick="toggle(event)">Непоставка</div>
          <br>
          <br>

          <div>Cо статусами заказа:</div>
          <div class="pill vputi c10">Ожидается</div>
          <div class="pill vnali c10">В наличии</div>
          <div class="pill sobrn c10">Собран</div>
          <div class="pill otgrz c10">Отружен</div>
          <div class="pill nedop c10">Непоставка</div>
          <br>
          <br>

          <div>Cо статусами доступа:</div>
          <div class="pill access full">Полный</div>
          <div class="pill access limit">Частичный</div>
          <div class="pill access off">Отключен</div>
          <br>
          <br>

          <div>Cо статусами рекламаций:</div>
          <div class="pill recl" data-status="1">Зарегистрирована</div>
          <div class="pill recl" data-status="2">Обрабатывается</div>
          <div class="pill recl" data-status="3">Удовлетворена</div>
          <div class="pill recl" data-status="4">Не удовлетворена</div>
          <div class="pill recl" data-status="5">Исполнена</div>

        </div>

        <!-- Чекбоксы -->
        <div class="artboard-title">Чекбоксы</div>
        <div class="arboard-block check-temp">

          <div>Любой чекбокс в состоянии "выключен":</div>
          <div>
            <div class="checkbox icon"></div>
          </div>
          <div>Базовый чекбокс в состоянии "включен":</div>
          <div class="checked">
            <div class="checkbox icon"></div>
          </div>
          <div>Оранжевый чекбокс в состоянии "включен":</div>
          <div class="checked">
            <div class="checkbox orange icon"></div>
          </div>
          <div>Синий чекбокс в состоянии "включен":</div>
          <div class="checked">
            <div class="checkbox dark icon"></div>
          </div>
          <div>Любой чекбокс в состоянии "Заблокирован":</div>
          <div class="disabled">
            <div class="checkbox icon"></div>
          </div>
          <div>Чекбокс для выпадающих списков:</div>
          <div class="checked">
            <div class="check icon"></div>
          </div>
          <div>Чекбоксы которые можно попереключать:</div>
          <div class="row" onclick="toggle(event)">
            <div class="checkbox icon"></div>
            <div>Можно клинуть тут</div>
          </div>
          <div class="row" onclick="toggle(event)">
            <div class="checkbox orange icon"></div>
            <div>Можно клинуть тут</div>
          </div>
          <div class="row" onclick="toggle(event)">
            <div class="checkbox dark icon"></div>
            <div>Можно клинуть тут</div>
          </div>
          <div class="row" onclick="toggle(event)">
            <div class="check icon"></div>
            <div>Можно клинуть тут</div>
          </div>

        </div>

        <!-- Радио-кнопки -->

        <div class="artboard-title">Радио-кнопки</div>
        <div class="arboard-block radio-temp">

          <div>Радио-кнопка в состоянии "выключена":</div>
          <div>
            <div class="radio icon"></div>
          </div>
          <div>Радио-кнопка в состоянии "включена"</div>
          <div class="checked">
            <div class="radio icon"></div>
          </div>
          <div>Радио-кнопка, которую можно попереключать:</div>
          <div class="row" onclick="toggle(event)">
            <div class="radio icon"></div>
            <div>Можно клинуть тут</div>
          </div>

        </div>

        <!-- Чекбоксы и радио-кнопки для формы (на основе браузерных): -->

        <div class="artboard-title">Чекбоксы и радио-кнопки для формы (на основе браузерных)</div>
        <div class="arboard-block radio-temp">

          <div>Работают без подключения функционала:</div>
          <div class="option row">
            <input type="radio" value="Какое-то значение" name="some_name[group_type]">
            <div class="radio icon"></div>
            <div>Радио-кнопка 1</div>
          </div>
          <div class="option row">
            <input type="radio" value="Какое-то значение" name="some_name[group_type]">
            <div class="radio icon"></div>
            <div>Радио-кнопка 2</div>
          </div>
          <div class="option row">
            <input type="checkbox" value="Какое-то значение" name="some_name[group_type]">
            <div class="checkbox icon"></div>
            <div>Чекбокс 1</div>
          </div>
          <div class="option row">
            <input type="checkbox" value="Какое-то значение" name="some_name[group_type]">
            <div class="checkbox dark icon"></div>
            <div>Чекбокс 2</div>
          </div>
          <div class="option row">
            <input type="checkbox" value="Какое-то значение" name="some_name[group_type]">
            <div class="checkbox orange icon"></div>
            <div>Чекбокс 3</div>
          </div>
          <div>Любой чекбокс в состоянии "Заблокирован":</div>
          <div class="option row">
            <input type="checkbox" value="Какое-то значение" name="some_name[group_type]" disabled>
            <div class="checkbox orange icon"></div>
            <div>Чекбокс 3</div>
          </div>

        </div>

        <!-- Тогглы -->
        <div class="artboard-title">Тогглы</div>
        <div class="arboard-block toggle-temp">

          <div style="font-size: 20px;">Тоглы на светлый фон:</div>
          <div>Тоггл в состоянии "выключен":</div>
          <div>
            <div class="toggle">
              <div class="toggle-in"></div>
            </div>
          </div>
          <div>Тоггл в состоянии "включен":</div>
          <div class="checked">
            <div class="toggle">
              <div class="toggle-in"></div>
            </div>
          </div>
          <div class="toggle checked">
            <div class="toggle-in"></div>
          </div>
          <div>Тогл, который можно попереключать:</div>
          <div onclick="toggle(event)">
            <div class="toggle">
              <div class="toggle-in"></div>
            </div>
          </div>
          <div class="toggle" onclick="toggle(event)">
            <div class="toggle-in"></div>
          </div>
          <br>
          <div style="font-size: 20px;">Тоглы на темный фон:</div>
          <div style="background-color: #53606F;">
            <div class="text white">Тоггл в состоянии "выключен":</div>
            <div>
              <div class="toggle dark">
                <div class="toggle-in"></div>
              </div>
            </div>
            <div class="text white">Тоггл в состоянии "включен":</div>
            <div class="checked">
              <div class="toggle dark">
                <div class="toggle-in"></div>
              </div>
            </div>
            <div class="toggle dark checked">
              <div class="toggle-in"></div>
            </div>
            <div class="text white">Тогл, который можно попереключать:</div>
            <div onclick="toggle(event)">
              <div class="toggle dark">
                <div class="toggle-in"></div>
              </div>
            </div>
            <div class="toggle dark" onclick="toggle(event)">
              <div class="toggle-in"></div>
            </div>
            <br>
          </div>
        </div>

        <!-- Степпер -->
        <div class="artboard-title">Степпер</div>
        <div class="arboard-block counter-temp">

          <div>Степпер в состоянии "ничего не выбрано":</div>
          <div class="qty qty-box row">
            <div class="btn minus" data-tooltip="Уменьшить"></div>
            <input class="choiced-qty" type="text" value="0" data-value="0" autocomplete="off" onblur="onBlurInput(this)" onfocus="onFocusInput(this)" oninput="onlyNumb(event)">
            <div class="btn plus" data-tooltip="Добавить"></div>
          </div>
          <div>Степпер в состоянии "выбрано":</div>
          <div class="qty qty-box row added">
            <div class="btn minus" data-tooltip="Уменьшить"></div>
            <input class="choiced-qty" type="text" value="1" data-value="1" autocomplete="off" onblur="onBlurInput(this)" onfocus="onFocusInput(this)" oninput="onlyNumb(event)">
            <div class="btn plus" data-tooltip="Добавить"></div>
          </div>
          <div>Степпер в состоянии заблокирован:</div>
          <div class="qty qty-box row disabled">
            <div class="btn minus" data-tooltip="Уменьшить" onclick="changeQty(event, 15)"></div>
            <input class="choiced-qty" disabled type="text" value="0" data-value="0" autocomplete="off" onchange="changeQty(event, 15)" onblur="onBlurInput(this)" onfocus="onFocusInput(this)" oninput="onlyNumb(event)">
            <div class="btn plus" data-tooltip="Добавить" onclick="changeQty(event, 15)"></div>
          </div>
          <div>Степпер, который можно попереключать:</div>
          <div class="qty qty-box row">
            <div class="btn minus" data-tooltip="Уменьшить" onclick="changeQty(event, 15)"></div>
            <input class="choiced-qty" type="text" value="0" data-value="0" autocomplete="off" onchange="changeQty(event, 15)" onblur="onBlurInput(this)" onfocus="onFocusInput(this)" oninput="onlyNumb(event)">
            <div class="btn plus" data-tooltip="Добавить" onclick="changeQty(event, 15)"></div>
          </div>
          <div>Степпер, который можно попереключать и нельзя выбрать значение меньше 1:</div>
          <div class="qty qty-box row added">
            <div class="btn minus" data-tooltip="Уменьшить" onclick="changeQty(event, 15, 1)"></div>
            <input class="choiced-qty" name="count" type="text" value="1" data-value="1" autocomplete="off" onchange="changeQty(event, 15, 1)" onblur="onBlurInput(this)" onfocus="onFocusInput(this)" oninput="onlyNumb(event)">
            <div class="btn plus" data-tooltip="Добавить" onclick="changeQty(event, 15, 1)"></div>
          </div>
        </div>

        <!-- Текстовое поле -->
        <div class="artboard-title">Текстовое поле</div>
        <div class="arboard-block textarea-temp">

          <div>Текстовое поле без счетчика:</div>
          <div>
            <textarea autocomplete="off" placeholder="Введите текст"></textarea>
          </div>
          <br>
          <div>Текстовое поле со счетчиком:</div>
          <div>
            <textarea name="comment1" maxlength="300" autocomplete="off" placeholder="Введите текст" oninput="textareaCounter(this)"></textarea>
            <div class="text-counter" data-count="comment1">Знаков осталось: <span>300</span></div>
          </div>
          <br>
          <div>Текстовое поле при ошибке (в формах):</div>
          <div class="form-wrap error">
            <textarea autocomplete="off" placeholder="Введите текст"></textarea>
            <div class="err">Ошибка</div>
          </div>
          <br>
          <div>Заблокированное текстовое поле:</div>
          <div class="form-wrap ">
            <textarea autocomplete="off" placeholder="Введите текст" disabled></textarea>
          </div>

        </div>

        <!-- Поле ввода -->
        <div class="artboard-title">Поле ввода</div>
        <div class="arboard-block input-temp">

          <div>Поле ввода:</div>
          <input type="text" placeholder="Введите текст">
          <br>
          <br>
          <div>Поле ввода при ошибке (в формах):</div>
          <div class="form-wrap error">
            <input type="text" placeholder="Введите текст">
          </div>
          <br>
          <div>Заблокированное поле ввода:</div>
          <input type="text" placeholder="Введите текст" disabled>

        </div>

        <!-- Поле поиска -->
        <div class="artboard-title">Поле поиска</div>
        <div class="arboard-block search-temp">

          <div>Простая форма поиска:</div>
          <form class="search row" action="#">
            <input type="text" data-value="" placeholder="Очень длинное название подсказки скрывается">
            <input class="search icon" type="submit" value="">
            <div class="close icon"></div>
          </form>
          <br>
          <div>Простая форма поиска поиска, когда поиск закончен:</div>
          <form class="search row" action="#">
            <input type="text" data-value="Поиск закончен" value="Поиск закончен" placeholder="Поиск...">
            <input class="search icon" type="submit" value="" style="display: none;">
            <div class="close icon" style="visibility: visible;"></div>
          </form>
          <br>
          <div>Раскрывающаяся форма поиска:</div>
          <div class="example row">
            <form class="search positioned row">
              <input type="text" data-value="" placeholder="Поиск...">
              <input class="search icon" type="submit" value="">
              <div class="close icon"></div>
            </form>
          </div>
          <br>
          <div>Форма поиска с подсказками:</div>
          <form id="search" class="search activate select row">
            <input type="text" data-value="" autocomplete="off" placeholder="Поиск...">
            <input class="search icon" type="submit" value="">
            <div class="close icon"></div>
            <div class="drop-down">
              <div class="not-found">Совпадений не найдено</div>
              <div class="items">
                <!-- <div class="item" data-value="#item#">#item#</div> при заполнении динамически -->
                <div class="item" data-value="1">1</div>
                <div class="item" data-value="11">11</div>
                <div class="item" data-value="12">12</div>
                <div class="item" data-value="13">13</div>
                <div class="item" data-value="14">14</div>
                <div class="item" data-value="15">15</div>
                <div class="item" data-value="16">16</div>
                <div class="item" data-value="17">17</div>
                <div class="item" data-value="18">18</div>
                <div class="item" data-value="19">19</div>
                <div class="item" data-value="111">111</div>
                <div class="item" data-value="112">112</div>
                <div class="item" data-value="113">113</div>
                <div class="item" data-value="114">114</div>
                <div class="item" data-value="115">115</div>
                <div class="item" data-value="2">2</div>
                <div class="item" data-value="3">3</div>
                <div class="item" data-value="4">4</div>
                <div class="item" data-value="5">5</div>
                <div class="item" data-value="6">6</div>
                <div class="item" data-value="7">7</div>
                <div class="item" data-value="8">8</div>
                <div class="item" data-value="9">9</div>
              </div>
            </div>
          </form>

        </div>

        <!-- Поля загрузки файлов -->
        <div class="artboard-title">Поля загрузки файлов</div>
        <div class="arboard-block download-temp">

          <!-- в атрибуте accept указываются форматы файлов, которые разрешено загрузить, например accept=".xls,.xlsx" -->
          <!-- для возможности выбора сразу нескольких файлов добавляется атрибут multiple -->
          <!-- у input обязательно должно быть id, которое обязательно необходимо указать в атрибуте for тега label (кнопки выбора) -->

          <div>Поле загрузки одного файла:</div>
          <div class="file-wrap">
            <input id="load-file1" type="file" accept=".xls,.xlsx">
            <div class="file-name">Файл не выбран</div>
            <label class="btn sub-act" for="load-file1">Выберите файл</label>
          </div>
          <br>
          <div>Поле загрузки нескольких файлов:</div>
          <div class="file-wrap">
            <input id="load-file2" type="file" accept=".xls,.xlsx" multiple>
            <div class="file-name">Файлы не выбраны</div>
            <label class="btn sub-act" for="load-file2">Выберите файлы</label>
          </div>
          <br>
          <div>Поле загрузки одной картинки с предпросмотром:</div>
          <div class="file-wrap">
            <input id="load-img" type="file" accept="image/*">
            <div class="file-preview"></div>
            <label class="title" for="load-img">лого</label>
          </div>

        </div>

        <!-- Выпадающие списки -->
        <div class="artboard-title">Выпадающие списки</div>
        <div class="arboard-block drop-down-temp">

          <div>Системный селект</div>
          <select>
            <option value="1" default>Select</option>
            <option value="1">1</option>
            <option value="1">2</option>
          </select>
          <br>
          <br>
          <div>Системный селект заблокированный</div>
          <select disabled>
            <option value="1" default>Select</option>
            <option value="1">1</option>
            <option value="1">2</option>
          </select>
          <br>
          <br>
          <div>Кастомный селект</div>
          <div id="select" class="activate select">
            <!-- добавляем скрытый инпут, когда добавляем выпадашку в форму -->
            <!-- <input type="hidden" value="" name="some_name"> -->
            <div class="head row">
              <div class="title">Select</div>
              <div class="triangle icon"></div>
            </div>
            <div class="drop-down">
              <div class="item" data-value="default">По умолчанию</div>
              <div class="item" data-value="1">Значение 1</div>
              <div class="item" data-value="2">Значение 2</div>
              <div class="item" data-value="3">Значение 3</div>
              <div class="item" data-value="4">Значение 4</div>
              <div class="item" data-value="5">Значение 5</div>
            </div>
          </div>
          <br>
          <div>Кастомный чекбокс</div>
          <div id="checkbox" class="activate checkbox">
            <!-- добавляем скрытый инпут, когда добавляем выпадашку в форму -->
            <!-- <input type="hidden" value="" name="some_name"> -->
            <div class="head row">
              <div class="title">Checkbox</div>
              <div class="triangle icon"></div>
            </div>
            <div class="drop-down">
              <div class="item row" data-value="1">
                <div>Значение 1</div>
                <div class="check icon"></div>
              </div>
              <div class="item row" data-value="2">
                <div>Значение 2</div>
                <div class="check icon"></div>
              </div>
              <div class="item row" data-value="3">
                <div>Значение 3</div>
                <div class="check icon"></div>
              </div>
              <div class="item row" data-value="4">
                <div>Значение 4</div>
                <div class="check icon"></div>
              </div>
              <div class="item row" data-value="5">
                <div>Значение 5</div>
                <div class="check icon"></div>
              </div>
              <div class="item row" data-value="5">
                <div>Значение 6</div>
                <div class="check icon"></div>
              </div>
              <div class="item row" data-value="5">
                <div>Значение 7</div>
                <div class="check icon"></div>
              </div>
            </div>
          </div>
          <br>
          <div>Кастомный выпадающий список с сортировкой, поиском и селектом</div>
          <div id="box-select" class="activate box select">
            <div class="head row">
              <div class="title">Box-select</div>
              <div class="icons row">
                <div class="triangle icon"></div>
                <div class="filter icon"></div>
              </div>
            </div>
            <div class="drop-down">
              <div class="group sort">
                <div class="title">Сортировка</div>
                <div class="item sort down row">
                  <div class="sort icon"></div>
                  <div>От А до Я</div>
                </div>
                <div class="item sort up row">
                  <div class="sort icon"></div>
                  <div>От Я до А</div>
                </div>
              </div>
              <div class="group filter">
                <div class="title">Фильтр</div>
                <form class="search row" action="#">
                  <input type="text" data-value="" autocomplete="off" placeholder="Поиск...">
                  <input class="search icon" type="submit" value="">
                  <div class="close icon"></div>
                </form>
                <div class="not-found">Совпадений не найдено</div>
                <div class="items">
                  <div class="item" data-value="default">Сбросить</div>
                  <div class="item" data-value="1">Значение 1</div>
                  <div class="item" data-value="2">Значение 2</div>
                  <div class="item" data-value="3">Значение 3</div>
                  <div class="item" data-value="4">Значение 4</div>
                  <div class="item" data-value="5">Значение 5</div>
                </div>
              </div>
            </div>
          </div>
          <br>
          <div>Кастомный выпадающий список с сортировкой, поиском и чекбоксом</div>
          <div id="box-checkbox" class="activate box checkbox">
            <div class="head row">
              <div class="title">Box-checkbox</div>
              <div class="icons row">
                <div class="triangle icon"></div>
                <div class="filter icon"></div>
              </div>
            </div>
            <div class="drop-down">
              <div class="group sort">
                <div class="title">Сортировка</div>
                <div class="item sort down row">
                  <div class="sort icon"></div>
                  <div>От А до Я</div>
                </div>
                <div class="item sort up row">
                  <div class="sort icon"></div>
                  <div>От Я до А</div>
                </div>
              </div>
              <div class="group filter">
                <div class="title">Фильтр</div>
                <form class="search row" action="#">
                  <input type="text" data-value="" autocomplete="off" placeholder="Поиск...">
                  <input class="search icon" type="submit" value="">
                  <div class="close icon"></div>
                </form>
                <div class="not-found">Совпадений не найдено</div>
                <div class="items">
                  <div class="item row" data-value="1">
                    <div class="checkbox icon"></div>
                    <div>#item1#</div>
                  </div>
                  <div class="item row" data-value="2">
                    <div class="checkbox icon"></div>
                    <div>#item2#</div>
                  </div>
                  <div class="item row" data-value="3">
                    <div class="checkbox icon"></div>
                    <div>#item3#</div>
                  </div>
                  <div class="item row" data-value="4">
                    <div class="checkbox icon"></div>
                    <div>#item4#</div>
                  </div>
                  <div class="item row" data-value="5">
                    <div class="checkbox icon"></div>
                    <div>#item5#</div>
                  </div>
                  <div class="item row" data-value="6">
                    <div class="checkbox icon"></div>
                    <div>#item6#</div>
                  </div>
                  <div class="item row" data-value="7">
                    <div class="checkbox icon"></div>
                    <div>#item7#</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <br>
          <div>Кастомный выпадающий список с сортировкой и поиском по дате (чекбоксов или селекта тут быть не может)</div>
          <div id="box-date" class="activate box checkbox">
            <div class="head row">
              <div class="title">Box-date</div>
              <div class="icons row">
                <div class="triangle icon"></div>
                <div class="filter icon"></div>
              </div>
            </div>
            <div class="drop-down">
              <div class="group sort">
                <div class="title">Сортировка</div>
                <div class="item sort down row">
                  <div class="sort icon"></div>
                  <div>Сначала новые</div>
                </div>
                <div class="item sort up row">
                  <div class="sort icon"></div>
                  <div>Сначала старые</div>
                </div>
              </div>
              <div class="group filter">
                <div class="title">Фильтр</div>
                <div class="calendar-wrap">
                  <input type="text" value="" data-type="date" placeholder="ДД.ММ.ГГГГ" maxlength="10" autocomplete="off" oninput="onlyDateChar(event)">
                </div>
              </div>
            </div>
          </div>
          <br>
          <div>Кастомный выпадающий список с поиском в заголовке и селектом</div>
          <div id="select-search" class="activate search select">
            <div class="head row">
              <form class="search row" action="#">
                <input type="text" data-value="" autocomplete="off" placeholder="Select-search">
              </form>
              <div class="triangle icon"></div>
            </div>
            <div class="drop-down">
              <div class="not-found">Совпадений не найдено</div>
              <div class="items">
                <div class="item" data-value="default">По умолчанию</div>
                <div class="item" data-value="1">Значение 1</div>
                <div class="item" data-value="2">Значение 2</div>
                <div class="item" data-value="3">Значение 3</div>
                <div class="item" data-value="4">Значение 4</div>
                <div class="item" data-value="5">Значение 5</div>
              </div>
            </div>
          </div>
          <br>
          <div>Кастомный выпадающий список с поиском в заголовке и чекбоксом</div>
          <div id="checkbox-search" class="activate search checkbox">
            <div class="head row">
              <form class="search row" action="#">
                <input type="text" data-value="" autocomplete="off" placeholder="Checkbox-search">
                <input class="search icon" type="submit" value="">
                <div class="close icon"></div>
              </form>
              <div class="triangle icon"></div>
            </div>
            <div class="drop-down">
              <div class="not-found">Совпадений не найдено</div>
              <div class="items">
                <div class="item row" data-value="1">
                  <div>Значение 1</div>
                  <div class="check icon"></div>
                </div>
                <div class="item row" data-value="2">
                  <div>Значение 2</div>
                  <div class="check icon"></div>
                </div>
                <div class="item row" data-value="3">
                  <div>Значение 3</div>
                  <div class="check icon"></div>
                </div>
                <div class="item row" data-value="4">
                  <div>Значение 4</div>
                  <div class="check icon"></div>
                </div>
                <div class="item row" data-value="5">
                  <div>Значение 5</div>
                  <div class="check icon"></div>
                </div>
                <div class="item row" data-value="5">
                  <div>Значение 6</div>
                  <div class="check icon"></div>
                </div>
                <div class="item row" data-value="5">
                  <div>Значение 7</div>
                  <div class="check icon"></div>
                </div>
              </div>
            </div>
          </div>
          <br>
          <div>Кастомный список заблокированный</div>
          <div id="select" class="activate select" disabled>
            <div class="head row">
              <div class="title">Select</div>
              <div class="triangle icon"></div>
            </div>
            <div class="drop-down">
              <div class="item" data-value="default">По умолчанию</div>
              <div class="item" data-value="1">Значение 1</div>
              <div class="item" data-value="2">Значение 2</div>
              <div class="item" data-value="3">Значение 3</div>
              <div class="item" data-value="4">Значение 4</div>
              <div class="item" data-value="5">Значение 5</div>
            </div>
          </div>
          <br>
          <div>Кастомный календарь с текущей начальной датой</div>
          <div id="calendar1" class="calendar-wrap">
            <input type="text" value="" name="" data-type="date" placeholder="ДД.ММ.ГГГГ" maxlength="10" autocomplete="off" oninput="onlyDateChar(event)">
          </div>
          <br>
          <br>
          <div>Кастомный календарь с заданной начальной датой</div>
          <div id="calendar2" class="calendar-wrap">
            <input type="text" value="" name="" data-type="date" data-begin="01.01.1980" placeholder="ДД.ММ.ГГГГ" maxlength="10" autocomplete="off" oninput="onlyDateChar(event)">
          </div>
          <br>
          <br>
          <div>Кастомный календарь с выбором периода</div>
          <div id="calendar3" class="calendar-wrap">
            <input type="text" value="" name="" data-type="range" data-begin="01.01.1980" placeholder="ДД.ММ.ГГГГ - ДД.ММ.ГГГГ" maxlength="23" autocomplete="off" oninput="onlyDateChar(event)">
          </div>

        </div>

        <!-- Скролл -->
        <div class="artboard-title">Скролл</div>
        <div class="arboard-block scroll-temp">

          <div class="exapmle">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Id quam deserunt laborum voluptate ullam sed laudantium? Expedita dignissimos aliquid temporibus voluptatem obcaecati nam, ipsa quaerat dolorem explicabo necessitatibus, quam recusandae!
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nihil ea reprehenderit atque reiciendis dolorem laudantium ratione omnis odit quaerat, recusandae iusto nam minus accusamus in, officia aut quo commodi voluptatem.
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iure, voluptate labore voluptates exercitationem ducimus quibusdam amet, illo doloremque et nostrum magnam explicabo laborum iusto consectetur quaerat praesentium officiis sint in.
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ut corrupti sit, eveniet officiis nulla ex velit assumenda ullam nesciunt hic nihil ea commodi quisquam! Eos dolor earum repudiandae dolorem magnam?
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Accusantium, mollitia cupiditate possimus tempore veritatis, necessitatibus rem laborum delectus sit, voluptates illum sunt cumque ipsa id praesentium explicabo deserunt velit odit.
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Numquam illum laboriosam cumque maiores quasi nulla odit unde velit ex dolore, perspiciatis sit vitae, minima provident ducimus nobis quibusdam quod delectus?
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias quasi dolore voluptatibus provident debitis labore autem fugiat blanditiis, consectetur tempora quam eum quis possimus dolor eligendi eos corporis omnis error.
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, cumque incidunt error sapiente, delectus tempore qui dolore, numquam commodi magnam ipsum suscipit fugit quos similique maxime harum neque quae ut?
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium in reprehenderit cupiditate illo minus sapiente laborum ipsum, nesciunt nemo sit sunt nobis temporibus quidem voluptas quod, fuga et saepe fugit?
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, reiciendis facilis ex ratione quis beatae esse vitae necessitatibus assumenda laborum qui optio harum voluptatem excepturi soluta repellendus mollitia et distinctio.
            Recusandae, harum! Cum quidem ratione possimus quae dolorem quia rerum consectetur corrupti laboriosam. At officia unde corporis, distinctio perferendis odit inventore culpa facilis possimus! Dolore necessitatibus rerum unde libero commodi?
            Voluptatibus maiores laborum accusamus unde voluptate architecto dolorum facilis animi! Error dolor ab officiis nam rem, excepturi suscipit iure dolores laboriosam, eos optio quisquam fugiat aperiam consequuntur distinctio. Delectus, numquam.
            Corporis, dolorem eos. Nihil suscipit corporis molestiae culpa ipsum dolore? Fugiat, fuga eos veniam neque omnis eligendi perspiciatis maiores rem perferendis enim culpa autem iusto laboriosam numquam corrupti itaque recusandae.
            Animi culpa autem et ullam, fugit odit consequatur excepturi, labore tenetur repudiandae, ipsam mollitia recusandae dolore non praesentium quod eaque? Praesentium explicabo consectetur modi cupiditate velit, distinctio repudiandae sed voluptate?
            Sint eius expedita, perferendis quod nisi ducimus dolorem nihil possimus repudiandae consequuntur asperiores quas blanditiis culpa, laboriosam illo perspiciatis amet sed praesentium neque, vero est error obcaecati? Autem, animi dolore.
            Amet doloremque excepturi nesciunt adipisci facere necessitatibus, suscipit at blanditiis neque totam exercitationem voluptatem impedit velit? Veritatis ducimus eos culpa fugiat pariatur, nam nisi illum fuga aliquid ratione facere illo.
            Hic maxime, dolorum totam quos quia veniam. Suscipit neque architecto laudantium aperiam repudiandae! Incidunt deserunt mollitia voluptatem corrupti soluta, voluptates debitis, ex assumenda eius qui, at architecto vel vitae consectetur.
            Explicabo similique asperiores sint perspiciatis aut nemo nesciunt nostrum. Quas totam nesciunt animi! Cumque similique blanditiis ratione, iure, vero culpa laudantium tempore, dolor error adipisci alias impedit animi magni maiores!
            Magnam hic eius accusantium dolorem totam, tempora accusamus facilis officiis, provident ducimus maiores! Obcaecati commodi laudantium dolor dolores, quas molestias voluptatibus modi laborum aliquam corporis reprehenderit sit minus ducimus eum.
            Repudiandae sint quibusdam cupiditate, necessitatibus unde aut iure explicabo possimus. Quas doloremque autem unde consequuntur amet tempore? Sit tempora, explicabo quia facilis dignissimos commodi error sed aut eligendi iure nulla?
            Deleniti ab quas optio cupiditate dolore praesentium vero voluptate, possimus sed tempora consequuntur fugiat a velit itaque hic placeat fuga deserunt, tenetur quis voluptatem nisi inventore autem asperiores! Rem, labore!
            Deleniti nisi eos porro vel, neque voluptatem! Magnam odio velit sit qui in. Ab, animi rerum, alias voluptates eos quis quas optio sapiente sunt earum, eius et voluptatem! Dolores, sed.
            Aperiam corrupti debitis consequuntur? Tempore odio, aperiam cupiditate aliquam reprehenderit, quo iste ex illo nisi minima nihil nemo hic? Dicta, nam. Totam reiciendis repudiandae consectetur eius nihil aut cum minima.
            Sit dolores doloribus hic veritatis tenetur suscipit ea beatae id sed maiores ut nesciunt repellendus magnam explicabo praesentium aliquam maxime natus dolorum facilis, possimus ipsam qui nostrum? Dicta, dolore provident!
            In fuga, dolorem labore enim expedita assumenda aperiam quos ipsum eveniet, quia a, sequi consequatur non modi ipsa quasi temporibus dolorum rem similique at incidunt harum voluptas sint officiis. Quidem?
            Sunt aliquam consectetur rem odit eaque ab unde neque eum! Blanditiis, nisi! Voluptates corrupti neque perspiciatis earum dolore id excepturi rerum ab omnis dolorum, consequuntur minus delectus. Quod, eveniet aperiam?
            Incidunt quae officiis, vel maiores a adipisci reiciendis. Facere quibusdam voluptas consequatur optio dolore omnis repellendus ut sapiente, esse quod accusamus quos est libero consectetur tempora aspernatur magnam temporibus maiores.
            Incidunt suscipit consequuntur magni autem ullam fugit neque, vitae maiores blanditiis veritatis tempore, iure mollitia iste. Quas doloremque voluptas eveniet eligendi omnis est ratione sapiente eum quia ipsa, minima quam.
            Eos ullam debitis cupiditate iure distinctio. Necessitatibus, non veritatis ipsam error dolores quas aliquid, in perspiciatis et odio, nisi sapiente labore. Quis libero dicta ullam qui fuga eligendi perspiciatis sapiente.
          </div>

        </div>

        <!-- Раскрывающийся блок -->
        <div class="artboard-title">Раскрывающийся блок</div>
        <div class="arboard-block switch-temp">

          <div class="switch">
            <div class="head row" onclick="switchContent(event)">
              <div class="title white h1">Нажми, чтобы скрыть / раскрыть</div>
              <div class="open white icon switch-icon"></div>
            </div>
            <div class="switch-cont">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda, ipsa dolore alias ipsam odit quas impedit doloribus, provident magnam architecto explicabo laborum blanditiis vero perferendis tempora fugiat nostrum ratione minus.
              Totam, nostrum doloremque laboriosam facere fugiat, minima impedit itaque fuga voluptates adipisci sed soluta voluptas, quisquam laudantium. Veritatis dicta itaque quia aut optio expedita cupiditate deserunt pariatur et? Culpa, molestiae!
              Reprehenderit accusantium harum assumenda possimus, excepturi quasi earum eligendi adipisci id repudiandae iste voluptate suscipit perspiciatis tempore. Veniam corporis impedit sunt quae vero, vitae, sint est, iusto deleniti eligendi quos.
              Officia temporibus reiciendis dolores aliquam odio alias eius non recusandae eligendi, minima, possimus earum? Recusandae dolore accusamus deserunt reprehenderit necessitatibus, iure corporis, tempora nostrum excepturi magnam aut illo ut libero!
              Quisquam, repellendus. Ducimus iusto necessitatibus repellendus voluptates doloribus sapiente enim similique ad qui id velit accusantium numquam odio amet quis sequi fuga tempore, odit modi. Animi, ipsa expedita! Nihil, inventore?
              Facere recusandae corrupti, sed reiciendis aliquam ut, voluptates quia cumque velit beatae temporibus totam nesciunt nisi veniam enim repudiandae quidem delectus sunt similique inventore perspiciatis! Laborum esse minima debitis maxime.
              Veniam corporis inventore ipsam molestiae amet. Deleniti molestiae nihil aperiam sed vitae qui labore harum aliquam. Dicta iusto nisi illum, assumenda corrupti ab harum aperiam totam. Sapiente veniam eligendi atque.
              Maiores iste a quo. Aliquid, placeat cum obcaecati culpa ex accusantium. Natus libero obcaecati rerum, mollitia cum eos quisquam ex nulla molestiae sequi ducimus, laboriosam odit dolor? Doloremque, odio ullam.
              Nobis, fugit. Ipsum eaque quibusdam autem officia ipsa nemo nulla aperiam dolore recusandae quos, similique sed rem nihil perspiciatis laboriosam. Quas animi recusandae id. A voluptate quaerat illo aut blanditiis?
              Eaque quaerat non odio dolore tempore quo laboriosam consequuntur dignissimos provident delectus iure saepe, blanditiis ea ut ex molestiae voluptas sequi corporis illum distinctio similique ullam tenetur velit. Exercitationem, quisquam.
            </div>
          </div>

        </div>

        <!-- Блок фильтров -->
        <div class="artboard-title">Блок фильтров</div>
        <div class="arboard-block filters-temp">

          <div>Блок фильтров, который есть на всех разрешениях</div>
          <div class="relay icon" onclick="openPopUp('#filters1')"></div>
          <div id="filters1" class="pop-up-container filters visible">
            <div class="pop-up">
              <div class="pop-up-title row">
                <div class="title h2">Фильтры</div>
                <div class="close icon"></div>
              </div>
              <div class="pop-up-body">
                <div class="group switch">
                  <div class="title row" onclick="switchContent(event)">
                    <div class="title white h3">Название фильтра 1</div>
                    <div class="open white icon switch-icon"></div>
                  </div>
                  <div class="switch-cont">
                    <div class="items">
                      <div class="item switch close">
                        <div class="row">
                          <div class="title row">
                            <div class="checkbox icon"></div>
                            <div class="text">Вариант 1</div>
                          </div>
                          <div class="open icon switch-icon" onclick="switchContent(event)"></div>
                        </div>
                        <div class="items switch-cont">
                          <div class="item row">
                            <div class="checkbox icon"></div>
                            <div>Подвариант 1</div>
                          </div>
                          <div class="item row">
                            <div class="checkbox icon"></div>
                            <div>Подвариант 2</div>
                          </div>
                        </div>
                      </div>
                      <div class="item switch close">
                        <div class="row">
                          <div class="title row">
                            <div class="checkbox icon"></div>
                            <div class="text">Вариант 2</div>
                          </div>
                          <div class="open icon switch-icon" onclick="switchContent(event)"></div>
                        </div>
                        <div class="items switch-cont">
                          <div class="item row">
                            <div class="checkbox icon"></div>
                            <div>Подвариант 1</div>
                          </div>
                          <div class="item row">
                            <div class="checkbox icon"></div>
                            <div>Подвариант 2</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="more row #isMore#">
                      <div>Больше</div>
                      <div class="open light icon"></div>
                    </div>
                  </div>
                </div>
                <div class="group switch">
                  <div class="title row" onclick="switchContent(event)">
                    <div class="title white h3">Название фильтра 2</div>
                    <div class="open white icon switch-icon"></div>
                  </div>
                  <div class="switch-cont">
                    <div class="items">
                      <div class="item switch close">
                        <div class="row">
                          <div class="title row">
                            <div class="checkbox icon"></div>
                            <div class="text">Вариант 1</div>
                          </div>
                        </div>
                      </div>
                      <div class="item switch close">
                        <div class="row">
                          <div class="title row">
                            <div class="checkbox icon"></div>
                            <div class="text">Вариант 2</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="btns-wrap">
                  <div class="btn act">Показать (<span>0</span>)</div>
                </div>
              </div>
            </div>
          </div>

          <br>

          <div>Блок фильтров, который появляется с разрешения 1359px</div>
          <div class="relay icon" onclick="openPopUp('#filters2')"></div>
          <div id="filters2" class="pop-up-container filters">
            <div class="pop-up">
              <div class="pop-up-title row">
                <div class="title h2">Сортировки</div>
                <div class="close icon"></div>
              </div>
              <div class="pop-up-body">
                <div class="group switch">
                  <div class="title row" onclick="switchContent(event)">
                    <div class="title white h3">Название сортировки 1</div>
                    <div class="open white icon switch-icon"></div>
                  </div>
                  <div class="switch-cont">
                    <div class="item sort down row">
                      <div class="radio icon"></div>
                      <div>По возрастанию</div>
                    </div>
                    <div class="item sort up row">
                      <div class="radio icon"></div>
                      <div>По убыванию</div>
                    </div>
                  </div>
                </div>
                <div class="title row">
                  <div class="title h2">Фильтры</div>
                </div>
                <div class="group switch">
                  <div class="title row" onclick="switchContent(event)">
                    <div class="title white h3">Название фильтра 1</div>
                    <div class="open white icon switch-icon"></div>
                  </div>
                  <div class="switch-cont">
                    <div class="items">
                      <div class="item switch close">
                        <div class="row">
                          <div class="title row">
                            <div class="checkbox icon"></div>
                            <div class="text">Вариант 1</div>
                          </div>
                          <div class="open icon switch-icon" onclick="switchContent(event)"></div>
                        </div>
                        <div class="items switch-cont">
                          <div class="item row">
                            <div class="checkbox icon"></div>
                            <div>Подвариант 1</div>
                          </div>
                          <div class="item row">
                            <div class="checkbox icon"></div>
                            <div>Подвариант 2</div>
                          </div>
                        </div>
                      </div>
                      <div class="item switch close">
                        <div class="row">
                          <div class="title row">
                            <div class="checkbox icon"></div>
                            <div class="text">Вариант 2</div>
                          </div>
                          <div class="open icon switch-icon" onclick="switchContent(event)"></div>
                        </div>
                        <div class="items switch-cont">
                          <div class="item row">
                            <div class="checkbox icon"></div>
                            <div>Подвариант 1</div>
                          </div>
                          <div class="item row">
                            <div class="checkbox icon"></div>
                            <div>Подвариант 2</div>
                          </div>
                        </div>
                      </div>
                      <div class="item row">
                        <div class="checkbox icon"></div>
                        <div>Вариант 3</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="group switch">
                  <div class="title row" onclick="switchContent(event)">
                    <div class="title white h3">Название фильтра 2</div>
                    <div class="open white icon switch-icon"></div>
                  </div>
                  <div class="switch-cont">
                    <form class="search row" action="#">
                      <input type="text" data-value="" placeholder="Поиск...">
                      <input class="search icon" type="submit" value="">
                      <div class="close icon"></div>
                    </form>
                    <div class="items">
                      <div class="item row">
                        <div class="checkbox icon"></div>
                        <div>Вариант 1</div>
                      </div>
                      <div class="item row">
                        <div class="checkbox icon"></div>
                        <div>Вариант 2</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="btns-wrap">
                  <div class="btn act">Показать (<span>0</span>)</div>
                </div>
              </div>
            </div>
          </div>

        </div>


        <!-- Всплывающее окно -->
        <div class="artboard-title">Всплывающее окно</div>
        <div class="arboard-block pop-up-temp">

          <div class="btn" onclick="openPopUp('#pop-up-example')">Открыть pop-up</div>

          <div id="pop-up-example" class="pop-up-container">
            <div class="pop-up">
              <div class="pop-up-title row">
                <div class="title h1">Пример</div>
                <div class="close icon"></div>
              </div>
              <div class="pop-up-body">
                <div>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Rem ex voluptatum, neque repellendus iste ducimus quod eligendi error velit, quam tempore pariatur enim fugit ullam accusantium, quis voluptates! Iure, a!
                Neque delectus repellendus quod similique pariatur nobis officiis tenetur quae eum illum minima animi, consequuntur, quasi voluptates cumque ipsam sed facere dolor, vitae ducimus! Ipsum ad repudiandae eius perspiciatis doloribus.
                Voluptate, itaque, repellat nemo accusamus optio vero quidem, sed qui fugit accusantium maiores architecto odio totam deleniti ullam possimus porro nesciunt fuga! Cupiditate temporibus animi repellat ullam id fuga aut.
                Quis, asperiores accusamus, ratione voluptas odio quae necessitatibus dolor consequatur quasi autem explicabo amet sapiente fugit! Dolore, doloremque! Officiis, veritatis at neque voluptatibus ad sed eos praesentium laboriosam ab fugiat.
                Fugit, temporibus repudiandae. Libero odio deleniti, necessitatibus incidunt dolorem vitae numquam perspiciatis explicabo recusandae, dolores quos facilis? Quam tempore dicta voluptatum ad expedita, iure optio rem placeat labore commodi. Nulla!
                Iste, dolore accusamus. Ad vel non nihil cumque! Cum nulla debitis veritatis voluptas consectetur dolorem ea illum a earum et accusamus doloremque nam suscipit ut deserunt, placeat incidunt non temporibus.
                Veritatis optio, necessitatibus repudiandae veniam ea illo autem repellendus vitae eligendi excepturi deleniti in sint iure tempore amet numquam, nulla facilis dolore velit ex expedita! Doloribus aut eum quia quam?
                Dignissimos saepe unde cum impedit iste quia laboriosam accusamus, repudiandae dolorum voluptatum reiciendis rerum non quaerat voluptate maiores eos ipsum aperiam eveniet. Accusamus omnis eius possimus iusto, sapiente vitae laudantium.
                Nihil, molestias quo at consectetur sapiente hic nobis libero cupiditate voluptates repellendus sit perferendis, rem aperiam, ipsa alias delectus necessitatibus consequatur? Hic in maiores deserunt sit inventore praesentium eaque. Culpa.
                Voluptatum commodi vel accusamus maiores quasi exercitationem minus quidem ut quis deserunt? Adipisci excepturi, sapiente exercitationem vero ducimus blanditiis voluptates ullam natus itaque facere consectetur odit explicabo labore quod illum!
                At nobis facere unde deserunt vitae quidem. Excepturi molestiae, temporibus distinctio a cum vitae inventore! Ipsa inventore odit pariatur recusandae saepe temporibus velit maiores placeat! Obcaecati dolor quasi suscipit aliquam!
                Magni voluptatem atque, minima aut nostrum commodi. Suscipit autem ad, velit perferendis, explicabo esse aut qui, odit odio vitae dicta deserunt id repellendus numquam laboriosam voluptates possimus earum tempora in!
                Voluptatibus, sit sapiente similique nobis molestias voluptas explicabo omnis impedit accusamus autem fugit, alias eligendi delectus exercitationem nulla ea atque. Labore mollitia doloremque error modi reiciendis similique sunt rem totam?
                Iusto aliquam, doloribus nobis nisi, minus corrupti ducimus optio autem vel non reprehenderit molestias illo. Quibusdam aut incidunt laudantium. A odit dolorem iste eius nemo quidem optio beatae consectetur vel?
                Perspiciatis culpa est sunt porro eligendi error, consectetur deserunt ipsum iusto atque nulla facere minus reprehenderit necessitatibus saepe libero velit temporibus numquam aperiam accusamus nobis? Velit ipsa hic deleniti architecto?
                Necessitatibus ducimus odio fugit ratione officiis mollitia molestias culpa animi hic ut qui dolorem, possimus quis illum nostrum nemo repudiandae, eum magni sit sequi itaque omnis? Repudiandae harum necessitatibus unde.
                Quidem odio reprehenderit aperiam repudiandae voluptatum in ut dolorem necessitatibus, quis eum mollitia exercitationem. Laudantium quibusdam nemo dolore aliquam inventore. Quia, odit alias? Dolores dignissimos minima dicta officia nulla facere.
                Voluptates ab deleniti laborum aspernatur fugiat ipsa illum debitis placeat incidunt, doloremque minus possimus aliquid unde sunt nostrum quibusdam sit distinctio minima nulla vero. Quod aperiam repellat eos hic quasi!
                Quas beatae rerum rem aut ex debitis architecto voluptas illo placeat, numquam mollitia odio vel voluptatem laborum ducimus, odit fugit voluptatibus blanditiis nesciunt? Natus ut velit facere quos, est quam.
                Facilis pariatur quaerat distinctio quidem totam saepe ut nam deleniti quae earum itaque voluptatem expedita magnam rerum placeat incidunt consequuntur, veniam nihil, at eius explicabo, non neque. Voluptatem, incidunt. Itaque.
                Minima praesentium ducimus sunt voluptatem in eligendi error dolorum facere consequuntur et distinctio fuga, quasi qui, aut ab ullam obcaecati nesciunt, reiciendis adipisci vero quo non animi eaque. Totam, est.
                Tempore earum voluptatum voluptatem voluptate velit odit debitis aut officiis doloribus ex? Animi officiis eos eveniet dolorum debitis. Velit explicabo repellendus ratione perspiciatis eos ducimus ad quibusdam id consequuntur officiis.
                Pariatur, architecto excepturi culpa explicabo hic doloremque maiores dolor, debitis aperiam veritatis velit, necessitatibus est magnam. Eaque fugiat, officiis sit dolorum aliquid tempore illum quidem nihil ex architecto veniam expedita.
                Cum aliquid aspernatur, cumque tenetur sequi provident totam a reprehenderit aut harum non! Laborum repudiandae voluptatibus vero eaque necessitatibus fugit omnis possimus vitae rerum libero doloremque, impedit qui asperiores rem.
                Laboriosam corrupti obcaecati eius, quos est iste! At nulla error iste sunt saepe unde soluta, cupiditate odio laboriosam voluptatem alias fuga ratione. Culpa dolorem harum qui quasi iure libero quidem?
                Adipisci dolorem odit aut ut ipsum quisquam voluptatem rerum illo, dolor eum voluptas quas, rem deleniti ab nobis explicabo voluptates? Libero dolore fuga id ratione autem recusandae est sit harum?
                Fugiat mollitia consectetur dolores, impedit fuga tempora sint, animi modi maiores, porro nobis? Laboriosam hic sed molestiae recusandae odit itaque provident eveniet nulla minima. Officia, repellat molestiae! Nemo, labore fugit!
                Odit dolorem consequatur autem explicabo asperiores quaerat sed, nobis libero corrupti, illum ex consequuntur dolor a molestias architecto porro? Totam eligendi sapiente architecto voluptatem pariatur, ea assumenda quidem soluta aspernatur?
                Eveniet enim minima soluta rem harum recusandae dolorum corrupti, nisi adipisci sapiente hic molestiae ea est, iure illo fuga quaerat, unde porro libero? Facilis aliquam porro quia modi animi itaque?
                Corrupti at neque, eum earum vel saepe reprehenderit, facere enim, possimus omnis nam numquam officia architecto quae sunt nihil error repellendus. Voluptate maxime tempora similique corporis inventore? Ipsum, itaque ipsa?
                </div>
              </div>
              <div class="loader">
                <div class="loader icon"></div>
                <div class="text">Пожалуйста, подождите</div>
              </div>
            </div>
          </div>

        </div>

        <!-- Форма отправки на сервер -->
        <div class="artboard-title">Форма отправки на сервер</div>
        <div class="arboard-block form-temp">

          <div class="form-container">
            <form id="form1" class="post">
              <div class="form-cols">
                <div class="form-col2">
                  <div class="form-wrap" required>
                    <div class="title">Имя<span class="req">*</span></div>
                    <input type="text" value="" name="name" data-type="name" placeholder="Введите имя">
                  </div>
                  <div class="form-wrap" required>
                    <div class="title">Фамилия<span class="req">*</span></div>
                    <input type="text" value="" name="surname" data-type="name" placeholder="Введите фамилию">
                  </div>
                  <div class="form-wrap" required>
                    <div class="title">Отчество<span class="req">*</span></div>
                    <input type="text" value="" name="patronymic" data-type="name" placeholder="Введите отчество">
                  </div>
                  <div class="form-wrap" required>
                    <div class="title">Должность<span class="req">*</span></div>
                    <input type="text" value="" name="position" placeholder="Введите должность">
                  </div>
                </div>
                <div class="form-col2">
                  <div class="form-wrap" required>
                    <div class="title">Телефон<span class="req">*</span></div>
                    <input type="text" value="" name="phone" data-type="phone" placeholder="+7 ( _ _ _ ) _ _ _  _ _  _ _" maxlength="30" oninput="onlyPhoneChar(event)">
                  </div>
                  <div class="form-wrap">
                    <div class="title">Email</div>
                    <input type="text" value="" name="email" data-type="email" placeholder="Введите email">
                  </div>
                  <div class="form-wrap" required>
                    <div class="title">ИНН<span class="req">*</span></div>
                    <input type="text" value="" name="" data-type="inn" placeholder="Введите ИНН" maxlength="12" oninput="onlyNumb(event)">
                  </div>
                  <div class="form-wrap" required>
                    <div class="title">Тип доступа<span class="req">*</span></div>
                    <div class="form-cols">
                      <div class="form-col2">
                        <div class="option row">
                          <input type="radio" value="Полный" name="access">
                          <div class="radio icon"></div>
                          <div>Полный</div>
                        </div>
                        <div class="option row">
                          <input type="radio" value="Частичный" name="access">
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
                </div>
              </div>
              <div class="form-wrap" required>
                <div class="title">Комментарий к заказу<span class="req">*</span></div>
                <textarea name="comment2" data-type="text" maxlength="300" autocomplete="off" placeholder="Введите текст" oninput="textareaCounter(this)"></textarea>
                <div class="text-counter" data-count="comment2">Знаков осталось: <span>300</span></div>
              </div>
              <div class="form-wrap">
                <div class="title">Категория обращения</div>
                <div class="option row">
                  <input type="radio" value="Производственный брак" name="category">
                  <div class="radio icon"></div>
                  <div>Производственный брак</div>
                </div>
                <div class="option row">
                  <input type="radio" value="Некомплектность" name="category">
                  <div class="radio icon"></div>
                  <div>Некомплектность</div>
                </div>
                <div class="option row">
                  <input type="radio" value="Недосдача" name="category">
                  <div class="radio icon"></div>
                  <div>Недосдача</div>
                </div>
                <div class="option row">
                  <input type="radio" value="Пересорт" name="category">
                  <div class="radio icon"></div>
                  <div>Пересорт</div>
                </div>
                <div class="option row">
                  <input type="radio" value="Несоответствие описанию" name="category">
                  <div class="radio icon"></div>
                  <div>Несоответствие описанию</div>
                </div>
                <div class="option row">
                  <input type="radio" value="Не могу определитью" name="category">
                  <div class="radio icon"></div>
                  <div>Не могу определитью</div>
                </div>
              </div>
              <div class="form-wrap" required>
                <div class="title">Формат торговли<span class="req">*</span></div>
                <div class="option row">
                  <input type="checkbox" value="Розничный магазин" name="format">
                  <div class="checkbox icon"></div>
                  <div>Розничный магазин</div>
                </div>
                <div class="option row">
                  <input type="checkbox" value="Интернет магазин" name="format">
                  <div class="checkbox icon"></div>
                  <div>Интернет магазин</div>
                </div>
                <div class="option row">
                  <input type="checkbox" value="Сервисный центр" name="format">
                  <div class="checkbox icon"></div>
                  <div>Сервисный центр</div>
                </div>
                <div class="option row">
                  <input type="checkbox" value="Другое" name="format">
                  <div class="checkbox icon"></div>
                  <div>Другое</div>
                </div>
              </div>
              <div class="form-wrap" required>
                <div class="title">Система налогообложения<span class="req">*</span></div>
                <div class="activate select">
                  <!-- обязательно добавляем скрытый инпут с name и пустым value -->
                  <input type="hidden" value="" name="taxsystem">
                  <div class="head row">
                    <div class="title">Выберите систему</div>
                    <div class="triangle icon"></div>
                  </div>
                  <div class="drop-down">
                    <div class="item" data-value="Общая">Общая</div>
                    <div class="item" data-value="Урощенная">Урощенная</div>
                    <div class="item" data-value="Прочая">Прочая</div>
                  </div>
                </div>
              </div>
              <div class="form-wrap" required>
                <div class="title">Дата<span class="req">*</span></div>
                <div class="calendar-wrap">
                  <input type="text" value="" name="date" data-type="date" placeholder="ДД.ММ.ГГГГ" maxlength="10" autocomplete="off" oninput="onlyDateChar(event)">
                </div>
              </div>
              <div class="form-wrap" required>
                <div class="title">Период<span class="req">*</span></div>
                <div class="calendar-wrap">
                  <input type="text" value="" name="" data-type="range" placeholder="ДД.ММ.ГГГГ - ДД.ММ.ГГГГ" maxlength="23" autocomplete="off" oninput="onlyDateChar(event)">
                </div>
              </div>
              <div class="form-wrap" required>
                <div class="title">Количество<span class="req">*</span></div>
                <div class="qty qty-box row">
                  <div class="btn minus" data-tooltip="Уменьшить" onclick="changeQty(event, 15)"></div>
                  <input class="choiced-qty" value="0" name="count" type="text" data-value="0" autocomplete="off" onchange="changeQty(event, 15)" onblur="onBlurInput(this)" onfocus="onFocusInput(this)" oninput="onlyNumb(event)">
                  <div class="btn plus" data-tooltip="Добавить" onclick="changeQty(event, 15)"></div>
                </div>
              </div>
              <div class="form-wrap" required>
                <div class="title">Логотип<span class="req">*</span></div>
                <div class="file-wrap">
                  <input id="load-img1" value="" name="file" type="file" accept="image/*">
                  <div class="file-preview"></div>
                  <label class="title" for="load-img1">лого</label>
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

        <!-- Всплывающая форма отправки на сервер -->
        <div class="artboard-title">Всплывающая форма отправки на сервер</div>
        <div class="arboard-block form2-temp">

          <div class="btn" onclick="openPopUp('#form-example')">Открыть форму отправки на сервер</div>

          <div id="form-example" class="pop-up-container">
            <div class="pop-up">
              <div class="pop-up-title row">
                <div class="title h1">Добавление контрагента</div>
                <div class="close icon"></div>
              </div>
              <div class="pop-up-body">
                <form class="post">
                  <div class="title">Добавьте ИНН, данные юридического лица загрузятся автоматически</div>
                  <div class="row">
                    <div class="row">
                      <div class="form-wrap" required>
                        <div class="title">ИНН<span class="req">*</span></div>
                        <input type="text" value="" name="" data-type="inn" placeholder="Введите ИНН" maxlength="12" oninput="onlyNumb(event)">
                      </div>
                      <div id="inn-loader" class="loader icon"></div>
                    </div>
                    <div class="form-wrap">
                      <div class="title">КПП</div>
                      <input type="text" value="" name="" placeholder="" disabled>
                    </div>
                  </div>
                  <div class="form-wrap">
                    <div class="title">Название</div>
                    <input type="text" value="" name="" placeholder="" disabled>
                  </div>
                  <div class="form-wrap" required>
                    <div class="title">Юридический адрес<span class="req">*</span></div>
                    <textarea name="" maxlength="" placeholder="" disabled></textarea>
                  </div>
                  <div class="form-wrap" required>
                    <div class="title">Система налогообложения<span class="req">*</span></div>
                    <div class="activate select" disabled>
                      <!-- обязательно добавляем скрытый инпут с name и пустым value -->
                      <input type="hidden" value="" name="taxsystem">
                      <div class="head row">
                        <div class="title">Выберите систему</div>
                        <div class="triangle icon"></div>
                      </div>
                      <div class="drop-down">
                        <div class="item" data-value="Общая">Общая</div>
                        <div class="item" data-value="Урощенная">Упрощенная</div>
                        <div class="item" data-value="Прочая">Прочая</div>
                      </div>
                    </div>
                  </div>
                  <div class="btns-wrap">
                    <input class="btn sub-act" type="submit" value="Отправить">
                  </div>
                  <!-- если во высплывающем окне есть форма, то лоадер находится в ее конце -->
                  <div class="loader">
                    <div class="loader icon"></div>
                    <div class="text">Пожалуйста, подождите</div>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>

        <!-- Таблица -->
        <div class="artboard-title">Таблицы</div>
        <div class="arboard-block table-temp" style="min-height: 40em;">

          <!-- Чтобы таблица отобразилась на странице корректно нужно:
          1) создать контейнер для таблицы с классом table (и active если она должна отображаться сразу), присвоить id контейнеру
          2) создать разметку для адаптивной части таблицы (если необходимо) с классом table-adaptive внутри контейнера
          3) инициализировать таблицу, вызвав функцию initTable(), куда передать первым параметром id контейнера, а вторым настройки (подробно про настройки в table.js) -->

          <div class="title h1">Таблица, созданная динамически</div>
          <div class="title h2">(её адаптивная версия появляется с 1359px)</div>
          <br>
          <div id="table" class="table active"> <!-- Контейнер таблицы -->
            <div class="table-adaptive template"> <!-- Адаптивная часть таблицы -->
              <div class="infoblock">
                <div class="head">
                  <div class="title">#contr#</div>
                  <div class="toggle dark #accessType#" onclick="toggle(event)">
                    <div class="toggle-in"></div>
                  </div>
                </div>
                <div class="info content">
                  <div class="title">ИНН/КПП: <span class="text">#inn#</span></div>
                  <div class="title">Система налогообложения: <span class="text">#system#</span></div>
                  <div class="title">Дата заведения: <span class="text">#date#</span></div>
                  <div class="title">Юридический адрес: <span class="text">#address#</span></div>
                  <div class="docs row">
                    <div class="mark icon" data-status="#status#" data-tooltip="#status_text#"></div>
                    <a href="url">#title#</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>

    <script src="../js/main.js?<?php echo $ver?>"></script>
    <script src="../js/table.js?<?php echo $ver?>"></script>
    <script src="../js/calendar.js?<?php echo $ver?>"></script>
    <script src="../js/test.js?<?php echo $ver?>"></script>
    <script src="index.js?<?php echo $ver?>"></script>
  </body>
</html>