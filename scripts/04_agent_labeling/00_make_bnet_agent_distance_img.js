// This program makes a distance raster from ADS polygons
// It does so by slicing the ads dataset into X year chuncks 
// The ADS dataset is further simplified by aggragating agent lable into a higher teir [11006 to 11000] western pine bettle to bark bettle
// This mutated ADS dataset is then turn into a distance raster with pixel values representing distance from a ADS polygon
// Each teired agent label from the ADS dataset become a raster band in the distance raster 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var bnet = require('users/clarype/DNR_WA:option2/config_option2_2022.js')
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ads_startYear = bnet.param.target-bnet.param.agent_lookback
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// aoi - Region 6 Washington and Oregon
var aoi_region6 = bnet.param.aoi
var ads = bnet.param.ads.filter(ee.Filter.and(ee.Filter.gte('SURVEY_YEA',ads_startYear),ee.Filter.lte('SURVEY_YEA',bnet.param.target)))

// get dictionary of DCA CODES. this will be used to filter ADS polygons by agent or other label
var DCA_CODE_list = ee.Dictionary(ads.aggregate_histogram("DCA_CODE")); // DICTIONARY

// get the code names from dictionary as a list. In the dictionary the keys names are the code names. 
var keys = DCA_CODE_list.keys(); // LIST 

// mutates the list of names to represent a higher teir of agent in the DCA_CODE_list. exp 11004 to 11000. this will be used as a lower range value to filter values from ADS.THIS IS A SPECIFIC METHOD 
var tiered_keys = keys.map(function(ele){return ee.Number.parse(ee.String(ele).slice(0,2).cat('000'))}).distinct(); // LIST

// mutaes the above list to represent the higher range value for filtering ADS polygons
var tier_ceiling = tiered_keys.map(function(ele){return ee.Number(ele).add(1000)}); //LIST

// Zips bothe the lower and upper ranges in the list of list [[11000,12000],...,[90000,91000]]
var tier_bounds = tiered_keys.zip(tier_ceiling); // LIST of LISTs [[],[]]

// generate list of new gruop agnet names
var newNames = tiered_keys.map(function(ele){return ee.String("agent").cat(ee.String(ele))})

// filters ADS polygons by teir agent label by mapping over list of lists that contain the upper and lower bounds for filtering agent groups
var ads_teired_agents = tier_bounds.map(function(ele){
  // get lower bound  value 
  var one =  ee.List(ele).get(0);
  // get upper bound value 
  var two =  ee.List(ele).get(1);
  // filter ADS on equality using the lower and upper bound values 
  return ads.filter(ee.Filter.and(ee.Filter.gte('DCA_CODE',one),ee.Filter.lt('DCA_CODE',two)))
});// LIST OF FEATURE COLLECTIONS. one for each agent group

// generate a mask for ads locations. this makes sure that pixels that intersect ADS polygon have a value of zero.
var ads_agent_img = ads_teired_agents.map(function(m){ return ee.FeatureCollection(m).reduceToImage(['DAMAGE_TYP'],ee.Reducer.mean()).unmask().not()})
ads_agent_img = ee.ImageCollection(ads_agent_img).toBands().rename(newNames)

// map over each feature collection and create a distance raster. this raster will be used to get the distance value that will be attributed to bunget polygons.
var distance_img = ads_teired_agents.map(function(ele){return ee.FeatureCollection(ele).distance(bnet.param.agent_distance,1).reproject({crs:"EPSG:3857",scale:30}).rename([ee.String(ee.Feature(ee.FeatureCollection(ele).first()).get('DCA_CODE')).slice(0,2).cat('000')])});//LIST OF RASTERS

// change list of images to imagecollection then image >> rename the bands >> add ADS zeros >> reproject 
var img_out = ee.ImageCollection(distance_img).toBands().rename(newNames).multiply(ads_agent_img).reproject({crs:"EPSG:3857",scale:30}).clip(aoi_region6).int16() 

//Export 
Export.image.toAsset({image:img_out, description:bnet.param.bugnet_distance_img, assetId:bnet.param.assetDir+bnet.param.bugnet_distance_img,region:aoi_region6, scale:30,maxPixels:1e13})
