import bcrypt from 'bcrypt';

const storedHash = '$2b$10$YDa4nbYU6YlmIkZWEmVCMeYpjltgExvN2ZAJnF6oPJgSE1HzKTahy';
const passwordToTry = 'password'; // Try the password you used

bcrypt.compare(passwordToTry, storedHash).then((match) => {
  console.log(match ? '✅ Password matches!' : '❌ Password does NOT match');
});
