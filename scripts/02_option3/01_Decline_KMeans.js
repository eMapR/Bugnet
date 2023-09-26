// option 3 -- This program applies the KMeans clustering process on pixels decining with time.
//////////////////////////////////////////////MOD ASSETS///////////////////////////////////////////////////////////////
//bugnet module
var bugnet = require('users/emaprlab/public:Modules/bugnet.js'); 
//Configuation file
var bnet = require('users/emaprlab/bugnetBlueMts2023:config2.js')
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get reference image
var ltsd_decline = ee.Image(bnet.param.assetDir+bnet.param.declineName)//.selfMask()

// get list of bands from reference image
var ltsd_bands = ltsd_decline.bandNames()

var sample = ltsd_decline.unmask().sample({region:bnet.param.aoi, scale:30, numPixels: bnet.param.kmeans_num_sample, tileScale:4, geometries:true}).filter(ee.Filter.gt('yod',bnet.param.ltstartYear))

var training = ee.Clusterer.wekaCascadeKMeans({
  minClusters:bnet.param.num_of_clusters,
  maxClusters:bnet.param.num_of_clusters,
  init:true
  }).train({ 
  features: sample, 
  inputProperties:ltsd_bands
});

var ltsd_decline_masked = ltsd_decline.selfMask().select(['yod']).gt(0)

var ltsd_decline_kmeans = ltsd_decline.mask(ltsd_decline_masked).cluster(training).clip(bnet.param.aoi)

Export.image.toAsset({image:ltsd_decline_kmeans.toInt16(), description:bnet.param.kmeansName, assetId:bnet.param.assetDir+bnet.param.kmeansName,region:bnet.param.aoi, scale:30, maxPixels:1000000000})

