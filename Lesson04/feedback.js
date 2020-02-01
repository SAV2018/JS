/*  Создать форму обратной связи с полями: Имя, Телефон, E-mail, текст,
    кнопка "Отправить". При нажатии на кнопку "Отправить" произвести
    валидацию полей следующим образом:
    a. Имя содержит только буквы.
    b. Телефон имеет вид +7(000)000-0000.
    c. E-mail имеет вид mymail@mail.ru, или my.mail@mail.ru, или my-mail@mail.ru.
    d. Текст произвольный.
    Если одно из полей не прошло валидацию, необходимо выделить это поле
    красной рамкой и сообщить пользователю об ошибке. */

function validate() {
    const isValidName = validName(document.getElementById('name'));
    const isValidPhone = validPhone(document.getElementById('phone'));
    const isValidMail = validMail(document.getElementById('email'));
    const isValidMessage = validMessage(document.getElementById('message'));
    
    const isValidForm = (isValidName) && (isValidPhone) && (isValidMail) && (isValidMessage);
    if (!isValidForm) {
        document.getElementById('error').innerHTML = 'Введены недопустимые данные!'
    }
    return isValidForm;
}


function validName(input) {
    const pattern = /[A-Za-z А-Яа-яЁё]/;

    return checkValue(input, pattern);    
}

function validPhone(input) {
    const pattern = /^\+7\([0-9]{3}\)[0-9]{3}-[0-9]{4}$/; // +7(000)000-0000.
    
    return checkValue(input, pattern); 
}

function validMail(input) {
    const pattern = /^[A-Za-z0-9]([-A-Za-z0-9]|\.(?!\.)){0,62}[A-Za-z0-9]@[A-Za-z0-9]([-A-Za-z0-9]|\.(?!\.)){0,251}[A-Za-z0-9]$/;

    return checkValue(input, pattern); 
}

function validMessage(input) {
    const pattern = /.+/; // не пустое сообщение
    
    return checkValue(input, pattern);
}

function checkValue(input, pattern) {
    const isValid = pattern.test(input.value.trim());
    
    if (isValid) {
        input.style.borderColor = '#aaa';
    } else {
        input.style.borderColor = 'red';
    }
    
    return isValid;
}