// Инициализация объектов кладр:

function initFias(containerId) {
  var $container = $(document.getElementById(containerId)),
    $fields = $container.find('[data-kladr-type]'),
    $zip = $container.find('[data-kladr-type="zip"]');

  $.each($fields, (i, el) => {
    var type = el.dataset.kladrType,
        $field = $container.find(`[data-kladr-type="${type}"]`)
    $field.fias({
        type: type === 'zip' ? type : $.fias.type[type],
        verify: type !== 'zip' && type !== 'building' ? true : false,
        withParents: type === 'district' || type === 'city' ? true : false,
        select: function (obj) {
          // Обновляем поле с индексом
          if ($zip && obj.zip) {
            $zip.val(obj.zip);
          }
          setFiasParent($container, obj);
          checkForm($(this));
        },
        check: function (obj) {
          if (obj) {
            setFiasParent($container, obj);
          }
          checkForm($(this));
        },
        checkBefore: function () {
          var $input = $(this);
          if (!$.trim($input.val())) {
              return false;
          }
        }
    });
    // Подключаем плагин для почтового индекса
    if (type === 'zip') {
      $field.fiasZip($container);
    }
  });

  // Проверяем форму на возможность отправки:
  function checkForm(input) {
    if (input.val() == 'Совпадений не найдено') {
      input.val('');
    }
    input[0].dispatchEvent(new CustomEvent('input', {'bubbles': true}));
  }
}

// Запись данных о родителе в объект кладр:

function setFiasParent(container, obj) {
  var $fields = $.fias.getInputs(container),
      args = {'parentType': obj.contentType, 'parentId': obj.id},
      index;

  for (var i in $fields) {
    var type = $fields[i].dataset.kladrType;
    if (type === obj.contentType) {
      index = +i + 1;
      while ($fields[index]) {
        type = $fields[index].dataset.kladrType;
        if (type && type !== 'zip') {
          container.find(`[data-kladr-type="${type}"]`).fias(args);
        }
        index += 1;
      }
      break;
    }
  }
}

// Установка взаимосвязи заполненных полей кладр:

function setFiasConnect(containerId) {
  var $container = $(document.getElementById(containerId)),
      $fields = $.fias.getInputs($container),
      count = 0,
      prevType = null,
      prevId = null;

  fillField(count);
  function fillField(index) {
    var el = $fields[index];
    if (!el) {
      return;
    }
    var type = el.dataset.kladrType;
    if (type !== 'zip') {
      $.fias.check({
        oneString: false,
        type: type,
        name: el.value,
        parentType: prevType,
        parentId: prevId,
        limit: 1
        }, (obj) => {
          if (obj) {
            el.dataset.kladrId = obj.id;
            setFiasParent($container, obj);
            prevType = obj.contentType,
            prevId = obj.id;
            count += 1;
            fillField(count);
          }
        }
      );
    }
  }
}
