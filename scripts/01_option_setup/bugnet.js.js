/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
//
//GIT test
//
/////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////// 
////////////////////////////////////////////////////////////////////////////////////////////////
//LandTrendr module
var ltgee = require('users/emaprlab/public:Modules/LandTrendr.js'); 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Filters ADS polygons by severity and defoliation
function filter_ads(){}
// aggrates ads polygon across time 
function agg_ads(){}
//this function returns a time series of dNBR annual images
function dNBR(){}
//This function returns a tappered tempo time seies (y-9,y-5,y-2,y-1,y) of the mean distance raster
function standardized_lt_image(){}
//This function returns a snic image
function snic_image(){}
// this function gets declinng snic patches for the landtrendr SNIC standardized image calling the unique bands of this image 
function SNIC_decline_image(){}
// this function gets declinng pixels for the landtrendr standardized image calling the unique bands of this image 
function LTSD_decline_image(){}
//
function get_training_points(){}
//
function get_ref_image(){}
//
function lcms_forest_mask(){}

// filter ads polygons by agent , severity and or defoliation
var filter_ads = function(agent, severity, defol, ads_col,all){


  if (defol === undefined && severity === undefined){
    
    print("mortality and defoliation not selected")
    return ads_col

  } else if (defol !== undefined && severity !== undefined){
    
    print("both mortality and defoliation selected")
    
    if (all){
      return ads_col.filter(ee.Filter.and(ee.Filter.or(ee.Filter.eq("DAMCODE",severity),ee.Filter.gt("DAMCODE",defol))))
    } else {
      return ads_col.filter(ee.Filter.and(ee.Filter.eq("AGENTCODE",agent),ee.Filter.or(ee.Filter.eq("DAMCODE",severity),ee.Filter.gt("DAMCODE",defol))))
    }
  } else if (defol === undefined){
    
    print('Only defoliation selected')
    if (all) {
      return ads_col.filter(ee.Filter.eq("DAMCODE",severity))
    } else {
      return ads_col.filter(ee.Filter.and(ee.Filter.eq("AGENTCODE",agent),ee.Filter.eq("DAMCODE",severity)))
    }
    
  } else if (severity === undefined){
    
    print('Only mortality selected')
    if (all) {
      print('all')
      return ads_col.filter(ee.Filter.gt("DAMCODE",defol))

    }else{
      print('some')
      return ads_col.filter(ee.Filter.and(ee.Filter.eq("AGENTCODE",agent),ee.Filter.gt("DAMCODE",defol)))  

    }
  } else {
    
    print("not sure what happened ")

  }

}
exports.filter_ads = filter_ads


////////////////////////////////////////////////////////////////////////////////////////////////
// function that accumulates ADS polygons as rasters through time.  

var agg_ads = function(startyear,focus_year,ads_col){

  // set up for mapping over the years in ADS dataset. starts by making a list of years in the dataset.
  var start_year = startyear
  var end_year = focus_year
  
  var list_of_year = []
  
  // function to create a list of the range of year in the ADS dataset
  var getYearBandNames = function(startYear, endYear){
    var years = [];                                                           
    for (var i = startYear; i <= endYear; ++i) years.push(i.toString());
    return years;
  };
  
  // creates a list of the range of year in the ADS dataset
  var year = getYearBandNames(start_year,end_year)

  // Map over the years in the dataset which returns a list of images one per year. there are hard coded filters here 
  var image_list = year.map(function(yr){
      var temp1 = ads_col
                      //.filter(ee.Filter.eq('yod',yr))
                      .reduceToImage({
                          //properties: ['AGENT1'],
                          properties: ['DAMCODE'],
                          reducer: ee.Reducer.count()    
                      }).rename(["yr_"+yr])
      return(temp1)
  })
  
  //changes list of single images to image of bands 
  var agent_image = ee.Image(image_list)
  
  // accumulates all bands to single and sums overlaping pixels
  return agent_image.reduce(ee.Reducer.sum()).selfMask()

}
exports.agg_ads = agg_ads

////////////////////////////////////////////////////////////////////////////////////////////////
// this function is the Delta NBR time sereis generator 
var dNBR = function(lt,start,end,indx,ftvLt,roi){

  // function that generates a list with a range of year values 
  var getYearBandNames = function(start, end){
    var years = [];                                                           
    for (var i = start; i <= end; ++i) {years.push('yr_'+i.toString());}
    return years;
  };
  
  // makes a list with a range of year values 
  var yearNames = getYearBandNames(start,end)
  
  // Get the fitted imagery
  var yearly_nbr = ltgee.getFittedData(lt, start, end, indx, ftvLt).clip(roi)
  print(yearly_nbr)
  // Here we select all bands in the image but the last
  var yearly_nbr_pre = yearly_nbr.select(yearNames.slice(0,yearNames.length-1))
  
  // here we select all bands in the image but the first 
  var yearly_nbr_post = yearly_nbr.select(yearNames.splice(1))
  
  // next we take the differance between the two offset image stacks
  return yearly_nbr_post.subtract(yearly_nbr_pre)

}
exports.dNBR = dNBR


////////////////////////////////////////////////////////////////////////////////////////////////
// This function generates fitted LandTrendr Data for 5 indices nbr, b5, tcb, tcg, and tcw. Then it selects an increasing tempo yearly observations with proposition of Y, Y-2 ,Y-3,Y-5,Y-9. 
var standardized_lt_image = function(ltrendr,start_Year,end_Year,fit_index,std_end_year){

  // here we generate the years needed in the standardized image. 
  var end_year = std_end_year.toString();
  var _2nd_tolast_year =  (std_end_year-1).toString();
  var _3rd_tolast_year = (std_end_year-2).toString();
  var second_year = (std_end_year-5).toString();
  var first_year = (std_end_year-9).toString();
  
  // each of these statements returns a fitted image for Years Y, Y-1,Y-2,Y-5,Y-9  
  var fitted_nbr = ltgee.getFittedData(ltrendr,start_Year,end_Year,"nbr",fit_index).select(["yr_" + first_year,"yr_" + second_year,"yr_" + _3rd_tolast_year,"yr_" + _2nd_tolast_year,"yr_" + end_year],["yr_" + first_year +"_nbr","yr_" + second_year +"_nbr","yr_" + _3rd_tolast_year +"_nbr","yr_" + _2nd_tolast_year +"_nbr","yr_" + end_year +"_nbr"]);
  //var fitted_b5 = ltgee.getFittedData(ltrendr,start_Year,end_Year,"b5",fit_index).select(["yr_" + first_year,"yr_" + second_year,"yr_" + _3rd_tolast_year,"yr_" + _2nd_tolast_year,"yr_" + end_year],["yr_" + first_year +"_b5","yr_" + second_year +"_b5","yr_" + _3rd_tolast_year +"_b5","yr_" + _2nd_tolast_year +"_b5","yr_" + end_year +"_b5"]);
  var fitted_tcb = ltgee.getFittedData(ltrendr,start_Year,end_Year,"tcb",fit_index).select(["yr_" + first_year,"yr_" + second_year,"yr_" + _3rd_tolast_year,"yr_" + _2nd_tolast_year,"yr_" + end_year],["yr_" + first_year +"_tcb","yr_" + second_year +"_tcb","yr_" + _3rd_tolast_year +"_tcb","yr_" + _2nd_tolast_year +"_tcb","yr_" + end_year +"_tcb"]);
  var fitted_tcg = ltgee.getFittedData(ltrendr,start_Year,end_Year,"tcg",fit_index).select(["yr_" + first_year,"yr_" + second_year,"yr_" + _3rd_tolast_year,"yr_" + _2nd_tolast_year,"yr_" + end_year],["yr_" + first_year +"_tcg","yr_" + second_year +"_tcg","yr_" + _3rd_tolast_year +"_tcg","yr_" + _2nd_tolast_year +"_tcg","yr_" + end_year +"_tcg"]);
  var fitted_tcw = ltgee.getFittedData(ltrendr,start_Year,end_Year,"tcw",fit_index).select(["yr_" + first_year,"yr_" + second_year,"yr_" + _3rd_tolast_year,"yr_" + _2nd_tolast_year,"yr_" + end_year],["yr_" + first_year +"_tcw","yr_" + second_year +"_tcw","yr_" + _3rd_tolast_year +"_tcw","yr_" + _2nd_tolast_year +"_tcw","yr_" + end_year +"_tcw"]);

  // // change to band name for full time series sample 
  // var fitted_nbr = ltgee.getFittedData(ltrendr,start_Year,end_Year,"nbr",fit_index).select(["yr_" + first_year,"yr_" + second_year,"yr_" + _3rd_tolast_year,"yr_" + _2nd_tolast_year,"yr_" + end_year],["yr_9_nbr","yr_5_nbr","yr_2_nbr","yr_1_nbr","yr_0_nbr"]);
  // //var fitted_b5 = ltgee.getFittedData(ltrendr,start_Year,end_Year,"b5",fit_index).select(["yr_" + first_year,"yr_" + second_year,"yr_" + _3rd_tolast_year,"yr_" + _2nd_tolast_year,"yr_" + end_year],["yr_" + first_year +"_b5","yr_" + second_year +"_b5","yr_" + _3rd_tolast_year +"_b5","yr_" + _2nd_tolast_year +"_b5","yr_" + end_year +"_b5"]);
  // var fitted_tcb = ltgee.getFittedData(ltrendr,start_Year,end_Year,"tcb",fit_index).select(["yr_" + first_year,"yr_" + second_year,"yr_" + _3rd_tolast_year,"yr_" + _2nd_tolast_year,"yr_" + end_year],["yr_9_tcb","yr_5_tcb","yr_2_tcb","yr_1_tcb","yr_0_tcb"]);
  // var fitted_tcg = ltgee.getFittedData(ltrendr,start_Year,end_Year,"tcg",fit_index).select(["yr_" + first_year,"yr_" + second_year,"yr_" + _3rd_tolast_year,"yr_" + _2nd_tolast_year,"yr_" + end_year],["yr_9_tcg","yr_5_tcg","yr_2_tcg","yr_1_tcg","yr_0_tcg"]);
  // var fitted_tcw = ltgee.getFittedData(ltrendr,start_Year,end_Year,"tcw",fit_index).select(["yr_" + first_year,"yr_" + second_year,"yr_" + _3rd_tolast_year,"yr_" + _2nd_tolast_year,"yr_" + end_year],["yr_9_tcw","yr_5_tcw","yr_2_tcw","yr_1_tcw","yr_0_tcw"]);



  // Here the program standardizeds the altered Landtrendr time series by calculating the mean across the stack pixels, then subtracts the mean from each pixel in that stack.      
  //NBR
  var fitted_mean_nbr =  fitted_nbr.reduce(ee.Reducer.mean())
  var standardized_nbr = fitted_nbr.subtract(fitted_mean_nbr)//.reproject({  crs: 'EPSG:5070',  scale: 30});
  
  // //B5
  //var fitted_mean_b5 =  fitted_b5.reduce(ee.Reducer.mean())
  //var standardized_b5 = fitted_b5.subtract(fitted_mean_b5)
  
  // //TCB
  var fitted_mean_tcb =  fitted_tcb.reduce(ee.Reducer.mean())
  var standardized_tcb = fitted_tcb.subtract(fitted_mean_tcb)
  
  // //TCG
  var fitted_mean_tcg =  fitted_tcg.reduce(ee.Reducer.mean())
  var standardized_tcg = fitted_tcg.subtract(fitted_mean_tcg)
  
  // //TCW
  var fitted_mean_tcw =  fitted_tcw.reduce(ee.Reducer.mean())
  var standardized_tcw = fitted_tcw.subtract(fitted_mean_tcw)
  
  // This statement merges each of the standardized images togther.
  var LTstandardizedComposite = standardized_nbr.addBands(standardized_tcb).addBands(standardized_tcg).addBands(standardized_tcw)//.mask(forest_mask);

  return LTstandardizedComposite;
  
}
exports.standardized_lt_image = standardized_lt_image




////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
// This statment generates the SNIC image from the Landtrendr standardized image. 
var snic_image = function(img){
  var snicImagery = ee.Algorithms.Image.Segmentation.SNIC({
      image: img,
      size: 5, //changes the number and size of patches 
      compactness: 1, //degrees of irregularity of the patches from a square 
    });
  return snicImagery
}
exports.snic_image = snic_image




////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

// capture decline pixels in the SNIC imagery.
var SNIC_decline_image = function(im,std_end_year){

  // here we generate the years needed in the standardized image. 
  var end_year = std_end_year.toString(); //2013
  var one_year =  (std_end_year-1).toString(); //2012
  var two_year = (std_end_year-2).toString(); //2011
  var three_year = (std_end_year-5).toString();//2006
  var four_year = (std_end_year-9).toString(); //2004

  
  var SNIC_decline = im.expression(

     'nbr_3 > nbr_4 > nbr_5 && tcg_3 > tcg_4 > tcg_5 &&  tcw_3 > tcw_4 > tcw_5 && rate > 25', {


        'nbr_1': im.select('yr_'+four_year+'_nbr_mean'),// 2004
        'nbr_2': im.select('yr_'+three_year+'_nbr_mean'),// 2008
        'nbr_3': im.select('yr_'+two_year+'_nbr_mean'),// 2011
        'nbr_4': im.select('yr_'+one_year+'_nbr_mean'),// 2012
        'nbr_5': im.select('yr_'+end_year+'_nbr_mean'),// 2013
        'tcg_1': im.select('yr_'+four_year+'_tcg_mean'),
        'tcg_2': im.select('yr_'+three_year+'_tcg_mean'),
        'tcg_3': im.select('yr_'+two_year+'_tcg_mean'),
        'tcg_4': im.select('yr_'+one_year+'_tcg_mean'),
        'tcg_5': im.select('yr_'+end_year+'_tcg_mean'),
        'tcw_1': im.select('yr_'+four_year+'_tcw_mean'),
        'tcw_2': im.select('yr_'+three_year+'_tcw_mean'),
        'tcw_3': im.select('yr_'+two_year+'_tcw_mean'),
        'tcw_4': im.select('yr_'+one_year+'_tcw_mean'),
        'tcw_5': im.select('yr_'+end_year+'_tcw_mean'),
        'rate': im.select('rate_mean')

  });

  return im.mask(SNIC_decline)
}
exports.SNIC_decline_image = SNIC_decline_image

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

// capture decline pixels in the SNIC imagery.
var LTSD_decline_image = function(im,std_end_year){

  // here we generate the years needed in the standardized image. 
  var end_year = std_end_year.toString(); //2013
  var one_year =  (std_end_year-1).toString(); //2012
  var two_year = (std_end_year-2).toString(); //2011
  var three_year = (std_end_year-5).toString();//2006
  var four_year = (std_end_year-9).toString(); //2004
  
  var LTSD_decline = im.expression(

     'nbr_3 > nbr_4 > nbr_5 && tcg_3 > tcg_4 > tcg_5 &&  tcw_3 > tcw_4 > tcw_5 && rate > 25', {


        'nbr_1': im.select('yr_'+four_year+'_nbr'),// 2004
        'nbr_2': im.select('yr_'+three_year+'_nbr'),// 2008
        'nbr_3': im.select('yr_'+two_year+'_nbr'),// 2011
        'nbr_4': im.select('yr_'+one_year+'_nbr'),// 2012
        'nbr_5': im.select('yr_'+end_year+'_nbr'),// 2013
        'tcg_1': im.select('yr_'+four_year+'_tcg'),
        'tcg_2': im.select('yr_'+three_year+'_tcg'),
        'tcg_3': im.select('yr_'+two_year+'_tcg'),
        'tcg_4': im.select('yr_'+one_year+'_tcg'),
        'tcg_5': im.select('yr_'+end_year+'_tcg'),
        'tcw_1': im.select('yr_'+four_year+'_tcw'),
        'tcw_2': im.select('yr_'+three_year+'_tcw'),
        'tcw_3': im.select('yr_'+two_year+'_tcw'),
        'tcw_4': im.select('yr_'+one_year+'_tcw'),
        'tcw_5': im.select('yr_'+end_year+'_tcw'),
        'rate': im.select('rate')

  });

  return im.mask(LTSD_decline)
}
exports.LTSD_decline_image = LTSD_decline_image



////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
//option 1 -- get sample points in decline and acending pixels
var get_training_points = function(recovery,disturbances,roi,referImage,ads_in_roi){
  
  // filters change to areas of ADS
  //var diff_down = disturbances.filterBounds(ads_in_roi.geometry())
  
  // filters change areas to ADS
  //var diff_up = recovery.filterBounds(ads_in_roi.geometry())
  
  // sample withing filtered change areas
  //var sample_down = ee.FeatureCollection.randomPoints(diff_down,200)
  //var sample_up = ee.FeatureCollection.randomPoints(diff_up,200)

  // Sample reference data with sample points 
  var extract_sample_down = referImage.sampleRegions({collection:disturbances, scale:30,geometries:true,tileScale:10})
  var extract_sample_up = referImage.sampleRegions({collection:recovery, scale:30, geometries:true,tileScale:10})

  // add 'down'label to sample features
  var attri_label_down = extract_sample_down.map(function(feat){
      return(feat.set({"label":1}));
  });
  
  // add 'up' label to sample features
  var attri_label_up = extract_sample_up.map(function(feat){
      return(feat.set({"label":0}));
  }) ;
  
  // merge samples 
  var trainingPoints = attri_label_down.merge(attri_label_up)
  
  return trainingPoints
}
exports.get_training_points = get_training_points
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
var get_lt_last_seg_info = function(lt, idx){
    // get LT segment data
  var segInfo = ltgee.getSegmentData(lt, idx, 'all');

  // get all the end segments
  var endSeg = segInfo.arraySlice({axis:1,start:-1, end: null, step:1});
  
  // make an image from the array of attributes for the change of interest
  var getLastSeg = function(img){
    var arrRowNames = [['startYear', 'endYear', 'preval', 'postval', 'mag', 'dur', 'rate', 'dsnr']];
    var endSegImg = img.arrayProject([0]).arrayFlatten(arrRowNames);
    var yod = endSegImg.select('endYear').rename('yod');  // add one to get year of detection, first year we know a change took place
    var Img = endSegImg.addBands(yod).select(['yod', 'mag', 'dur', 'preval', 'rate', 'dsnr']);
    return Img;
  }
  return getLastSeg(endSeg);
  
  };
exports.get_lt_last_seg_info = get_lt_last_seg_info;
// option 1 generate refernce image

var get_ref_image = function(lt, ltstartYear, yer, fit, roi){

    // Here we  get the fitted Landtrendr imagery____________________________________________________________________
  // var nbr_fit_to_nbr = ltgee.getFittedData(lt, ltstartYear, yer, 'nbr',fit);
  // var tcg_fit_to_nbr = ltgee.getFittedData(lt, ltstartYear, yer, 'tcg', fit);
  // var tcw_fit_to_nbr = ltgee.getFittedData(lt, ltstartYear, yer, 'tcw', fit);
  var tcb_fit_to_nbr = ltgee.getFittedData(lt, ltstartYear, yer, 'tcb', fit);
  
  // get LT segment data
  // var getLastSeg = get_lt_last_seg_info(lt, 'nbr');

  
  // print('target year',yer)
  // // get LandTrendr fitted values 
  // var indices_at_year = nbr_fit_to_nbr.select(['yr_'+yer.toString()],['yr_'+yer.toString()+'_nbr'])
  //                           //.addBands(ndvi_fit_to_nbr.select(['yr_'+yer.toString()],['yr_'+yer.toString()+'_ndvi']))
  //                           // .addBands(tcg_fit_to_nbr.select(['yr_'+yer.toString()],['yr_'+yer.toString()+'_tcg']))
  //                           // .addBands(tcw_fit_to_nbr.select(['yr_'+yer.toString()],['yr_'+yer.toString()+'_tcw']))
  //                           .addBands(tcb_fit_to_nbr.select(['yr_'+yer.toString()],['yr_'+yer.toString()+'_tcb']))
  // //print('indices_at_year',indices_at_year)                        
  // var indices_at_preyear = nbr_fit_to_nbr.select(['yr_'+(yer-1).toString()],['yr_'+(yer-1).toString()+'_nbr'])
  //                         //.addBands(ndvi_fit_to_nbr.select(['yr_'+(yer-1).toString()],['yr_'+(yer-1).toString()+'_ndvi']))
  //                         // .addBands(tcg_fit_to_nbr.select(['yr_'+(yer-1).toString()],['yr_'+(yer-1).toString()+'_tcg']))
  //                         // .addBands(tcw_fit_to_nbr.select(['yr_'+(yer-1).toString()],['yr_'+(yer-1).toString()+'_tcw']))//.clip(roi.geometry());
  //                         .addBands(tcb_fit_to_nbr.select(['yr_'+(yer-1).toString()],['yr_'+(yer-1).toString()+'_tcb']))//.clip(roi.geometry());
                          
  // var indices_at_pre2year = nbr_fit_to_nbr.select(['yr_'+(yer-2).toString()],['yr_'+(yer-2).toString()+'_nbr'])
  //                         //.addBands(ndvi_fit_to_nbr.select(['yr_'+(yer-2).toString()],['yr_'+(yer-2).toString()+'_ndvi']))
  //                         // .addBands(tcg_fit_to_nbr.select(['yr_'+(yer-2).toString()],['yr_'+(yer-2).toString()+'_tcg']))
  //                         // .addBands(tcw_fit_to_nbr.select(['yr_'+(yer-2).toString()],['yr_'+(yer-2).toString()+'_tcw']))
  //                         .addBands(tcb_fit_to_nbr.select(['yr_'+(yer-2).toString()],['yr_'+(yer-2).toString()+'_tcb']))
                          
  //var referImage = indices_at_year.addBands(indices_at_preyear).addBands(indices_at_pre2year).addBands(getLastSeg).clip(roi);
  
  //print('referImage',referImage)
  return   tcb_fit_to_nbr
  // return referImage
}
exports.get_ref_image = get_ref_image



////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////LCMS AGGR MASK////////////////////////////////////////////////////
// this function makes a forest mask from LMCS Land Use layer. This mask is a sumlumation of many LCMS years.
var lcms_forest_mask = function(start,end){
  // LCMS dataset
  var dataset = ee.ImageCollection('USFS/GTAC/LCMS/v2021-7');

  // make list of year values to aggragate over
  var ts = ee.List.sequence(start,2021); // 2021 is the most recent year
  
  // map over the list of year values to call map year of land use
  var lcms_agg = ts.map(function(yr){
      var img = dataset
      .filter(ee.Filter.and(
        ee.Filter.eq('system:time_start', ee.Date(ee.String(ee.Number(yr).int16()).cat(ee.String("-06-01"))).millis()),  // range: [1985, 2021]
        ee.Filter.eq('study_area', 'CONUS')  // or 'SEAK'
      )).first().select('Land_Use');
      
      // query landuse type into binary image
      return img.expression('band == 3',{'band': img});
      
  })

  // adds pixel values across images and returns a binary image
  var col = ee.ImageCollection(lcms_agg).sum().gt(0);

  return col;
};

exports.lcms_forest_mask = lcms_forest_mask;
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////TASSEL CAP LOW VEG MASK///////////////////////////////////////////////// NEED TO MAKE THIS BETTER == Maybe use other layers to help mask out non forest.
/////////////////////////////////////////////////////////////////////////////////////////////////////////
var tasselCapMask = function(bnet){
  //print(bnet)
  var lt_tar = ltgee.runLT(bnet.param.ltstartYear,bnet.param.target,bnet.param.startDay,bnet.param.endDay,bnet.param.aoi,bnet.param.index,bnet.param.fit,bnet.param.runParams,bnet.param.maskThese);
  //print(lt_tar, bnet.param.ltstartYear, bnet.param.target, bnet.param.fit, bnet.param.aoi)
  var targetImage = get_ref_image(lt_tar, bnet.param.ltstartYear, bnet.param.target, bnet.param.fit, bnet.param.aoi).int16();
  
  //var tcb = targetImage.select(["yr_"+bnet.param.ltendYear.toString()+"_tcb"]);
  var tcb = targetImage.select(["yr_"+bnet.param.target.toString()]);
  
  // tcb mask 
  var tcb_mask = tcb.expression(
    'band > 2000 ? 0 : 1',{
      //'band': tcb.select(['yr_'+bnet.param.ltendYear.toString()+'_tcb'])
      'band': tcb.select(['yr_'+bnet.param.target.toString()])
    });
  
  var mask = tcb_mask;

  return mask;
};


exports.tasselCapMask = tasselCapMask;

////////////////////////////////////////////////////////////////////////////////////////////////
//  rename yearly bands to standized label which the distance from the target year. this is for full time series of samples
var rename_img = function(img,target_year){
  
  var yearTarget = target_year.toString();
  var yearOne =  (target_year-1).toString();
  var yearTwo = (target_year-2).toString();
  var yearfive = (target_year-5).toString();
  var yearNine = (target_year-9).toString();
  
  var band_names = img.bandNames();
  
  return img.select(band_names,[
  "clusters",
  "yr_9_nbr_mean",
  "yr_5_nbr_mean",
  "yr_2_nbr_mean",
  "yr_1_nbr_mean",
  "yr_0_nbr_mean",
  "yr_9_tcb_mean",
  "yr_5_tcb_mean",
  "yr_2_tcb_mean",
  "yr_1_tcb_mean",
  "yr_0_tcb_mean",
  "yr_9_tcg_mean",
  "yr_5_tcg_mean",
  "yr_2_tcg_mean",
  "yr_1_tcg_mean",
  "yr_0_tcg_mean",
  "yr_9_tcw_mean",
  "yr_5_tcw_mean",
  "yr_2_tcw_mean",
  "yr_1_tcw_mean",
  "yr_0_tcw_mean",
  "yod_mean",
  "mag_mean",
  "dur_mean",
  "preval_mean",
  "rate_mean",
  "dsnr_mean",
  "seeds"
]);
};
  
exports.rename_img = rename_img;


////////////////////////////////////////////////////////////////////////////////////////////////
//  rename yearly bands to standized label which the distance from the target year. this is for full time series of samples
var rename_img_opt3 = function(img,target_year){
  
  var yearTarget = target_year.toString();
  var yearOne =  (target_year-1).toString();
  var yearTwo = (target_year-2).toString();
  var yearfive = (target_year-5).toString();
  var yearNine = (target_year-9).toString();
  
  var band_names = img.bandNames();
  
  return img.select(band_names,[
  "yr_9_nbr",
  "yr_5_nbr",
  "yr_2_nbr",
  "yr_1_nbr",
  "yr_0_nbr",
  "yr_9_tcb",
  "yr_5_tcb",
  "yr_2_tcb",
  "yr_1_tcb",
  "yr_0_tcb",
  "yr_9_tcg",
  "yr_5_tcg",
  "yr_2_tcg",
  "yr_1_tcg",
  "yr_0_tcg",
  "yr_9_tcw",
  "yr_5_tcw",
  "yr_2_tcw",
  "yr_1_tcw",
  "yr_0_tcw",
  "yod",
  "mag",
  "dur",
  "preval",
  "rate",
  "dsnr"
]);
};
  
exports.rename_img_opt3 = rename_img_opt3;


////////////////////////////////////////////////////////////////////////////////////////////////
//  rename yearly bands to standized label which the distance from the target year. this is for full time series of samples
var rename_ltsd_img = function(img,target_year){
  
  var yearTarget = target_year.toString();
  var yearOne =  (target_year-1).toString();
  var yearTwo = (target_year-2).toString();
  var yearfive = (target_year-5).toString();
  var yearNine = (target_year-9).toString();
  
  var band_names = img.bandNames();
  
  return img.select(band_names,[
  "yr_9_nbr",
  "yr_5_nbr",
  "yr_2_nbr",
  "yr_1_nbr",
  "yr_0_nbr",
  "yr_9_tcb",
  "yr_5_tcb",
  "yr_2_tcb",
  "yr_1_tcb",
  "yr_0_tcb",
  "yr_9_tcg",
  "yr_5_tcg",
  "yr_2_tcg",
  "yr_1_tcg",
  "yr_0_tcg",
  "yr_9_tcw",
  "yr_5_tcw",
  "yr_2_tcw",
  "yr_1_tcw",
  "yr_0_tcw",
  "yod",
  "mag",
  "dur",
  "preval",
  "rate",
  "dsnr"
]);
};
  
exports.rename_ltsd_img = rename_ltsd_img;


/////////////////////////////////////////////////CALCULATE//PROPORTION///////////////////////////////////////////////////////<<<
// Map over the list of cluster IDs. Then based on the index and element at index, calculate a proportion count lists
var calc_prop = function(ads_data,kmeans_data){
  
  var proporp= kmeans_data.map(function(k,v){
  
    //get index value of ads_count 
    var top = ee.Number(ee.Algorithms.If(ads_data.contains(k),ee.Number(ads_data.getNumber(k)).toInt(), -1));
    //get index value of kmeans_count 
    var bottom = ee.Number(kmeans_data.getNumber(k)).toInt();
    //calculate proportion for cluster 
    var proportion = (top.divide(bottom)).multiply(100);
  
    return proportion;
      
  })
  return proporp;
}

exports.calc_prop = calc_prop;


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ltcalc = function(year,feat){
  
  var target = feat.filter(ee.Filter.eq('yod',year))
  
  target = target.map(function(fe){return fe.set('area',fe.area(1))})
  target = target.map(function(fe){return fe.set('perimeter',fe.perimeter(1))})
  target = target.map(function(fe){return fe.set('rati', fe.getNumber('area').divide(fe.getNumber('perimeter')))})
  var attr_tyear = target.filter(ee.Filter.or(ee.Filter.gt('rati',20),ee.Filter.gt('area',9500000)))  
  
  return attr_tyear
  
  }


exports.ltcalc=ltcalc