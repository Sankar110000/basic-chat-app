const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require('passport')
const LocalStrategy = require('passport-local')

const MONGO_URL = "mongodb://127.0.0.1:27017/whatsapp";

const Chat = require("./models/schema.js");
const User = require("./models/users.js");
const app = express();
const port = 8080;
const path = require("path");
const sessionOptions = {
  secret: "secertcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 60,
    maxAge: Date.now() + 7 * 24 * 60 * 60 * 60,
    httpOnly: true
  }
};

async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then((res) => console.log("connection successful"))
  .catch((err) => console.log(err));

app.set("view engine", "ejs");
app.set(path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res ,next) => {
  res.locals.wlcMsg = req.flash("success");
  res.locals.errMsg = req.flash("error");
  next()
})

app.get('/demouser', async(req, res) => {
  const newUser = new User({
    username: "sankar",
    email: "demo123@gmail.com"
  })

  await User.register(newUser, 'sankar')
  res.redirect('/chats')
})

// Index route
app.get("/chats", async (req, res) => {
  let { name = "anonymous" } = req.query;
  req.session.name = name;
  if (name == "anonymous") {
    req.flash("error", "user not register");
  } else {
    req.flash("success", "welcome");
  }
  const chats = await Chat.find();
  res.render("listings/index.ejs", { chats });
});

app.get("/chats/new", (req, res) => {
  res.render("listings/new.ejs");
});

// New route
app.post("/chats", async (req, res) => {
  let { from, to, msg } = req.body;
  const newChat = new Chat({
    from: from,
    to: to,
    message: msg,
    created_at: Date.now(),
  });
  await newChat.save();
  res.redirect("/chats");
});

// Delete route
app.delete("/chats/:id", async (req, res) => {
  const { id } = req.params;
  const deletedChat = await Chat.findOneAndDelete(id);
  res.redirect("/chats");
});

app.get("/chats/:id", async (req, res) => {
  let { id } = req.params;
  const chat = await Chat.findById(id);
  res.render("listings/edit.ejs", { chat });
});

// Update route
app.put("/chats/:id", async (req, res) => {
  let { id } = req.params;
  let { from, to, msg } = req.body;
  const chat = {
    from: from,
    to: to,
    message: msg,
  };
  const updatedChat = await Chat.findByIdAndUpdate(id, chat);
  res.redirect("/chats");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
