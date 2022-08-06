const mongoose = require('mongoose');
//importa archivo citiees
const cities = require('./cities')
//importa archivo seedHelpers {nombre del lugar + otro}
const {places, descriptors} = require('./seedHelpers');
const Attractions = require('../models/attractions');
const citiesChile = require('./citiesChile');
// ./ hace referencia a la carpeta actual -- ../ a la anterior
mongoose.connect('mongodb://127.0.0.1:27017/tourApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];   


const seedDB = async() => {
    await Attractions.deleteMany({});
    for (let i = 0; i < 103; i++) {
        // const random1000 = Math.floor(Math.random() * 100);
        const price = Math.floor(Math.random() * 20) + 1;
        const attrac = new Attractions({
            //Your User ID
            author: '62e9fafd43796afda018414a',
            location: `${citiesChile[i].city}, ${citiesChile[i].region}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam itaque libero ut aspernatur voluptatem repudiandae quod nam aut quis! Sapiente vitae nihil corrupti et totam rerum ipsam quibusdam nulla sed.',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    citiesChile[i].longitude,
                    citiesChile[i].latitude,
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/paulomllanos/image/upload/v1659644456/ChileTour/ho1q0ptb5cjrash1ahud.jpg',
                  filename: 'ChileTour/ho1q0ptb5cjrash1ahud'
                },
                {
                  url: 'https://res.cloudinary.com/paulomllanos/image/upload/v1659644456/ChileTour/o9yblv6dmgosunvnt3eu.jpg',
                  filename: 'ChileTour/o9yblv6dmgosunvnt3eu'
                }
            ]
        })
        await attrac.save();   
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})