//////////////////////////////////////////////MOD ASSETS///////////////////////////////////////////////////////////////
//LandTrendr module
var ltgee = require('users/emaprlab/public:Modules/LandTrendr.js'); 

//bugnet module
var bugnet = require('users/emaprlab/public:Modules/bugnet.js'); 
//Configuation file
var bnet = require('users/emaprlab/bugnetBlueMts2023:config2.js')

var states = bnet.param.aoi,
    snic_decline = ee.Image(bnet.param.assetDir+bnet.param.declineName),
    kmeans_decline = ee.Image(bnet.param.assetDir+bnet.param.kmeansName),
    sample = ee.FeatureCollection(bnet.param.assetDir+bnet.param.proportionName);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var referImage = bugnet.rename_img(snic_decline,bnet.param.target)

var samplefields = sample.first().propertyNames()
print('samplefields',samplefields)

var refbands = referImage.bandNames()
print('refbands',refbands)

//////////////////////////////////////////////////////////////////////////////////////
//Split the training points by 70%/30% 
var sample=sample.randomColumn();
var split = 0.70;  // Roughly 70% training, 30% testing.
var training = sample.filter(ee.Filter.lt('random', split));
print(training.size(),'points for classifier');   //points for classifier 
var test = sample.filter(ee.Filter.gte('random', split));
print(test.size(),'Testing points');      //testing points 
//////////////////////////////////////////////////////////////////////////////////////

//Build the Random Forest classifier: 
var RandomForest=ee.Classifier.smileRandomForest(500).train({
  features:test,
  classProperty:'label',
  inputProperties:refbands.remove('clusters').remove('seeds'),
}); 
print('Random forest,explained', RandomForest.explain());//RandomForest answer: Object(5 properties)

//Classify using RandomForest:  
var rf_model=referImage.classify(RandomForest).selfMask().clip(states).rename('bugnet_'+bnet.param.region+'_'+bnet.param.target+'_'+bnet.param.version)//.mask(forest_mask);
print(rf_model)
Export.image.toAsset({
  image:rf_model, 
  description: bnet.param.predicted, 
  assetId:bnet.param.assetDir+bnet.param.predicted,
  region:states, 
  scale:30, 
  maxPixels:1e13})

