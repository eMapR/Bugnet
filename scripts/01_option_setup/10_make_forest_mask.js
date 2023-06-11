/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//bugnet module
var bugnet = require('users/clarype/DNR_WA:/support/bugnet.js'); 
var bnet = require('users/clarype/DNR_WA:option2/config_option2_2022.js')
var lt_change = require('users/clarype/DNR_WA:/support/highMagChange.js')
print(bnet)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LCMS forest mask
var lcms_mask = bugnet.lcms_forest_mask(bnet.param.target-5,bnet.param.target).clip(bnet.param.aoi)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//reflectance mask
var tassMap = bugnet.tasselCapMask(bnet)// <<<<<<<<<<<<<< need to find a better way. this works but ecoregions ...
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// High Magnitude -- makes a raster mask from vector layer of clear cuts fire etc 
var highMagChange_img = lt_change.calc(bnet.param.target.toString()).reduceToImage(["yod"],ee.Reducer.mean()).gt(0).unmask().not()
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

