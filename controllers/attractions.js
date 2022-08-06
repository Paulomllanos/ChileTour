const Attractions = require('../models/attractions');
const mapGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mapGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const attractions = await Attractions.find({});
    //esto sirve para redirigir a la misma url el login
    req.session.returnTo = req.originalUrl;
    //-------------------------------------------------
     res.render('attractions/index', { attractions })
};

module.exports.renderNewForm = (req, res) => {
    res.render('attractions/new');
};

module.exports.newAttraction = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.attraction.location,
        limit: 1
    }).send();
    const attraction = new Attractions(req.body.attraction);
    attraction.geometry = geoData.body.features[0].geometry;
    attraction.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    attraction.author = req.user._id;
    await attraction.save();
    console.log(attraction);
    req.flash('success', 'Successfully made a new attraction!');
    res.redirect(`/attractions/${attraction._id}`);
};

module.exports.showAttraction = async (req, res) => {
    const attraction = await Attractions.findById(req.params.id).populate({
        path:'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!attraction){
        req.flash('error', 'Cannot find that attraction!');
        return res.redirect('/attractions');
    }
    //esto sirve para redirigir a la misma url el login
    req.session.returnTo = req.originalUrl;
    //-------------------------------------------------
    res.render('attractions/show', { attraction });
};

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const attraction = await Attractions.findById(id);
    if(!attraction){
        req.flash('error', 'Cannot find that attraction!');
        return res.redirect('/attractions');
    }
    res.render('attractions/edit', { attraction });
};

module.exports.editAttraction = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const attraction = await Attractions.findByIdAndUpdate(id, { ...req.body.attraction });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    attraction.images.push(...imgs);
    await attraction.save();
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await attraction.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}})
        console.log(attraction)
    }
    req.flash('success', 'Successfully updated attraction!');
    res.redirect(`/attractions/${attraction._id}`);
};

module.exports.deleteAttraction = async (req, res) => {
    const { id } = req.params;
    await Attractions.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted attraction!');
    res.redirect('/attractions');
};