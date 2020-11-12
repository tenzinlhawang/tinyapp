const express = require("express"); // importing all required modules
const bodyParser = require("body-parser");
const app = express();
const cookieParser = require("cookie-parser")
const bcrypt = require('bcrypt');

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // setting ejs as the view engine

const generateRandomString = function(length) {
  let string = '';
  const char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = length; i > 0; i--) {
    string += char[Math.floor(Math.random() * char.length)];
  }
  return string;
}


// function to check if email exists in database

const emailCheck = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
}

const urlsForuser = function(id) {
  let userURLS = {};
  for (let shortURL in urlDatabase) {
    const shortUrlObj = urlDatabase[shortURL];
    console.log(`${id} === ${shortUrlObj.userID}`);
    if (id === shortUrlObj.userID) {
      
      userURLS[shortURL] = shortUrlObj;
    }
  }
  return userURLS;
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i3BoGq: { longURL: "https://www.amazon.ca", userID: "aJ48lT" } 
};


const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// Routing functions :-

//homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//creating new url page
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']]};
  //console.log(users[req.cookies['user_id']]);
  //console.log(users);
  if(req.cookies.user_id) {
  res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  let userId = req.cookies['user_id'];
  // console.log('This is uderId ', userId);
  const templateVars = { user: users[req.cookies['user_id']], urls: urlsForuser(userId) };
  // console.log('URLs ',  templateVars.urls);
  // console.log('This is the user' , templateVars.user);
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  let longURL = req.body.longURL;
  const userId = req.cookies['user_id'];
  urlDatabase[shortURL] = { longURL, userID: userId }
  // console.log('This is Url database ', urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
 // console.log(req.params)
  // console.log(req);
  let shortURL = req.params.shortURL;
  const templateVars = { user: users[req.cookies['user_id']], shortURL, longURL: urlDatabase[shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//deleting A URL
app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.cookies['user_id'] && req.cookies['user_id'] === urlDatabase[req.params.shortURL].userID) {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']]};
  res.render("urls_login", templateVars);

})

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = emailCheck(req.body.email, users);
  if (user && bcrypt.compareSync(req.body.password, password)) {
    res.cookie('user_id', user.id)
  }
  res.redirect("/urls")
  // console.log(username)
  })

app.post("/logout", (req, res) => {
  res.clearCookie('user_id'); //res.clearCookie('name'
  // res.cookie('username', req.body.username);
  res.redirect("/urls")
  })


app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']]};
  res.render("urls_register", templateVars);
})

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.send('Error 400 status code - Cannot leave email or password empty');
  }
  if (emailCheck(req.body.email, users)) {
    res.send("Error 400 - Email already exists in database")
  }
  let newUserID = generateRandomString(6); 
  //console.log(newUserID);
  //console.log(users)
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[newUserID] = { id: newUserID, email: req.body.email, password: hashedPassword };
  res.cookie('user_id', newUserID);
  res.redirect("/urls");
  
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


