const express = require("express"); // importing all required modules
const bodyParser = require("body-parser");
const app = express();
const cookieParser = require("cookie-parser")

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
generateRandomString(6)

// function to check if email exists in database

const emailCheck = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
}

const passwordCheck = function(email, password, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].password;
    }
  }
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
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
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
  //console.log(req.body);  // Log the POST request body to the console
 // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:shortURL", (req, res) => {
 // console.log(req.params)
  // console.log(req);
  const templateVars = { user: req.cookies['user_id'], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//deleting A URL
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

app.get("/login", (req, res) => {
  res.render("urls_login");
})

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = emailCheck(req.body.email, users);
  if (user && user.password === password) {
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
  res.render("urls_register");
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
  users[newUserID] = {};
  users[newUserID].id = newUserID;
  users[newUserID].email = req.body.email;
  users[newUserID].password = req.body.password;
  res.cookie('user_id', newUserID);
  res.redirect("/urls");
  
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


