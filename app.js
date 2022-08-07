if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

// routes 
const userRoutes = require('./routes/users');
const attractionRoutes = require('./routes/attraction');
const reviewRoutes = require('./routes/reviews');
//connect-mongo
const MongoStore = require('connect-mongo');

// const dbUrl = process.env.DB_URL;
//conexion de mongoose con mongodb
const dbUrl = 'mongodb://127.0.0.1:27017/tourApp'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//conexion de mongoose con mongodb
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
//Para utilizar DELETE Y PUT en express como method
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thishouldbeabettersecret!'
    }
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR!", e)
});

const sessionConfig = {
    store,
    name: 'session',
    secret: 'thishouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, implementarlo despues del deploying
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/paulomllanos/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/paulomllanos/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/paulomllanos/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/paulomllanos/" ];

app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc :[],
            connectSrc :[ "'self'", ...connectSrcUrls ],
            scriptSrc:[ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc: [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc: [ "'self'", "blob:" ],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/paulomllanos/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc: [ "'self'", ...fontSrcUrls ],
            mediaSrc: [ "https://res.cloudinary.com/paulomllanos/" ],
            childSrc: [ "blob:" ]
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({email: 'pmll@gmial.com', username: 'pol'});
    const newUser = await User.register(user, 'pollo');
    res.send(newUser);
})

app.use('/', userRoutes);
app.use('/attractions', attractionRoutes);
app.use('/attractions/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home')
});

// Le da a todos el script de Express Error
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh no, Something Went Wrong!'
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Server on port 3000');
});