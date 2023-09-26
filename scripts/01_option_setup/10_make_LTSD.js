//////////////////////////////////////////////MOD ASSETS///////////////////////////////////////////////////////////////
//LandTrendr module
var ltgee = require('users/emaprlab/public:Modules/LandTrendr.js'); 
//bugnet module
var bugnet = require('users/emaprlab/public:Modules/bugnet.js'); 
//Configuation file
var bnet = require('users/emaprlab/bugnetBlueMts2023:config2.js')
///////////////////////////////////////////////LANDTRENDR//////////////////////////////////////////////////////////////
// this statement runs the LandTrendr algorthim on the give parameters set
var lt = ltgee.runLT(bnet.param.ltstartYear,bnet.param.ltendYear,bnet.param.startDay,bnet.param.endDay,bnet.param.aoi,bnet.param.index,bnet.param.fit,bnet.param.runParams,bnet.param.maskThese);
///////////////////////////////////////////////LANDTRENDR SEG//////////////////////////////////////////////////////
// gets LandTrendr Segment info
var last_seg = bugnet.get_lt_last_seg_info(lt,'nbr');
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//lcms forest mask 
var forestMask = bugnet.lcms_forest_mask(2010)
///////////////////////////////////////////////LT STANDARDIZED IMAGE////////////////////////////////////////////////////////
// generates Landtrendr standardized imagery and add the LandTrendr segment info as an additional band then masks non forest regions
var ltsd = bugnet.standardized_lt_image(lt,bnet.param.ltstartYear,bnet.param.ltendYear,bnet.param.index,bnet.param.ltendYear)
  .addBands(last_seg)
  .mask(forestMask)
//////////////////////////////////////////////////EXPORT IMAGE/////////////////////////////////////////////////////////////
// Exports imagery
Export.image.toAsset({image:ltsd.toInt16(), description:bnet.param.LTSDname, assetId:bnet.param.LTSDname,region:bnet.param.aoi, scale:30, maxPixels:1000000000})
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

