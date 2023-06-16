//////////////////////////////////////////////MOD ASSETS///////////////////////////////////////////////////////////////
//bugnet module
var bugnet = require('users/clarype/DNR_WA:/support/bugnet.js'); 
//Configuation file
var bnet = require('users/clarype/DNR_WA:option2/config_option2_2022.js')
print("_________LTSD TO SNIC__________")
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get LTSD image
print('Importing ltsd - LandTrendr Standardized Image', bnet.param.ltsdassetDir+bnet.param.LTSDname)
var ltsd = ee.Image(bnet.param.ltsdassetDir+bnet.param.LTSDname)
print(ltsd)
//////////////////////////////////////////////LTSD SNIC////////////////////////////////////////////////////////////////////
// Generate a SNIC image from the LTSD image and then mask with non forest mask
print('Masking out forests from SNIC image',bnet.param.Mask)
var ltsd_snic = bugnet.snic_image(ltsd).mask(bnet.param.Mask)
print('Masked SNIC Image - adds two SNIC bands ["seed", "cluster"], and mutates other bands.',ltsd_snic)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Export image
Export.image.toAsset({image:ltsd_snic.toInt16(), description:bnet.param.snicName, assetId:bnet.param.assetDir+bnet.param.snicName,region:bnet.param.aoi, scale:30, maxPixels:1000000000})
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
print('Exporting SNIC image as',bnet.param.assetDir+bnet.param.snicName)
