'use strict';

// Инициализация объекта формы:

initForm('#registr', sendRegistr);

// Отправка данных формы на сервер:

function sendRegistr(formData) {
  var email;
  formData.forEach((value, key) => {
    if (key === 'rega[email]') {
      email = value;
    }
  });
  formData.set('apikey', 'fc7020775a7cdf161ab5267985c54601');
  sendRequest(urlRequest.main, {action: 'register', data: formData}, 'multipart/form-data')
  .then(response => {
    console.log(response);
    response = JSON.parse(response);
    if (response.ok) {
      alerts.show(`Ваша заявка успешно отправлена.<br>
      После рассмотрения и активации заявки, мы отправим пароль авторизации на указанный при регистрации e-mail<br/>
      <a href="mailto:{email}">{email}</a>`);
      clearForm('#registr');
    } else {
      console.log(response.ok);
    }
    hideElement('#registr .loader');
  })
  .catch(err => {
    console.log(err);
    alerts.show('Ошибка сервера. Попробуйте позже.');
    hideElement('#registr .loader');
  })
}
