//Convert Bugnet Rasters into polygons. 
//bugent config file 
var bnet = require('users/emaprlab/bugnetBlueMts2023:config2.js')

//bunget image
var image = ee.Image(bnet.param.assetDir+bnet.param.predicted);

// image processing - reproject the image >> reduce pixel to polygons 
var bnet_vects = image.reproject({crs:'EPSG:3857',scale:30}).reduceToVectors({reducer:ee.Reducer.countEvery(), scale:30, geometryType:"Polygon", eightConnected:true, labelProperty:"classification",maxPixels:1e13})
Map.addLayer(bnet_vects)

// export polygons as table
Export.table.toAsset({collection:bnet_vects, description:bnet.param.bugnet_polygons, assetId:bnet.param.assetDir+bnet.param.bugnet_polygons})
