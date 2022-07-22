const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Attractions = require('./models/attractions');

mongoose.connect('mongodb://127.0.0.1:27017/tourApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
// .then (() => {
//     console.log('OPEN CONNECTION!!!')
// })
// .catch (() => {
//     console.log('Error MONGO connection!!!')
// })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
})

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/makeattractions', async (req, res) => {
    const atrac = new Attractions({title: 'Torres del Paine', description: 'Parque nacional más importante de Chile'});
    await atrac.save();
    res.send(atrac);
})

app.listen(3000, () => {
    console.log('Server on port 3000')
})