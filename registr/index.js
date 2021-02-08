'use strict';

// Инициализация формы:

initForm('#registr-form', sendRegistr);
initKladr();

// Инициализация подсказок при заполнении города:

function initKladr() {
  document.querySelectorAll('[data-kladr-type]').forEach(el => kladr_init('address', 'registr-form'));
}

// Отправка данных формы на сервер:

function sendRegistr(formData) {
  var email;
  formData.forEach((value, key) => {
    if (key === 'email') {
      email = value;
    }
  });
  formData.append('apikey', 'fc7020775a7cdf161ab5267985c54601');
  sendRequest(urlRequest.main, 'register', formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    if (result.ok) {
      clearForm('#registr-form');
      alerts.show(`Ваша заявка успешно отправлена.<br>
      После рассмотрения и активации заявки, мы отправим пароль авторизации на указанный при регистрации e-mail<br/>
      <a href="mailto:${email}">${email}</a>`);
    } else {
      showFormError('#registr-form', result.error);
    }
    hideElement('#registr-form .loader');
  })
  .catch(error => {
    console.log(error);
    alerts.show('Произошла ошибка, попробуйте позже.');
    hideElement('#registr-form .loader');
  })
}
