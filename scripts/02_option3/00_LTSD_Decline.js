//////////////////////////////////////////////MOD ASSETS///////////////////////////////////////////////////////////////
//LandTrendr module
var ltgee = require('users/emaprlab/public:Modules/LandTrendr.js'); 

//bugnet module
var bugnet = require('users/emaprlab/public:Modules/bugnet.js'); 
//Configuation file
var bnet = require('users/emaprlab/bugnetBlueMts2023:config3.js')

print(ee.Image(bnet.param.LTSDdir+bnet.param.LTSDname))
//////////////////////////////////////////////LTSD SNIC DECLINE///////////////////////////////////////////////////////////////
var ltsd_decline = bugnet.LTSD_decline_image(ee.Image(bnet.param.LTSDdir+bnet.param.LTSDname),bnet.param.target).mask(bnet.param.Mask)
////////////////////////////////////////////////////////////////////////////////////////////////////////////
Export.image.toAsset({image:ltsd_decline.toInt16(), description:bnet.param.declineName, assetId:bnet.param.assetDir+bnet.param.declineName,region:bnet.param.aoi, scale:30, maxPixels:1000000000})
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

