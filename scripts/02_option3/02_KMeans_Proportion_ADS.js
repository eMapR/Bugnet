
// // ////////////////////////////////////////////MODULES///////////////////////////////////////////////////////////////////
//LandTrendr module
var ltgee = require('users/emaprlab/public:Modules/LandTrendr.js'); 

//bugnet module
var bugnet = require('users/clarype/DNR_WA:/support/bugnet.js'); 

//Configuation file
var bnet = require('users/clarype/DNR_WA:option2/config_option3_2022.js')

////////////////////////////////////////////////ADS FILTERING////////////////////////////////////////////////////////////////////
//get and filter ADS polygons by year and amount of Damage
var ads = bnet.param.ads
print('ads size', ads.size())
///////////////////////////////////////////////ADS//TO//IMAGE////////////////////////////////////////////////////////////
//mutate the filter ads polygons into rasters 
// var ads_img = ads.reduceToImage(['DAM1'], ee.Reducer.first()).int16()
//   //change the pixel values of the ads image to 100 -- this allows us to track the cluster that intersect ads polygons  
//   .multiply(0)//.add(100)
//   // add kmeans cluster values to ads image
//   .add(ee.Image(bnet.param.assetDir+bnet.param.kmeansName))
//   .rename(['ads_clusters'])
  
//mutate the filter ads polygons into rasters 
var ads_img = ads.reduceToImage(['DCA_CODE'], ee.Reducer.first()).int16()
  //change the pixel values of the ads image to 100 -- this allows us to track the cluster that intersect ads polygons  
  .multiply(0)//.add(100)
  // add kmeans cluster values to ads image
  .add(ee.Image(bnet.param.assetDir+bnet.param.kmeansName))
  .rename(['ads_clusters'])
///////////////////////////////////////////////DEFINE//AOI//////////////////////////////////////////////////////////////
//Get the bounds of the area of intereset--The bounds of Washington and Oregon -- Region 6 Forest Service 
var aoi = bnet.param.aoi
///////////////////////////////////////////////KMEANS//IMAGE//HISTOGRAM///////////////////////////////////////////////////
var kmeans = ee.Image(bnet.param.assetDir+bnet.param.kmeansName).rename(['kmeans_clusters'])
// look at the pixel count of declining K means clusters as a histogram.
print(ui.Chart.image.histogram({image:kmeans, region:aoi, scale:30, maxBuckets:30,maxPixels:1e13})) 
///////////////////////////////////////////////ADS//IMAGE//HISTOGRAM///////////////////////////////////////////////////
// look at the pixel count of declining K means clusters  tha intersect ADS polygons as a histogram.
print(ui.Chart.image.histogram({image:ads_img, region:aoi, scale:30, maxBuckets:30,maxPixels:1e13})) 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get a the proportion of insecting values -- calculate for each it proportionalitiy
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// histogram info with cluster id and pixel count for each cluster id in a dictionary
// get image histogram array 
var ads_his = ads_img.reduceRegion({reducer: ee.Reducer.frequencyHistogram() ,geometry:aoi,scale:30,maxPixels:1e13})
//print(ads_his)
var kmeans_his = kmeans.reduceRegion({reducer: ee.Reducer.frequencyHistogram(),geometry:aoi,scale:30,maxPixels:1e13})
//print(kmeans_his)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////<<< make sure lists are fill correctly
//get histogram count for each cluster (ads)
var ads_his_info = ee.Dictionary(ads_his.values(['ads_clusters']).get(0))
//print('ads_his_info',ads_his_info)

//get histogram count for each cluster (kmeans)
var kmeans_his_info = ee.Dictionary(kmeans_his.values(['kmeans_clusters']).get(0))
//print('kmeans_his_info',kmeans_his_info)
/////////////////////////////////////////////////CALCULATE//PROPORTION///////////////////////////////////////////////////////<<<
// Map over the list of cluster IDs. Then based on the index and element at index, calculate a proportion count lists
var proporp= kmeans_his_info.map(function(k,v){


  //get index value of ads_count 
  var top = ee.Number(ee.Algorithms.If(ads_his_info.contains(k),ee.Number(ads_his_info.getNumber(k)).toInt(), -1))
  //get index value of kmeans_count 
  var bottom = ee.Number(kmeans_his_info.getNumber(k)).toInt()
  //calculate proportion for cluster 
  var proportion = (top.divide(bottom)).multiply(100)

  return proportion
  
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// sort proportion values in decending order
var sorted = proporp.values().sort().reverse()
print(sorted)
// sort list of proportoin and maintain cluster id to its proportion value 
var sorted_proporp = sorted.map(function(k){
  // how many zeros are in the list 
  return proporp.keys().get(proporp.values().indexOf(k))
})

sorted_proporp = sorted_proporp.map(function(d){return ee.Number.parse(d)})
print(sorted_proporp)
//break up list into label groups

/////////////////////////////////////////////////////GET//SAMPLE//MASK/////////////////////////////////////////////////////
// get list cluseter ids to mask image to labels 
var label3_id = sorted_proporp.slice(0,2)
var label2_id = sorted_proporp.slice(2,15)
var label1_id = sorted_proporp.slice(15,30)

// make binary image for cluster locatons for each label
function label_image(cluster_list){
  var label_img = cluster_list.map(function(cl){
    return kmeans.eq(ee.Number(cl))
  })
  return label_img
}

// apply mask function to label lists 
var label_1_img = ee.ImageCollection(label_image(label3_id)).max().multiply(3)
var label_2_img = ee.ImageCollection(label_image(label2_id)).max().multiply(2)
var label_3_img = ee.ImageCollection(label_image(label1_id)).max().multiply(1)
var sample_img = label_3_img.add(label_2_img).add(label_1_img).selfMask().rename(['label'])
//Map.addLayer(sample_img,null,'sample_img')



// add need images together on which to get sample depth
var ref_img = ee.Image(bnet.param.assetDir+bnet.param.declineName)//
print(ref_img.bandNames())
var ref_img = bugnet.rename_img_opt3(ref_img,bnet.param.target).addBands(kmeans).addBands(sample_img)
print(ref_img.bandNames())
////////////////////////////////////////////////////GET//SAMPLE/////////////////////////////////////////////////////////////
//stratified sample 
var sample = ref_img.stratifiedSample({numPoints:bnet.param.proportion_strat_sample_size, classBand:'label', region:aoi, scale:30, tileScale:4, geometries:true})
// Map.addLayer(sample,{},'sample')
// print(sample.first())
////////////////////////////////////////////////////////////////////////////////////////////////////////

// returns a feature collection of declining SNIC patches 
Export.table.toAsset({
  collection:sample, 
  description:bnet.param.proportionName, 
  assetId:bnet.param.assetDir+bnet.param.proportionName, 
  maxVertices:1000000  
})

