//////////////////////////////////////////////MOD ASSETS///////////////////////////////////////////////////////////////
//LandTrendr module
var ltgee = require('users/emaprlab/public:Modules/LandTrendr.js'); 

//bugnet module
var bugnet = require('users/emaprlab/public:Modules/bugnet.js'); 
//Configuation file
var bnet = require('users/emaprlab/bugnetBlueMts2023:config2.js')

var states = bnet.param.aoi
var decline_mask = ee.Image(bnet.param.assetDir+bnet.param.declineName).select(['yod']).gt(0)
var decline = ee.Image(bnet.param.assetDir+bnet.param.declineName).mask(decline_mask)
var kmeans_decline = ee.Image(bnet.param.assetDir+bnet.param.kmeansName)
var sample = ee.FeatureCollection(bnet.param.assetDir+bnet.param.proportionName);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var referImage = bugnet.rename_ltsd_img(decline,bnet.param.target)

var samplefields = sample.first().propertyNames()
print('samplefields',samplefields)

var refbands = referImage.bandNames()
print('refbands',refbands)

//////////////////////////////////////////////////////////////////////////////////////
//Split the training points by 70%/30% 
var sample=sample.randomColumn();
var split = 0.25;  // Roughly 70% training, 30% testing.
var training = sample.filter(ee.Filter.lt('random', split));
print(training.size(),'points for classifier');   //points for classifier 
var test = sample.filter(ee.Filter.gte('random', split));
print(test.size(),'Testing points');      //testing points 
//////////////////////////////////////////////////////////////////////////////////////

//Build the Random Forest classifier: 
var RandomForest=ee.Classifier.smileRandomForest(500).train({
  features:training,
  classProperty:'label',
  inputProperties:refbands.remove('clusters').remove('seeds'),
}); 
print('Random forest,explained', RandomForest.explain());//RandomForest answer: Object(5 properties)

//Classify using RandomForest:  
var rf_model=referImage.classify(RandomForest).selfMask().clip(states)//.mask(forest_mask);

Export.image.toAsset({
  image:rf_model, 
  description: bnet.param.predicted, 
  assetId:bnet.param.assetDir+bnet.param.predicted,
  region:states, 
  scale:30, 
  maxPixels:1e13})

