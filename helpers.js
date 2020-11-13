const generateRandomString = function(length) {
  let string = '';
  const char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = length; i > 0; i--) {
    string += char[Math.floor(Math.random() * char.length)];
  }
  return string;
}

const getUserByEmail = function(email, users) {
  //console.log('getUserByEmail');
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
}

const urlsForUser = function(id, urlDatabase) {
  let userURLS = {};
  for (let shortURL in urlDatabase) {
    const shortUrlObj = urlDatabase[shortURL];
    if (id === shortUrlObj.userID) {
      
      userURLS[shortURL] = shortUrlObj;
    }
  }
  return userURLS;
}


module.exports = { generateRandomString, getUserByEmail, urlsForUser }