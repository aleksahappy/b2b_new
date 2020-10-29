'use strict';

// Инициализация объекта формы:

initForm('#registr', sendRegistr);

// Отправка данных формы на сервер:

function sendRegistr(formData) {
  var email;
  formData.forEach((value, key) => {
    if (key === 'email') {
      email = value;
    }
  });
  formData.set('action', 'register');
  formData.set('apikey', 'fc7020775a7cdf161ab5267985c54601');
  sendRequest(urlRequest.main, formData, 'multipart/form-data')
  .then(result => {
    var data = JSON.parse(result);
    console.log(data);
    if (data.ok) {
      clearForm('#registr');
      alerts.show(`Ваша заявка успешно отправлена.<br>
      После рассмотрения и активации заявки, мы отправим пароль авторизации на указанный при регистрации e-mail<br/>
      <a href="mailto:{email}">{email}</a>`);
    } else {
      if (data.error) {
        alerts.show(data.error);
      } else {
        alerts.show('Ошибка в отправляемых данных. Перепроверьте и попробуйте еще раз.');
      }
    }
    hideElement('#registr .loader');
  })
  .catch(err => {
    console.log(err);
    alerts.show('Ошибка сервера. Попробуйте позже.');
    hideElement('#registr .loader');
  })
}
