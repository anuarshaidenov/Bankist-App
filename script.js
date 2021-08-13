'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const account5 = {
  owner: 'Anuar Shaidenov',
  movements: [430, 1000, 700, 50, 90, 1000000],
  interestRate: 2,
  pin: 7045,
};

const accounts = [account1, account2, account3, account4, account5];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const labelError = document.querySelector('.error');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const containerTransfers = document.querySelector('.operation--transfer');
const containerClose = document.querySelector('.operation--close');
const containerLoan = document.querySelector('.operation--loan');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const displayMovements = function (movements) {
  containerMovements.innerHTML = '';
  movements.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__value">${mov}€</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${account.balance}€`;
};

const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out =
    account.movements
      .filter(mov => mov < 0)
      .reduce((acc, mov) => acc + mov, 0) * -1;
  labelSumOut.textContent = `${out}€`;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

const updateUI = function (account) {
  // Display movements
  displayMovements(account.movements);

  // Display balance
  calcDisplayBalance(account);

  // Display summary
  calcDisplaySummary(account);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

// Event handlers
let currentAccount;
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Clear error message
    labelError.style.opacity = 0;

    // Display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    updateUI(currentAccount);
  } else {
    labelError.style.opacity = 1;
  }
});

// TRANSFER
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const displayMessage = function (message) {
    containerTransfers.style.background =
      message === 'success' ? '#66c873' : '#f5465d';
    setTimeout(() => {
      containerTransfers.style.background =
        'linear-gradient(to top left, #ffb003, #ffcb03)';
    }, 400);
  };

  const amount = Number(inputTransferAmount.value);
  const recieverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    recieverAccount &&
    amount > 0 &&
    amount <= currentAccount.balance &&
    recieverAccount.username !== currentAccount.username
  ) {
    // Add negative movement to current user
    currentAccount.movements.push(-amount);
    // Add positive movement to recipient
    recieverAccount.movements.push(amount);

    // Update UI:
    updateUI(currentAccount);

    displayMessage('success');
  } else {
    displayMessage('error');
  }
  // Clear the input fields
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferTo.blur();
});

// LOAN
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const displayMessage = function (message) {
    containerLoan.style.background =
      message === 'success' ? 'green' : '#f5465d';
    setTimeout(() => {
      containerLoan.style.background =
        'linear-gradient(to top left, #39b385, #9be15d)';
    }, 400);
  };

  const amount = Number(inputLoanAmount.value);
  const deposits = currentAccount.movements.filter(mov => mov > 0);
  if (amount && amount > 0 && deposits.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);

    displayMessage('success');
  } else {
    displayMessage('error');
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

// CLOSE ACCOUNT
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  const displayMessage = function (message) {
    containerClose.style.background = message === 'success' ? '#66c873' : 'red';
    setTimeout(() => {
      containerClose.style.background =
        'linear-gradient(to top left, #e52a5a, #ff585f)';
    }, 400);
  };

  const usernameConfirm = inputCloseUsername.value;
  const pinConfirm = Number(inputClosePin.value);

  // Check if credentials are correct
  if (
    usernameConfirm &&
    pinConfirm &&
    usernameConfirm === currentAccount.username &&
    pinConfirm === currentAccount.pin
  ) {
    // Delete user
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);

    // Log user out (Hide UI)
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  } else {
    displayMessage('error');
  }
  inputCloseUsername.value = inputClosePin.value = '';
  inputClosePin.blur();
});

///////////////////////////////////////
// Coding Challenge #1

/* 
Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, and stored the data into an array (one array for each). For now, they are just interested in knowing whether a dog is an adult or a puppy. A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.

Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:

1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs! So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters)
2. Create an array with both Julia's (corrected) and Kate's data
3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy 🐶")
4. Run the function for both test datasets

HINT: Use tools from all lectures in this section so far 😉

TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

GOOD LUCK 😀
*/
/*
const checkDogs = function (dogsJulia, dogsKate) {
  const dogsOnlyJulia = dogsJulia.slice(1, -2);
  const allDogs = dogsOnlyJulia.concat(dogsKate);
  allDogs.forEach(function (age, i) {
    console.log(
      age >= 3
        ? `Dog number ${i + 1} is an adult, and is ${age} years old`
        : `Dog number ${i + 1} is still a puppy 🐶`
    );
  });
};
checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);
*/

///////////////////////////////////////
// Coding Challenge #2

/* 
Let's go back to Julia and Kate's study about dogs. This time, they want to convert dog ages to human ages and calculate the average age of the dogs in their study.

Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:

1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)
3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages 😉)
4. Run the function for both test datasets

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀
*/
/*
const calcAverageHumanAge = function (ages) {
  // 1.
  const humanAge = ages.map(age => (age <= 2 ? 2 * age : 16 + age * 4));
  console.log(`Human ages: ${humanAge.join(', ')}`);
  // 2.
  const adults = humanAge.filter(age => age >= 18);
  console.log(`Adult dogs: ${adults.join(', ')}`);
  // 3.
  const average = adults.reduce((acc, age) => acc + age, 0) / adults.length;
  const average2 = adults.reduce(
    (acc, age, i, arr) => acc + age / arr.length,
    0
  );
  console.log(`Average human age of dogs: ${average2}`);

  console.log('-------------');
};

calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);
*/

///////////////////////////////////////
// Coding Challenge #3

/* 
Rewrite the 'calcAverageHumanAge' function from the previous challenge, but this time as an arrow function, and using chaining!

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀
*/
/*
const calcAverageHumanAge = ages =>
  ages
    .map(age => (age <= 2 ? 2 * age : 16 + age * 4))
    .filter(age => age >= 18)
    .reduce((acc, age, i, arr) => acc + age / arr.length, 0);

console.log(calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]));
console.log(calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]));
*/

/////////////////////////////////////////////////
/*
let arr = ['a', 'b', 'c', 'd', 'e'];

// SLICE
console.log(arr.slice(2));
console.log(arr.slice(2, 4));
console.log(arr.slice(-2));
console.log(arr.slice(1, -2));

// SPLICE
// console.log(arr.splice(2));
arr.splice(-1);
console.log(arr);

// REVERSE
arr = ['a', 'b', 'c', 'd', 'e'];
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse());
console.log(arr2);

// CONCAT
const letters = arr.concat(arr2);
console.log(letters);
console.log([...arr, ...arr2]);

// JOIN
console.log(letters.join(' - '));
*/

/*
// for (const movement of movements) {
for (const [i, movement] of movements.entries()) {
  console.log(
    movement < 0
      ? `Movemenet ${i}: You withdrew ${movement * -1}`
      : `Movemenet ${i}: You deposited ${movement}`
  );
}

// FOREACH
// Note: break and continue dont work in forEach loop
console.log('----- FOREACH -----');
movements.forEach(function (mov, i, arr) {
  console.log(
    mov < 0
      ? `Movemenet ${i}: You withdrew ${mov * -1}`
      : `Movemenet ${i}: You deposited ${mov}`
  );
});
*/
/*
// MAP
currencies.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`);
});

// SET
const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
console.log(currenciesUnique);
currenciesUnique.forEach(function (value, _, map) {
  console.log(`${_}: ${value}`);
});
*/
/*
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const eurToUsd = 1.1;

const movementsUSD = movements.map(function (mov) {
  return mov * eurToUsd;
});

console.log(movements);
console.log(movementsUSD);

const movementsUSDArrow = movements.map(mov => mov * eurToUsd);
console.log(movementsUSDArrow);

const movementsUSDFor = [];
for (const mov of movements) movementsUSDFor.push(mov * eurToUsd);
console.log(movementsUSDFor);

const movementsDescriptions = movements.map(
  (mov, i) =>
    `Movemenet ${i}: You ${mov > 0 ? `deposited` : 'withdrew'} ${mov * -1}`
);
console.log(movementsDescriptions);
*/

/*
// FILTER
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const deposits = movements.filter(mov => mov > 0);

console.log(deposits);

const depositsFor = [];
for (const mov of movements) {
  mov > 0 ? depositsFor.push(mov) : '';
}
console.log(depositsFor);

const withdrawals = movements.filter(mov => mov < 0);
console.log(withdrawals);
*/
/*
// REDUCER
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// Accumulator -> SNOWBALL
const balance = movements.reduce((acc, cur) => acc + cur, 0);
console.log(balance);

let acc = 0;
for (const [i, cur] of movements.entries()) {
  // console.log(`Iteration ${i}: ${acc}`);
  acc += cur;
}
console.log(acc);

// Maximum value
const max = movements.reduce(
  (acc, mov) => (mov > acc ? mov : acc),
  movements[0]
);
console.log(max);
*/
/*
const eurToUsd = 1.1;

// PIPELINE
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const totalDepositsUSD = movements
  .filter(mov => mov > 0)
  .map(mov => mov * eurToUsd)
  .reduce((acc, mov) => acc + mov, 0);

console.log(totalDepositsUSD);
*/
/*
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const firstWithdrawal = movements.find(mov => mov < 0);
console.log(movements);
console.log(firstWithdrawal);

console.log(accounts);
const account = accounts.find(acc => acc.owner === 'Jessica Davis');
console.log(account);

let accountFor;
for (const acc of accounts) {
  if (acc.owner === 'Jessica Davis') accountFor = acc;
}
console.log(accountFor);
*/
/*
// Some and Every
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// EQUALITY
console.log(movements.includes(-130));

// CONDITION
const anyDesposits = movements.some(mov => mov > 1500);
console.log(anyDesposits);
*/
