//////////////////////////////////////////////MOD ASSETS///////////////////////////////////////////////////////////////
//bugnet module
var bugnet = require('users/emaprlab/public:Modules/bugnet.js'); 
//Configuation file
var bnet = require('users/emaprlab/bugnetBlueMts2023:config2.js')
print("___________DECLINING SNIC TO KMEANS_____________")
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// import SNIC decline image
var snic_decline = ee.Image(bnet.param.assetDir+bnet.param.declineName)
print("SNIC Decline Image", snic_decline)
// get band names from the SNIC decline image -- slice first and last (SNIC seed and cluster bands)-- list is used to select KMeans dataspace
var snic_bands = snic_decline.bandNames().slice(1,-1)
print("bands to train KMeans on", snic_bands)
// get random sample of point attributies for KMeans 
//var sample = snic_decline.sample({region:bnet.param.aoi, scale:30, numPixels: 50,dropNulls:false ,tileScale:1, geometries:true})
var sample = ee.FeatureCollection(snic_decline.sampleRegions({collection:bnet.param.aoi, scale:30 ,tileScale:8, geometries:true}).randomColumn().sort('random').toList(bnet.param.kmeans_num_sample))

// Train KMeans on random same across selected bands and number of clusters
var training = ee.Clusterer.wekaCascadeKMeans({
  minClusters:bnet.param.num_of_clusters,
  maxClusters:bnet.param.num_of_clusters,
  init:true
  }).train({ 
  features: sample, 
  inputProperties:snic_bands
});
// Passes SNIC decline image to KMeans and clips to aoi
var snic_decline_kmeans = snic_decline.cluster(training).clip(bnet.param.aoi)
print('KMeans Image', snic_decline_kmeans)
// export image to assets 
Export.image.toAsset({image:snic_decline_kmeans.toInt16(), description:bnet.param.kmeansName, assetId:bnet.param.assetDir+bnet.param.kmeansName,region:bnet.param.aoi, scale:30, maxPixels:1000000000})
///////////////////////
print("Exporting KMeans as ", bnet.param.assetDir+bnet.param.kmeansName)


