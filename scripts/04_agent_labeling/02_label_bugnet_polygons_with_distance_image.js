//////////////////////////////////////////////////////////////////////////////////////////////////////
//Extract distance raster values to points in bugnet polygons using sample regions then join the points 
//distance attributes to the Bugnet polygons. 
////////////////////////////////////////////////////////////////////////////////////////////////////////

//bugent config file 
var bnet = require('users/emaprlab/bugnetBlueMts2023:config2.js')

// assets 
var bunget_polygons = ee.FeatureCollection(bnet.param.assetDir+bnet.param.bugnet_polygons),
    agent_distance_img = ee.Image(bnet.param.assetDir+bnet.param.bugnet_distance_img);

// apply min pixel value to Bugnet polygon
var labeled_bugnet = agent_distance_img.reduceRegions({collection:bunget_polygons, reducer:ee.Reducer.min(), scale:30, tileScale:8})

// export 
Export.table.toAsset({collection:labeled_bugnet, description:bnet.param.bugnet_polygons_labeled, assetId:bnet.param.assetDir+bnet.param.bugnet_polygons_labeled})

