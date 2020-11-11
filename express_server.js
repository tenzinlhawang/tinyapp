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


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const templateVars = { username: req.cookies['username'] };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies['username'], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
 // console.log(req.params)
  // console.log(req);
  const templateVars = { username: req.cookies['username'], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//posting new url
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  //console.log('Generate random sting', shortURL);
  let longURL = req.body.longURL;
 // console.log(shortURL);
  //console.log(longURL);
  //console.log(urlDatabase);
  urlDatabase[shortURL] = longURL;
 //console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
  //console.log(req.body);  // Log the POST request body to the console
 // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


//deleting A URL
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`)
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls")
  // console.log(username)
  })

app.post("/logout", (req, res) => {
  res.clearCookie('username'); //res.clearCookie('name'
  // res.cookie('username', req.body.username);
  res.redirect("/urls")
  })


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


