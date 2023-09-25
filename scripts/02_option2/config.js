var param = {}
// Config name
param.configName = 'config_option2'

// AOI 
var eco3 = ee.FeatureCollection("EPA/Ecoregions/2013/L3") // EPA Eco Regions 
var states = ee.FeatureCollection("TIGER/2018/States");  // US States
var waor = states.filter(ee.Filter.or(ee.Filter.eq('STUSPS','WA'),ee.Filter.eq('STUSPS','OR'))).geometry().dissolve(1) // Washington and Oregon 
var eco_sub = eco3.filter(ee.Filter.eq('us_l3name','Coast Range')).geometry() // Coast Range Eco Region 
param.aoi = ee.FeatureCollection(eco_sub.intersection(waor).buffer(1000)) // Cast AOI

// time parameters 
param.ltstartYear = 1995;
param.ltendYear = 2023; // this should not be the same as the target year and it need to be greater than the target year
param.target = 2018;
param.startDay = "06-15";
param.endDay = "08-15";
param.maskStartTime = ee.Date((param.target-5).toString()+"-01-01").millis()
param.maskEndTime = ee.Date(param.target.toString()+"-12-30").millis()

// transformation parameters 
param.index = "NBR"                  
param.fit = ["NBR","TCG","TCW","TCB"]

// ADS parameters
param.ads = ee.FeatureCollection('projects/bugnet-364504/assets/ADS_R6_2010_2019_nofire_4326')
param.ads_damage = 30

// file naming parameters 
param.version = 'v1'
param.region = 'coastRange'

// working directories 
param.assetDir = "projects/bugent-base-img/assets/"
param.LTSDdir = 'projects/bugent-base-img/assets/' 

// SNIC parameters 
param.LTSDname = 'LTSD_'+param.configName+"_"+param.target
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
param.forestMaskName = 'bugnet_forest_mask_'+param.configName+"_"+param.target
param.maskThese = ['cloud','shadow'];
param.Mask = ee.Image(param.assetDir+param.forestMaskName)



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
  recoveryThreshold: 0.75,
  pvalThreshold: 0.05,
  bestModelProportion: 0.75,
  minObservationsNeeded: 11
};
print(param)
exports.param = param;
