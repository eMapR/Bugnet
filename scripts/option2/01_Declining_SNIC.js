//////////////////////////////////////////////MOD ASSETS///////////////////////////////////////////////////////////////
//bugnet module
var bugnet = require('users/clarype/DNR_WA:/support/bugnet.js'); 
//Configuation file
var bnet = require('users/clarype/DNR_WA:option2/config_option2_2022.js')
print("_________Get DECLINING SNIC__________")
//////////////////////////////////////////////LTSD SNIC DECLINE///////////////////////////////////////////////////////////////
// Query only declining patches
print('Selecting Declining SNIC pathces - two year declines of NBR,TCW,TCG and Rate(mag/dur)', bnet.param.assetDir+bnet.param.snicName)
var snic_decline = bugnet.SNIC_decline_image(ee.Image(bnet.param.assetDir+bnet.param.snicName),bnet.param.target)
print('Declinig SNIC Patches', snic_decline)
////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Export imagery
Export.image.toAsset({image:snic_decline.toInt16(), description:bnet.param.declineName, assetId:bnet.param.assetDir+bnet.param.declineName,region:bnet.param.aoi, scale:30, maxPixels:1000000000})
print('Exporting Declining SNIC Patches', bnet.param.assetDir+bnet.param.declineName )
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

