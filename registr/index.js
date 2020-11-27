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
  formData.append('apikey', 'fc7020775a7cdf161ab5267985c54601');
  sendRequest(urlRequest.main, 'register', formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    // console.log(result);
    if (result.ok) {
      clearForm('#registr');
      alerts.show(`Ваша заявка успешно отправлена.<br>
      После рассмотрения и активации заявки, мы отправим пароль авторизации на указанный при регистрации e-mail<br/>
      <a href="mailto:${email}">${email}</a>`);
    } else {
      if (result.error) {
        alerts.show(result.error);
      } else {
        alerts.show('Ошибка в отправляемых данных. Перепроверьте и попробуйте еще раз.');
      }
    }
    hideElement('#registr .loader');
  })
  .catch(error => {
    console.log(error);
    alerts.show('Произошла ошибка, попробуйте позже.');
    hideElement('#registr .loader');
  })
}
