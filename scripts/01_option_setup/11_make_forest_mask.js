var mtbs = ee.FeatureCollection("USFS/GTAC/MTBS/burned_area_boundaries/v1")
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//bugnet module
var bugnet = require('users/emaprlab/public:Modules/bugnet.js'); 
//Configuation file
var bnet = require('users/emaprlab/bugnetBlueMts2023:config2.js')

print(bnet)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LCMS forest mask
var lcms_mask = bugnet.lcms_forest_mask(bnet.param.target-5,bnet.param.target).clip(bnet.param.aoi)

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//reflectance mask
var tassMap = bugnet.tasselCapMask(bnet)// <<<<<<<<<<<<<< need to find a better way. this works but ecoregions ...
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// High Magnitude -- makes a raster mask from vector layer of clear cuts fire etc 
var highMagChange_img = bugnet.ltcalc(bnet.param.target.toString(),bnet.param.ltchange).reduceToImage(["yod"],ee.Reducer.mean()).gt(0).unmask().not()
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fire mask - filter MTBS dataset by date 
var fires = mtbs.filter(ee.Filter.and(ee.Filter.gte("Ig_Date", bnet.param.maskStartTime), ee.Filter.lte("Ig_Date", bnet.param.maskEndTime) ))
// change MTBS dataset to raster binary
var fire_img = fires.reduceToImage(["Map_ID"],ee.Reducer.mean()).gt(0).unmask().not()
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// takes the product of all the  mask
var mask = lcms_mask.multiply(highMagChange_img).multiply(tassMap).multiply(fire_img).clip(bnet.param.aoi)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// export image mask
Export.image.toAsset({image:mask.byte(), description:bnet.param.forestMaskName, assetId:bnet.param.forestMaskName, region:bnet.param.aoi, scale:30, maxPixels:1e13})

Map.addLayer(mask)