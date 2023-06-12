// option 3 -- This program applies the KMeans clustering process on pixels decining with time.
//////////////////////////////////////////////MOD ASSETS///////////////////////////////////////////////////////////////
//bugnet module
var bugnet = require('users/clarype/DNR_WA:/support/bugnet.js'); 

//Configuation file
var bnet = require('users/clarype/DNR_WA:option2/config_option3_2022.js')
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get reference image
var ltsd_decline = ee.Image(bnet.param.assetDir+bnet.param.declineName).selfMask()
Map.addLayer(ltsd_decline)
// get list of bands from reference image
var ltsd_bands = ltsd_decline.bandNames()

var sample = ltsd_decline.unmask().sample({region:bnet.param.aoi, scale:30, numPixels: bnet.param.kmeans_num_sample, tileScale:4, geometries:true}).filter(ee.Filter.gt('yod',bnet.param.ltstartYear))
//var sample = ltsd_decline.unmask().sampleRegions({collection:ee.FeatureCollection(bnet.param.aoi), scale:30}).filter(ee.Filter.gt('yod',bnet.param.ltstartYear))

Map.addLayer(sample)

print(sample.size())

var training = ee.Clusterer.wekaCascadeKMeans({
  minClusters:bnet.param.num_of_clusters,
  maxClusters:bnet.param.num_of_clusters,
  init:true
  }).train({ 
  features: sample, 
  inputProperties:ltsd_bands
});

var ltsd_decline_masked = ltsd_decline.selfMask()

var ltsd_decline_kmeans = ltsd_decline_masked.cluster(training).clip(bnet.param.aoi)

Export.image.toAsset({image:ltsd_decline_kmeans.toInt16(), description:bnet.param.kmeansName, assetId:bnet.param.assetDir+bnet.param.kmeansName,region:bnet.param.aoi, scale:30, maxPixels:1000000000})

