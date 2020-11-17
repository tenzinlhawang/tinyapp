const express = require("express"); // importing all required modules
const bodyParser = require("body-parser");
const app = express();
let cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const { urlsForUser, getUserByEmail, generateRandomString } = require("./helpers");

const PORT = 8080; // default port 8080

app.use(cookieSession({
  name: "session",
  keys: ["Done"],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs"); // setting ejs as the view engine

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i3BoGq: { longURL: "https://www.amazon.ca", userID: "aJ48lT" } 
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

//**************************************** URLS NEW PAGE ************************************************************//

app.get("/urls/new", (req, res) => {
  
  if(req.session.user_id) {
    const templateVars = { user: users[req.session.user_id['user_id']]};
  res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//*********************************************  URLS *********************************************************************//
app.get("/urls", (req, res) => {
  
  let userId = req.session.user_id;
  const templateVars = { user: users[userId], urls: urlsForUser(userId, urlDatabase) };
   
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  
  let shortURL = generateRandomString(6);
  let longURL = req.body.longURL;
  const userId = req.session.user_id;
  urlDatabase[shortURL] = { longURL, userID: userId }
  res.redirect(`/urls/${shortURL}`);
});

//**************************************** SHORT URL ************************************************************//

app.get("/urls/:shortURL", (req, res) => {
 
  let shortURL = req.params.shortURL;
  const templateVars = { user: users[req.session.user_id], shortURL, longURL: urlDatabase[shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//**************************************** DELETE URL ************************************************************//

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id && req.session.user_id === urlDatabase[req.params.shortURL].userID) {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
  } else {
    res.redirect("/login");
  }
});

//**************************************** LOGIN USER ************************************************************//

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id]};
  res.render("urls_login", templateVars);

})

app.post("/login", (req, res) => {
  
  let email = req.body.email;
  let password = req.body.password;
  let user = getUserByEmail(req.body.email, users);
  if (req.body.email === '' || req.body.password === '') {
    res.send('Error 400 status code - Cannot leave email or password empty');
  }
  // check for empty email/password (if statement whethere email and password empty strings) res.send("error 400 - Fill out empty fields")
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.send("User doesnt exist")
  } else{
    req.session.user_id = user.id;
    res.redirect("/urls")
  }
  })

//**************************************** LOGOUT USER ************************************************************//


app.post("/logout", (req, res) => {
  
  req.session.user_id = null; 
  res.redirect("/urls")
  })

//**************************************** REGISTER USER ************************************************************//


app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id]};
  res.render("urls_register", templateVars);
})

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.send('Error 400 status code - Cannot leave email or password empty');
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.send("Error 400 - Email already exists in database")
  }
  let newUserID = generateRandomString(6); 
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[newUserID] = { id: newUserID, email: req.body.email, password: hashedPassword };
  req.session.user_id = newUserID;
  res.redirect("/urls");
  
})

//**************************************** PORT LISTEN ************************************************************//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


