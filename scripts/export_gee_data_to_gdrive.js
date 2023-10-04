
// Load an image or feature collection.
var image = ee.Image('projects/bugnetbluemts-400023/assets/labeled_config_option2_2023');
var featureCollection = ee.FeatureCollection('projects/bugnetbluemts-400023/assets/bugnet_polygons_distance_labeled_blueMts_2023_v1');

// Define the export parameters.
var ImageExportOptions = {
  image: image,  // Replace 'image' with 'featureCollection' if exporting a feature collection.
  description: 'bugnet_image_opt2', // Set a name for the export task.
  folder: 'bugnet_GEE_exports', // Set the folder in your Google Drive where the exported file will be saved.
  scale: 30, // Set the scale (e.g., 30 meters for Landsat imagery).
  region: image.geometry(), // Set the region of interest.
  maxPixels: 1e13
};

// Define the export parameters.
var featureExportOptions = {
  collection: featureCollection,  // Replace 'image' with 'featureCollection' if exporting a feature collection.
  description: 'bunget_polygons_opt2', // Set a name for the export task.
  folder: 'bugnet_GEE_exports', // Set the folder in your Google Drive where the exported file will be saved.
};

// Export the image or feature collection to Google Drive.
Export.image.toDrive(ImageExportOptions);
Export.table.toDrive(featureExportOptions);

