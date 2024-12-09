
const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('dotenv').config();

var partials = require('express-partials');


require('./config/passport')(passport);


const db = require('./config/db');


mongoose.connect(db.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


app.use(expressLayouts);
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());


app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: db.url }),
}));

app.use(passport.initialize());
app.use(passport.session());



app.use((req, res, next) => {
    res.locals.activePage = '';
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.info_msg = req.flash('info_msg'); 
    res.locals.error = req.flash('error');
    res.locals.user= req.user;
    next();
  });
app.set('view engine', 'ejs');






const authRoutes = require('./routes/auth');
const sshRoutes = require('./routes/ssh');

app.use('/', authRoutes);
app.use('/ssh', sshRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
