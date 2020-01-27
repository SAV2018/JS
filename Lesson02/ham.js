/*  Некая сеть фастфуда предлагает несколько видов гамбургеров: маленький
    (50 рублей, 20 калорий) и большой (100 рублей, 40 калорий).
    Гамбургер может быть с одной из нескольких видов начинок (обязательно).
    Дополнительно гамбургер можно посыпать приправой (+15 рублей, +0 калорий)
    и полить майонезом (+20 рублей, +5 калорий). 
    Напишите программу, рассчитывающую стоимость и калорийность гамбургера. */

const hams = [
                {price: 50, calories: 20},
                {price: 100, calories: 40},
            ];

const stufs = [
                {id: 0, name: 'с сыром', price: 10, calories: 20, checked: true},
                {id: 1, name: 'с салатом', price: 20, calories: 5, checked: true},
                {id: 2, name: 'с картофелем', price: 15, calories: 10, checked: true},
                {id: 3, name: 'с приправой', price: 15, calories: 0, checked: false},
                {id: 4, name: 'с майонезом', price: 20, calories: 5, checked: false}, 
            ];

class Hamburger {
    constructor(size) {
        this.size = size;
        this.calories = hams[size].calories;
        this.price = hams[size].price;
        this.stuffing = [];
    }

    getName() {
        let name = `${(this.size == 0 ? 'Маленький' : 'Большой')} гамбургер `;
        let stuffing = '';   
        for (let i of this.stuffing) {
            stuffing += (stuffing ==='' ? '' : ', ') + stufs.find(stuf => stuf.id === i).name;
        }
        return `${name} (${stuffing})`;
    }

    addStuffing(id) { // добавить начинку или дополн. ингридиент
        this.stuffing.push(id)
    }

    calculatePrice() { // получить цену
        let sum = hams[size].price;
        
        for (let i of this.stuffing) {
            sum += stufs.find(stuf => stuf.id === i).price;
        }       
        return sum; 
    }
    
    calculateCalories() { // рассчитать калории
        let sum = hams[size].calories;
        
        for (let i of this.stuffing) {
            sum += stufs.find(stuf => stuf.id === i).calories;
        }
        return sum;
    }
    
    renderResult(container) {
        let result = `${this.getName()}\nСтоимость: ${this.calculatePrice()}\nКол-во калорий: ${this.calculateCalories()}`;
        document.getElementById(container).innerHTML = result;
        alert(result);
    }
}

function validStuffing() {
    result = false;
    
    for (let stuf of stufs.filter(stuf => stuf.checked)) {
        result = result || document.getElementById(stuf.id).checked
    }  
    return result;
}

function calculate() {
    if (!validStuffing()) { // проверка на наличие хотя бы одной начинки
        alert('Должна быть выбрана хотя бы одна начинка!');
        return false;
    }
    
    size = 0 + document.getElementById('big').checked; // 0 -small, 1 - big
    const ham = new Hamburger(size);
        
    for (let stuf of stufs) {
        if (document.getElementById(stuf.id).checked) {
            ham.addStuffing(stuf.id);
        }        
    }
    // выводим результат
    ham.renderResult('result');
}