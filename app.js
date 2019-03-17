const express   = require('express')
const getPixels = require('get-pixels')
// const bodyParser = require('body-parser')

// port config
const port = process.env.PORT || 3000;

// app config
const app = express();
app.set('port', port);
app.set('view engine', 'ejs');
app.use(express.static('public'));
// app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    getPixels(imagePath, function(err, pixels) {
        if(err) {
            console.log("Bad image path")
            return                        
        }
        // This function 'getPixels' reads the image and traverses through every pixel
        // and collects information like data and shape

        // More details about this module can be found at:
        // https://medium.com/@mackplevine/node-js-get-pixels-getting-pixels-at-specific-sectors-of-an-image-using-ndarray-e6d4cb285d36
        
        width    = pixels.shape[0]
        height   = pixels.shape[1]
        channels = pixels.shape[2]

        var flatArray = []
        for (var y=0; y<height; y++)
            for(var x=0; x<width; x++)
                for(var z=0; z<channels; z++)
                    flatArray.push(pixels.get(x, y, z))

        pixels = []
        for(var i=0; i<flatArray.length; i+=4)
        {
            if( ((flatArray[i]+flatArray[i+1]+flatArray[i+2]/3) >=128) )
                pixels.push(1)  // 1: white
            else
                pixels.push(0)  // 0: black
        }
        res.render('generator', {pixels: pixels, height: height, width: width})
    })
})

app.listen(port, () => {
    console.log(`Server running at port ${port}`)
})