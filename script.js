const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

// Function to store in local storage
function store(key, value) {
  localStorage.setItem(key, value);
}

// Function to retrieve from local storage
function retrieve(key) {
  return localStorage.getItem(key);
}

// Function to generate a random 3-digit number
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to clear local storage
function clearStorage() {
  localStorage.clear();
}

// Function to generate SHA256 hash of a given string
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Function to get or generate the stored SHA256 hash
async function getSHA256Hash() {
  let cachedHash = retrieve('sha256');
  let cachedPIN = retrieve('pin');

  if (!cachedHash || !cachedPIN) {
    const randomPIN = getRandomNumber(MIN, MAX).toString();
    cachedHash = await sha256(randomPIN);

    store('sha256', cachedHash);
    store('pin', randomPIN);
  }

  return cachedHash;
}

// Function to display the hash
async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

// Function to check user input against the stored hash
async function test() {
  const pin = pinInput.value;

  if (pin.length !== 3) {
    resultView.innerHTML = '💡 Enter a 3-digit number';
    resultView.classList.remove('hidden');
    return;
  }

  const storedHash = retrieve('sha256');
  const hashedInput = await sha256(pin);

  if (hashedInput === storedHash) {
    resultView.innerHTML = '🎉 Success! Correct PIN!';
    resultView.classList.add('success');
  } else {
    resultView.innerHTML = '❌ Incorrect PIN, try again.';
  }
  resultView.classList.remove('hidden');
}

// Ensure pinInput only accepts numbers and is 3 digits long
pinInput.addEventListener('input', (e) => {
  pinInput.value = e.target.value.replace(/\D/g, '').slice(0, 3);
});

// Attach the test function to the button
document.getElementById('check').addEventListener('click', test);

main();
