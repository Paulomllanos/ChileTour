const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Attractions = require('./models/attractions');

mongoose.connect('mongodb://127.0.0.1:27017/tourApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home')
});

app.get('/attractions', async (req, res) => {
    const attractions = await Attractions.find({});
     res.render('attractions/index', { attractions })
});

//Crear nuevas atracciones
app.get('/attractions/new', (req, res) => {
    res.render('attractions/new');
});

app.post('/attractions', async (req, res) => {
    const attraction = new Attractions(req.body.attraction);
    await attraction.save();
    res.redirect(`/attractions/${attraction._id}`);
});

//Mostrar informacion de atraccion seleccionada
app.get('/attractions/:id', async (req, res) => {
    const attraction = await Attractions.findById(req.params.id);
    res.render('attractions/show', { attraction });
});

app.get('/attractions/:id/edit', async (req, res) => {
    const attraction = await Attractions.findById(req.params.id);
    res.render('attractions/edit', { attraction });
})

app.put('/attractions/:id', async (req, res) => {
    const { id } = req.params;
    const attraction = await Attractions.findByIdAndUpdate(id, { ...req.body.attraction });
    res.redirect(`/attractions/${attraction._id}`);
})

app.delete('/attractions/:id', async (req, res) => {
    const { id } = req.params;
    await Attractions.findByIdAndRemove(id);
    res.redirect('/attractions');
} )

app.listen(3000, () => {
    console.log('Server on port 3000')
});