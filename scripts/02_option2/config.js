var param = {}
// Config name
param.configName = 'config_option2'

// AOI 
param.aoi = ee.FeatureCollection("users/clarype/bugnet_study_AOI") // Cast AOI //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// time parameters 
param.ltstartYear = 1995;
param.ltendYear = 2023; 
param.target = 2023;
param.startDay = "06-15";
param.endDay = "08-15";
param.maskStartTime = ee.Date((param.target-5).toString()+"-01-01").millis()
param.maskEndTime = ee.Date(param.target.toString()+"-12-30").millis()

// transformation parameters 
param.index = "NBR"                  
param.fit = ["NBR","TCG","TCW","TCB"]

// ADS parameters
param.ads = ee.FeatureCollection('') // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
param.ads_damage = 30

// file naming parameters 
param.version = 'v1'
param.region = 'blueMts'

// working directories  // if you area is spatialy large these should be different locations
param.assetDir = "projects/bugnetbluemts-400023/assets/"  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
param.LTSDdir = "projects/bugnetbluemts-400023/assets/" //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

//LTSD name
param.LTSDname = 'LTSD_'+param.target

// SNIC parameters 
param.snicName = 'SNIC_'+param.configName+"_"+param.target
param.declineName = 'Decline_'+param.configName+"_"+param.target

// KMeans 
param.kmeansName = 'KMeans_'+param.configName+"_"+param.target
param.kmeans_num_sample = 5000
param.num_of_clusters = 30

// Proportion of Intersection 
param.proportionName = 'proportions_'+param.configName+"_"+param.target

// Random Forest Tranning/Prediction 
param.num_of_trainers = '1' // 1 - same year. 2 - all years.
param.predicted = 'labeled_'+param.configName+"_"+param.target


//mask parameters 
param.forestMaskName = 'bugnet_forest_mask_'+param.target
param.maskThese = ['cloud','shadow'];
param.Mask = ee.Image(param.assetDir+param.forestMaskName)
param.buffer = 50
param.ltchange = ee.FeatureCollection(param.assetDir+'change_attri')


// agent labeling parameters 
param.agent_lookback = 5
param.agent_distance = 10000
param.bugnet_polygons = "bugnet_polygons_unlabeled_"+param.region+"_"+param.target+"_"+param.version
param.bugnet_distance_img = "bugnet_distance_image_"+param.region+"_"+param.target+"_"+param.version
param.bugnet_polygons_labeled = "bugnet_polygons_distance_labeled_"+param.region+"_"+param.target+"_"+param.version

param.proportion_strat_sample_size = 1000 // three class to be sampled 

// LandTrendr parameters
param.runParams = { 
  maxSegments: 11,
  spikeThreshold: 0.9,
  vertexCountOvershoot: 3,
  preventOneYearRecovery: true,
  recoveryThreshold: 0.95,
  pvalThreshold: 0.05,
  bestModelProportion: 0.95,
  minObservationsNeeded: 8
};
print(param)
exports.param = param;
