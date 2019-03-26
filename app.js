const jimp       = require('jimp')
const express    = require('express')
const mongoose   = require('mongoose')
const getPixels  = require('get-pixels')
const formidable = require('formidable')

// const bodyParser = require('body-parser')

// port config
const port = process.env.PORT || 3000;

// app config
const app = express();
app.set('port', port);
app.set('view engine', 'ejs');
app.use(express.static('public'));

var imageSchema = mongoose.Schema({
    key: String,
    encrypt: [],
    decrypt: []
})

var Image = mongoose.model('Image', imageSchema);

app.get('/', (req, res) => {
    res.render('upload')
})

app.post('/upload', function(req, res) {
    
    var form = new formidable.IncomingForm();
    form.parse(req);

    form.on('fileBegin', function(name, file) {
        file.path = './uploads/' + file.name;
    });

    form.on('field', function(name, value) {
        console.log('got a field name: ', value)

        form.on('file', async function(name, file) {
            console.log('Uploaded ' + file.name);

            // Accessing file
            const imagePath = './uploads/' + file.name;

            jimp.read(imagePath, (err, image) => {
            if (err) throw err;
            fit = (image.getHeight() < image.getWidth() ? image.getHeight() : image.getWidth())
            console.log(fit)
            image
                .crop(0, 0, fit, fit)
                .resize(32, 32) // resize
                .quality(60) // set JPEG quality
                .greyscale() // set greyscale
                .write('target.png'); // save
            res.redirect('/extract_pixels')
            });
        });
    });
});

app.get('/extract_pixels', (req, res) => {
    getPixels('target.png', function (err, pixels) {
        if (err) {
            console.log("Bad image path")
            return
        }
        // This function 'getPixels' reads the image and traverses through every pixel
        // and collects information like data and shape

        // More details about this module can be found at:
        // https://medium.com/@mackplevine/node-js-get-pixels-getting-pixels-at-specific-sectors-of-an-image-using-ndarray-e6d4cb285d36

        width = pixels.shape[0]
        height = pixels.shape[1]
        channels = pixels.shape[2]

        var flatArray = []
        for (var y = 0; y < height; y++)
            for (var x = 0; x < width; x++)
                for (var z = 0; z < channels; z++)
                    flatArray.push(pixels.get(x, y, z))

        pixels = []
        for (var i = 0; i < flatArray.length; i += 4) {
            if (((flatArray[i] + flatArray[i + 1] + flatArray[i + 2] / 3) >= 128))
                pixels.push(1)  // 1: white
            else
                pixels.push(0)  // 0: black
        }

        res.render('generator', { pixels: pixels, height: height, width: width })
    })
})

app.listen(port, () => {
    console.log(`Server running at port ${port}`)
})