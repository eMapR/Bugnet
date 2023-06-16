// ###############################################################################
// #### INPUTS ###################################################################
// ###############################################################################

// define external parameters
var featureCol = 'users/clarype/bugnet_aoi_coast_range'; // provide the path to aoi asset
//var featureKey = 'id'; // provide the feature attribute that will define the study area
//var featureValue = '0'; // what unique value from the above attribute field defines the study area
var runName = 'v1'; // a version name to identify the run; it should NOT include a dash/hyphen (-) 
var gDriveFolder = 'bugnet_coast_range'; // what is the name of the Google Drive folder that you want the outputs placed in
var startYear = 2000; // what year do you want to start the time series 
var endYear = 2022; // what year do you want to end the time series
var startDay = '06-15'; // what should the beginning date of annual composite be | month-day 06-01
var endDay =   '08-15'; // what should the ending date of annual composite be | month-day 09-30
var index = 'NBR'; // select the index to run, option are: 'NBRz', Band5z, 'ENC'
var maskThese = ['cloud', 'shadow', 'snow','water']; // select classes to masks as a list of strings: 'cloud', 'shadow', 'snow', 'water'

// define internal parameters - see https://emapr.github.io/LT-GEE/lt-gee-requirements.html#lt-parameters for details 
var runParams = { 
  maxSegments: 11,
  spikeThreshold: 0.9,
  vertexCountOvershoot: 3,
  preventOneYearRecovery: true,
  recoveryThreshold: 0.75,
  pvalThreshold: 0.05,
  bestModelProportion: 0.75,
  minObservationsNeeded: 11
};

// optional inputs
var outProj = 'EPSG:5070'; // what should the output projection be? 'EPSG:5070' is North American Albers
var affine = [30.0, 0, 15.0, 0, -30.0, 15.0]; // should center of pixel be tied to grid or corner - 15.0 is center, change to 0.0 for corner (15.0 aligns to NLCD products)
var options = {                            // options to exclude images
  'exclude':{
    'imgIds':[],                            // ...provide a list of image ids as an array
    'slcOff':false                           // ...include Landsat 7 scan line corrector off images (true or false)
  }
};


// ###############################################################################
// ###############################################################################
// ###############################################################################

// buffer the aoi 10 pixels to give consideration to mmu filter
var aoiBuffer = 300;

// load the LandTrendr library
var ltgee = require('users/emaprlab/public:Modules/LandTrendr.js'); 


// get geometry stuff
var aoi = ee.FeatureCollection(featureCol)
            //.filter(ee.Filter.stringContains(featureKey, featureValue))
            .geometry()
            .buffer(aoiBuffer);



// make annual composite collections
var srCollection = ltgee.buildSRcollection(startYear, endYear, startDay, endDay, aoi, maskThese, options);
var ltCollection = ltgee.buildLTcollection(srCollection, index, []);

// run landtrendr
runParams.timeSeries = ltCollection;
var ltResult = ee.Algorithms.TemporalSegmentation.LandTrendr(runParams);

// get the rmse
var rmse = ltResult.select('rmse');

// get the year array out for use in fitting TC
var lt = ltResult.select('LandTrendr');
var vertMask = lt.arraySlice(0, 3, 4);
var vertYears = lt.select('LandTrendr').arraySlice(0, 0, 1).arrayMask(vertMask);

// make a TC source stack
var tc = ltgee.transformSRcollection(srCollection, ['TCB','TCG','TCW']);

// fit TC
var fittedTC = ee.Algorithms.TemporalSegmentation.LandTrendrFit(tc, vertYears, runParams.spikeThreshold, runParams.minObservationsNeeded);

// get TC as annual bands stacks 
var ftvTCB = ltgee.getFittedData(fittedTC, startYear, endYear, 'TCB', true);
var ftvTCG = ltgee.getFittedData(fittedTC, startYear, endYear, 'TCG', true);
var ftvTCW = ltgee.getFittedData(fittedTC, startYear, endYear, 'TCW', true);

// get the vertex stack 
var vertInfo = ltgee.getLTvertStack(lt, runParams);

// remove the src values from vertex stack - no need to download them
var vertStack = vertInfo.select(['^.*yrs.*$'])
                        .addBands(vertInfo.select(['^.*fit.*$']));

// stack all the layers up
var ltStack = vertStack.addBands(rmse)
                       .addBands(ftvTCB)
                       .addBands(ftvTCG)
                       .addBands(ftvTCW)
                       .round()
                       .toShort()
                       .clip(aoi)
                       .unmask(-9999);

var nVert = parseInt(runParams.maxSegments)+1;
var fileNamePrefix = index+'-'+nVert.toString()+'-'+startYear.toString()+endYear.toString() + '-' + startDay.replace('-', '') + endDay.replace('-', '')+'-'+runName+'-'+outProj.replace(':', '');                

// make a list of images use to build collection
var srCollectionList = ltgee.getCollectionIDlist(startYear, endYear, startDay, endDay, aoi, options).get('idList');

// make a dictionary of the run info
var runInfo = ee.Dictionary({
  'featureCol': featureCol, 
  'runName': runName,
  'gDriveFolder': gDriveFolder,
  'fileNamePrefix': fileNamePrefix,
  'startYear': startYear,
  'endYear': endYear,
  'startDay': startDay,
  'endDay': endDay,
  'maskThese': maskThese,
  'segIndex': index,
  'maxSegments': runParams.maxSegments,
  'spikeThreshold': runParams.spikeThreshold,
  'vertexCountOvershoot': runParams.vertexCountOvershoot,
  'preventOneYearRecovery': runParams.preventOneYearRecovery,
  'recoveryThreshold': runParams.recoveryThreshold,
  'pvalThreshold': runParams.pvalThreshold,
  'bestModelProportion': runParams.bestModelProportion,
  'minObservationsNeeded': runParams.minObservationsNeeded,
  'ftvIndex': ['TCB','TCG','TCW'],
  'noData': -9999,
  'srCollectionList': srCollectionList,
  'options': options
});
var runInfo = ee.FeatureCollection(ee.Feature(null, runInfo));

// export the run info.
Export.table.toDrive({
  collection: runInfo,
  description: fileNamePrefix+'-runInfo',
  folder: gDriveFolder,
  fileNamePrefix: fileNamePrefix+'-runInfo',
  fileFormat: 'CSV'
});

// export the segmentation data
Export.image.toDrive({
  'image': ltStack.clip(aoi), 
  'region': aoi, 
  'description': fileNamePrefix+'-LTdata', 
  'folder': gDriveFolder, 
  'fileNamePrefix': fileNamePrefix+'-LTdata', 
  'crs': outProj, 
  'crsTransform': affine, 
  'maxPixels': 1e13
});

// // export the timesync data
// Export.image.toDrive({
//   'image': tsStack.clip(box), 
//   'region': box, 
//   'description': fileNamePrefix+'-TSdata', 
//   'folder': gDriveFolder, 
//   'fileNamePrefix': fileNamePrefix+'-TSdata', 
//   'crs': outProj, 
//   'crsTransform': affine, 
//   'maxPixels': 1e13
// });

// // export the clear pixel count stack
// Export.image.toDrive({
//   'image': nClearStack.clip(box), 
//   'region': box, 
//   'description': fileNamePrefix+'-ClearPixelCount', 
//   'folder': gDriveFolder, 
//   'fileNamePrefix': fileNamePrefix+'-ClearPixelCount', 
//   'crs': outProj, 
//   'crsTransform': affine, 
//   'maxPixels': 1e13
// });

// export the buffered LT shapefile
Export.table.toDrive({
  collection: ee.FeatureCollection(aoi),
  description: fileNamePrefix+'-LTaoi',
  folder: gDriveFolder,
  fileNamePrefix: fileNamePrefix+'-LTaoi',
  fileFormat: 'SHP'
});

// // export the TS shapefile
// Export.table.toDrive({
//   collection: ee.FeatureCollection(box),
//   description: fileNamePrefix+'-TSaoi',
//   folder: gDriveFolder,
//   fileNamePrefix: fileNamePrefix+'-TSaoi',
//   fileFormat: 'SHP'
// });



