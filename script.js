let calculatorOn = false;
let currentInput = ''; 
let firstNumber = null; 
let currentOperation = null; 
let memory = 0; 
let memoryRecallInProgress = false; 
let constant = null; 
let isConstantMode = false; 
let isSecondNumberInput = false; 
let isSubtractionChaining = false; 
let isDivisionByConstantMode = false; 
let isMultiplicationByConstantMode = false;
let isExponentiationMode = false;
let exponentiationStep = 1; 
let lastResult = 0;
let memoryRecallPressCount = 0;
let lastButtonPressed = ''
let lastKButtonPress = false; 
let overflowFlag = false; 
let isOverflowState = false;
let consecutiveClearPressCount = 0;



function togglePower() {
  calculatorOn = !calculatorOn;
  resetState();
  
  const toggleSwitch = document.querySelector('.toggle-switch');
  toggleSwitch.classList.toggle('on', calculatorOn);

  if (calculatorOn) {
    updateDisplay('0'); 
  } else {
    updateDisplay(''); 
    const memorySegment = document.getElementById('memorySegment');
    const constantSegment = document.getElementById('constantSegment');
    
    memorySegment.classList.remove('active');
    constantSegment.classList.remove('active');

    memory = 0;
    constant = null;
    console.log("Калькулятор выключен. Память и константа очищены.");
  }
}


function isDigit(ch) {
  return /\d/.test(ch);
}

function updateDisplay(value) {
  const display = document.querySelector('.calculator-display');
  const minusLeftSegment = document.getElementById('minusLeftSegment');
  const overflowSegment = document.getElementById('overflowSegment');

  if (!value && value !== 0) {
    display.textContent = ''; 
    return;
  }

  if (!value && value !== 0) {
    display.textContent = ''; 
    minusLeftSegment.classList.remove('active');
    overflowSegment.classList.remove('active');
    return;
  }

  let displayValue = value.toString();


 
  let isNegative = false;
  if (displayValue.startsWith('-')) {
    isNegative = true;
    displayValue = displayValue.slice(1);
  }


  if (displayValue.replace('.', '').length > 8) {
    overflowSegment.classList.add('active');
  } else {
    overflowSegment.classList.remove('active');
  }

  if (displayValue === "0.0.0.0.0.0.0.0.") {
    display.textContent = displayValue;
    return;
  }

  if (displayValue.includes('.')) {
    let parts = displayValue.split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1];

    if (integerPart.length > 8) { 
      displayValue = integerPart.slice(0, 8);
    } else {
      decimalPart = decimalPart.slice(0, 8 - integerPart.length);
      displayValue = integerPart + '.' + decimalPart;
    }
  } else {
    displayValue = displayValue.slice(0, 8);
  }


if (isNegative) {
  minusLeftSegment.classList.add('active');
} else {
  minusLeftSegment.classList.remove('active');
}


  let realIntLength = value.toString().split('.')[0].length;

  if (displayValue.indexOf('.') === -1 && value % 1 !== 0 && realIntLength <= 8) {
    displayValue += '.';
  }





  let chars = displayValue.split('');
  let resultHTML = '';

  for (let i = 0; i < chars.length; i++) {
    let c = chars[i];
    let spacing = 6;

    if (i > 0) {
      let prev = chars[i - 1];
    
      if ((isDigit(prev) && c === '.') || (prev === '.' && isDigit(c))) {
        spacing = 0;
      }
    } 

    resultHTML += `<span style="display:inline-block; margin-left:${spacing}px;">${c}</span>`; 
  }


   display.innerHTML = resultHTML;
}



function toggleInstruction() {
  const container = document.querySelector('.instruction-container');
  const toggleButton = document.querySelector('.instruction-toggle');
  
  container.classList.toggle('open');
  toggleButton.classList.toggle('open');
}



function checkOverflow(value, maxLength, operationType = '') {
  const valueStr = value.toString();
  const parts = valueStr.split('.');
  const integerPartLength = parts[0].replace(/^0+/, '').length;
  
    if (integerPartLength > maxLength) {
      console.log(`Переполнение: результат (${value}) имеет более ${maxLength} знаков.`);
    overflowFlag = true;
    isOverflowState = true; 
    updateDisplay("0.0.0.0.0.0.0.0.");
    return true;
  }
  return false;
}



function resetState() {
  currentInput = '';
  firstNumber = null;
  currentOperation = null;
  memoryRecallInProgress = false;
  constant = null; 
  isConstantMode = false; 
  isSecondNumberInput = false; 
  isSubtractionChaining = false; 
  isDivisionByConstantMode = false;
  isMultiplicationByConstantMode = false;
  isExponentiationMode = false;
  exponentiationStep = 1;
  overflowFlag = false; 
  console.log("Сброс состояния калькулятора.");
}

document.querySelectorAll('.button').forEach(button => {
  button.addEventListener('click', () => {
    if (!calculatorOn) return;

    if (isOverflowState && button.textContent.trim() !== 'С') {
      console.log("Переполнение активно. Действие заблокировано.");
      return; 
    }


    const value = button.textContent.trim();
    if (!isNaN(value)) {
      handleNumber(value);
    } else if (value === 'С') {
      handleClearPress();
    } else if (value === '+') {
      handleExponentiationOrAddition();
    } else if (value === '−') {
      setOperation('−');
    } else if (value === '×') {
      setOperation('×');
    } else if (value === '÷') {
      setOperation('÷');
    } else if (value === 'K') {
      handleKButton();
    } else if (value === 'П+') {
      handleMemoryAdd();
    } else if (value === 'ИП') {
      handleMemoryRecall();
    } else if (value === ',') {
      addDecimalPoint();
    } else if (value === '/−/') {
      toggleSign();
    }
    lastButtonPressed = value;
  });
});



function handleClearPress() {
  if (lastButtonPressed === 'С') {
    consecutiveClearPressCount++;  
  } else {
    consecutiveClearPressCount = 1;  
  }

  if (consecutiveClearPressCount === 1) {
    console.log("Первичное нажатие сброса. Сброшен только регистр.");
    currentInput = '';
    updateDisplay('0'); 
  } else if (consecutiveClearPressCount === 2) {
    resetState();
    updateDisplay('0');
    isOverflowState = false;
    console.log("Повторное нажатие сброса. Полный сброс, кроме памяти.");
    
    const constantSegment = document.getElementById('constantSegment');
    constantSegment.classList.remove('active');  
    constant = null;
    isConstantMode = false;
    console.log("Константа очищена.");
  } else if (consecutiveClearPressCount > 2) {
    console.log("Два нажатия подряд, полный сброс калькулятора.");
    resetState();
    updateDisplay('0');
  }

  lastButtonPressed = 'С';  
}




function handleNumber(value) {
  if (currentInput === '0' && value === '0') {
    return; 
  }

  if (currentInput === '0' && value !== '.' && value !== ',') {
    currentInput = value;
  } else {
    if (currentInput.includes('.') && currentInput.split('.')[1].length >= 8) {
      return;
    }

    if (checkOverflow(currentInput + value, 9)) {
      resetState();
      return;
    }

    if (currentOperation && firstNumber !== null && isSecondNumberInput) {
      currentInput = ''; 
      isSecondNumberInput = false; 
    }

    currentInput += value.replace(',', '.'); 
  }

  updateDisplay(currentInput);
  console.log(`Текущее число: ${currentInput}`);
}



function setOperation(operation) {
  console.log(`Вызов setOperation с операцией: ${operation}`);

  if (operation === '÷' && constant !== null) {
    isDivisionByConstantMode = true;
    isConstantMode = false; 
    isMultiplicationByConstantMode = false;
    isExponentiationMode = false;
    console.log("Режим деления на константу активирован.");
    return;
  }

  if (operation === '×' && constant !== null) {
    isMultiplicationByConstantMode = true;
    isConstantMode = false; 
    isDivisionByConstantMode = false;
    isExponentiationMode = false;
    console.log("Режим умножения на константу активирован.");
    return;
  }

  if (isDivisionByConstantMode && constant !== null) {
    if (currentInput) {
      firstNumber = parseFloat(currentInput) / constant;
      console.log(`Рассчитано: текущее число (${currentInput}) / константа (${constant}) = ${firstNumber}`);
      updateDisplay(firstNumber);
      currentInput = ''; 
    }
    if (operation === '+') {
      console.log("Кнопка '+' в режиме деления на константу: вывод результата.");
      return; 
    }
  }

  if (isMultiplicationByConstantMode && constant !== null) {
    if (currentInput) {
      firstNumber = constant * parseFloat(currentInput);
      console.log(`Рассчитано: константа (${constant}) * текущее число (${currentInput}) = ${firstNumber}`);
      updateDisplay(firstNumber);
      currentInput = '';
      return;
    }
  }

  if (isExponentiationMode && constant !== null) {
    firstNumber = firstNumber ?? constant;
    exponentiationStep++;
    const result = Math.pow(firstNumber, exponentiationStep);
    updateDisplay(result);
    console.log(`Результат возведения в степень ${exponentiationStep}: ${result}`);
    return;
  }

  if (isConstantMode && constant !== null) {
    if (currentInput) {
      firstNumber = constant * parseFloat(currentInput);
      console.log(`Вычисление: константа (${constant}) * текущее число (${currentInput}) = ${firstNumber}`);
    } else if (firstNumber === null) {
      firstNumber = constant; 
      console.log(`Первое число установлено как константа: ${constant}`);
    }
    currentInput = ''; 
    updateDisplay(firstNumber);
    currentOperation = operation;
    console.log(`Установлена операция: ${operation}`);
    return;
  }


if (operation === '−' && currentOperation === '+') {
  isSubtractionChaining = true;  
  currentOperation = '−';
  console.log("Активировано цепное вычитание.");
}

if (firstNumber !== null && currentInput) {
  calculate(); 
} else if (firstNumber === null && currentInput) {
  firstNumber = parseFloat(currentInput); 
  console.log(`Первое число установлено: ${firstNumber}`);
}

isSecondNumberInput = true; 
if (!isSubtractionChaining) {
  currentOperation = operation; 
}
console.log(`Подготовка ко вводу второго числа. Текущая операция: ${currentOperation}`);
}




function handleExponentiationOrAddition() {
  if (isExponentiationMode && constant !== null) {
    firstNumber = firstNumber ?? constant;
    exponentiationStep++;
    const result = Math.pow(firstNumber, exponentiationStep);

  if (checkOverflow(result, 17)) {
    console.log("Переполнение при возведении в степень.");
    return;
  }

    updateDisplay(result);
    console.log(`Результат возведения в степень ${exponentiationStep}: ${result}`);
    return;
  }

  if (firstNumber !== null && currentInput) {
    calculate();
  } else {
    setOperation('+');
  }
}



function updateSegments() {
  const memorySegment = document.getElementById('memorySegment');
  const constantSegment = document.getElementById('constantSegment');

  if (memory !== 0) {
    memorySegment.classList.add('active'); 
  } else {
    memorySegment.classList.remove('active'); 
  }

  if (constant !== null) {
  constantSegment.classList.add('active'); 
  } else {
    constantSegment.classList.remove('active'); 
  }
}



function handleKButton() {
  if (lastButtonPressed === 'K') { 
    if (isConstantMode) {

      isConstantMode = false;
      constant = null;
      exponentiationStep = 1;
      console.log("Отказ от работы с константой.");
      
      const constantSegment = document.getElementById('constantSegment');
      constantSegment.classList.remove('active');
    }
  } else {
    if (currentInput) {
      constant = parseFloat(currentInput);
      isConstantMode = true;
      isExponentiationMode = true;
      updateDisplay(constant);
      currentInput = '';
      exponentiationStep = 1;
      console.log(`Константа установлена: ${constant}`);

     const constantSegment = document.getElementById('constantSegment');
      constantSegment.classList.add('active');
    }
  }


  lastButtonPressed = 'K';
  updateSegments();
}



function addDecimalPoint() {
  if (currentOperation && firstNumber !== null && isSecondNumberInput) {
    currentInput = '.'; 
    isSecondNumberInput = false; 
  } else if (!currentInput.includes('.')) {
    if (currentInput === '') {
      currentInput = '.'; 
    } else {
      currentInput += '.'; 
    }
  }
  updateDisplay(currentInput);
  console.log(`Добавлена десятичная точка: ${currentInput}`);
}



function handleMemoryAdd() {
  console.log("Обработка П+.");

  let displayValue = null; 

  if (currentOperation && firstNumber !== null && currentInput) {
    calculate(); 

    if (isOverflowState || firstNumber === Infinity || isNaN(firstNumber)) {
      console.log("Ошибка: попытка сохранить в память недопустимое значение.");
      updateDisplay("0.0.0.0.0.0.0.0.");
      return;
    }

    memory += firstNumber; 
    displayValue = firstNumber; 
    console.log(`Результат ${firstNumber} добавлен в память. Накопленная сумма: ${memory}`);

  } else if (currentInput) {
    let inputValue = parseFloat(currentInput);

    if (isNaN(inputValue) || inputValue === Infinity) {
      console.log("Ошибка: попытка сохранить в память недопустимое значение.");
      updateDisplay("0.0.0.0.0.0.0.0.");
      return;
    }

    memory += inputValue;
    displayValue = inputValue; 
    console.log(`Число ${inputValue} добавлено в память. Накопленная сумма: ${memory}`);


  } else if (firstNumber !== null) {
    if (isNaN(firstNumber) || firstNumber === Infinity) {
      console.log("Ошибка: попытка сохранить в память недопустимое значение.");
      updateDisplay("0.0.0.0.0.0.0.0.");
      return;
    }

    memory += firstNumber;
    displayValue = firstNumber; 
    console.log(`Число ${firstNumber} добавлено в память. Накопленная сумма: ${memory}`);

  } else {
    console.log("Нет числа для добавления в память.");
    return;
  }

  if (checkOverflow(memory, 17)) {
    console.log("Ошибка: Переполнение памяти.");
    updateDisplay("0.0.0.0.0.0.0.0.");
    memory = 0; 
  } else {
    updateDisplay(displayValue);
  }

  currentInput = ''; 
  firstNumber = null;
  currentOperation = null;
  updateSegments();
}

function handleMemoryRecall() {
  if (lastButtonPressed === 'ИП') {
    memory = 0; 
    console.log("Память очищена.");
    const memorySegment = document.getElementById('memorySegment');
    memorySegment.classList.remove('active');
  } else {
    if (memory !== 0) {
      firstNumber = memory;
      updateDisplay(memory);
      currentInput = ''; 
      isSecondNumberInput = false; 
      console.log("Число из памяти передано в firstNumber:", memory);
    } else {
      console.log("Память пуста.");
    }
  }
  lastButtonPressed = 'ИП';
}


function toggleSign() {
  if (currentInput) {
    currentInput = (parseFloat(currentInput) * -1).toString();
    updateDisplay(currentInput);
    console.log(`Изменён знак числа: ${currentInput}`);
  }
}



function calculate() {
  console.log("Вызов calculate.");


  if (currentOperation === '÷' && parseFloat(currentInput) === 0) {
    console.log("Ошибка: деление на ноль.");
    isOverflowState = true;
    updateDisplay('0.0.0.0.0.0.0.0.');  
    return;
}

  if (isDivisionByConstantMode && constant !== null) {
    if (currentInput) {
      firstNumber = parseFloat(currentInput) / constant;
      console.log(`Рассчитано: текущее число (${currentInput}) / константа (${constant}) = ${firstNumber}`);
    }
    updateDisplay(firstNumber);
    currentInput = ''; 
    return;
  }

  if (isMultiplicationByConstantMode && constant !== null) {
    if (currentInput) {
      firstNumber = constant * parseFloat(currentInput);
      console.log(`Рассчитано: константа (${constant}) * текущее число (${currentInput}) = ${firstNumber}`);
    }
    updateDisplay(firstNumber);
    currentInput = '';
    return;
  }

  if (isExponentiationMode && constant !== null && currentOperation !== null) {
    if (currentInput) {
      firstNumber = constant * parseFloat(currentInput);
      console.log(`Рассчитано: константа (${constant}) * текущее число (${currentInput}) = ${firstNumber}`);
    }
    updateDisplay(firstNumber);
    currentInput = ''; 
    return;
  }

  if (firstNumber === null || currentOperation === null || !currentInput) {
    console.log("Пропуск расчёта из-за отсутствия данных.");
    return;
  }

  if (currentOperation === '÷' && parseFloat(currentInput) === 0) {
    console.log("Ошибка: деление на ноль.");
    updateDisplay('0.0.0.0.0.0.0.0.'); 
    isOverflowState = true;
    return;
  }


  let secondNumber = parseFloat(currentInput);
  let result;

  console.log(`Операция: ${currentOperation}, первое число: ${firstNumber}, второе число: ${secondNumber}`);
  
  if (isSubtractionChaining) {
    result = firstNumber - secondNumber; 
    isSubtractionChaining = false; 
  } else {
    switch (currentOperation) {
      case '+':
        result = firstNumber + secondNumber;
        if (checkOverflow(result, 9)) return;
        break;
      case '−':
        result = firstNumber - secondNumber;
        if (checkOverflow(result, 9)) return;
        break;
      case '×':
        result = firstNumber * secondNumber;
        if (checkOverflow(result, 17)) return;
        break;
      case '÷':
        if (secondNumber === 0) {
          updateDisplay('0.0.0.0.0.0.0.0.0.0.');
          isOverflowState = true;
          console.log("Ошибка: деление на ноль.");
          return;
        }
        result = firstNumber / secondNumber;
        if (checkOverflow(result, 9)) return;
        break;
      default:
        console.log("Неизвестная операция.");
        return;
    }
  }

  firstNumber = result;
  currentInput = ''; 
  updateDisplay(result);
  console.log(`Результат: ${result}`);
}