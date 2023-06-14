#______________________________________________________________________________________________________________
#
#
#	This program will take a group of raster stacks and a group of yearly shp files, and extract the zonal 
#	stats to the shp files from the rasters bands. Each shp file and raster band corrispond to a year of 
#	data, and are match for the zonal stats operatoin. Each raster stats extracted will be record as a new 
#	field in the shp file attribution table. The programs will export a shp file for each inputted shp file
#	with a new file and at a new location specified in the script.  
#
#
#
#_______________________________________________________________________________________________________________

# import mods
from rasterstats import zonal_stats, point_query
import geopandas as gpd
import pandas as pd
import glob
import sys
import os
from multiprocessing import Pool
import json # or geojson
import numpy as np
import functools
import config
# shp file path directory
inDir = config.param['path']

#__________________________________________________________
#
# get rasters 
#
#	This function takes one parameter as a shpfile path string.
#	The shp file contains polygons and each polygon is used to 
#	gather zonal statistics from several rasters which are hard 
#	coded in the function. There are many hard coded file paths
#	in this functions.
#____________________________________________________________
def get_rasters(seg,cha,cms):

	segfiles = glob.glob(seg+"**/*.tif")
	chafiles = glob.glob(cha+"**/*.tif")
	cmsfiles = cms
	list_of_rasters = segfiles + chafiles + cmsfiles

	names = ["dur","mag","pre","post","ftv","cmon"]

	files = []

	for i in list_of_rasters:
		for e in names: 
			if e in i[-20:]:
				files.append(i)



	key_names = ["dur","idxMag","tcbMag", "tcbPre", "tcbPst","tcgMag", "tcgPre", "tcgPst","tcwMag", "tcwPre", "tcwPst","tcbVal","tcgVal","tcwVal","tcbDeltaVal","tcgDeltaVal","tcwDeltaVal","cmon"]
	
	dic = dict(zip(key_names,files))

	return dic


#__________________________________________________________
#
# zonal_stat_operator_function
#
#	This function takes one parameter as a shpfile path string.
#	The shp file contains polygons and each polygon is used to 
#	gather zonal statistics from several rasters which are hard 
#	coded in the function. There are many hard coded file paths
#	in this functions.
#____________________________________________________________
def zonal_stat_operator(dir):
	shp = dir[0]
	# output directory path
	outDir = dir[1]+"vector/change_attri/"
	changeDir = dir[1]+"raster/landtrendr/change/"
	segmentDir = dir[1]+"raster/landtrendr/segmentation/"
	cmonDir = ["/vol/v1/proj/bugnet/region6/bugnet_lt_change/supportDatasets/rasters/Cmonster/aggregated_attributions_5070_1990_2012_cmon.tif"] 
	# alot of raster stack file paths.
	
	imageDic = get_rasters(changeDir,segmentDir,cmonDir)
	# Check file path to see if they are real
	for key, value in imageDic.items() :		
		if not os.path.exists(value):
			print("Check raster file path: ", value)
			sys.exit()
		else:
			continue
	# get shp file year from file name
	shp_year = int(os.path.splitext(os.path.basename(shp))[0][-4:])
	
	# time pararmeters, the start year and end year of the dataset. 
	start_year = int(os.path.basename(os.path.dirname(shp)).split('-')[2][:4])
	end_year = int(os.path.basename(os.path.dirname(shp)).split('-')[2][4:])
	band = range(start_year,end_year+1).index(shp_year)

	cmon_band = 0
	cmon_start = 1990
	cmon_end = 2012
	try:
		cmon_band = range(cmon_start,cmon_end+1).index(shp_year)+1
		run_cmon = 1		
	except:
		cmon_band = 0
		run_cmon = 0		

	print(shp)
	print(band)
	print(shp_year)
	print(cmon_band)

	# an empty list for each dataframe that will hold zonal stats from each image
	gdf_list = []	

	# Here each iterateion generates a pandas dataframe containing the zonal stats for each image in the image dictionary.  
	for key, value in imageDic.items() :		
		# The Cmon image is shorter then the other images so condistion change for bands (years) 
		# greater then 22 (2012). Thus, in the code block below the creation of dataframes includes
		# the Cmon image. Inversely, the next code block (bands > 22), does not incorpreate the Cmon
		# image.
		if run_cmon:
	
			# When the iteration moves to a key containing 'Val' the image assocated has one extra 
			# band. This image is not a change image so it contain the first year data. Thus, to 
			# match the morjoity of the images and aline zonal stats, this condistion adds 1 to the 
			# band parameter.  
			if 'Val' in key: # 31 bands from 1 to 31

				# executes and asigns zonal stats as a 'geojson'
				stats = zonal_stats(shp, value, geojson_out=True, band = band+1)
			
			# In the iteration if a key contains 'cmon' the following will applied. The following inacts special 
			# properties since the "cmon" dataset is categorical.
			elif 'cmon' in key: # 23 bands 1 to 23 

				# Here we have a dictionary containing the number values in the image and there corrisponding 
				# qualitiy.	
				cmap = {0: 'masked', 1: 'Stable', 10: 'Unkwn Agent', 11: 'Other ', 20: 'Clearcut', 21: 'Part Harvest', 22: 'Salvage', 30: 'Development', 40: 'Fire', 50: 'Insect/Disease', 51: 'MPB-29', 52: 'MPB-239', 53: 'WSB-29', 54: 'WSB-239', 61: 'Water', 100: 'Ukn Slow Disturbance', 110: 'Ukn Abrupt Disturbance', 160: 'Recovery', 201: 'False Change'}
				
				# executes and asigns zonal stats as a 'geojson'. we also add 1 to the band to sync the images
				stats = zonal_stats(shp, value, categorical=True, stats="count", geojson_out=True, category_map=cmap, band = cmon_band)

			else: 
				# executes and asigns zonal stats as a 'geojson'
				stats = zonal_stats(shp, value, geojson_out=True, band = band)
			
			# The output geojson from the zonal_stats are not complete geojsons. So here we add a header to the 
			# geojson to complete it, then we read them as geopandas a data frame
			geoJson = {"type": "FeatureCollection","features": stats}
			json_object = json.dumps(geoJson)
			# reads geojson as geopandas dataframe
			gdf = gpd.read_file(json_object)
			# the zonal_stats function give default field names. So we need to give unquie field names before we 
			# merge all the geopandas dataframes. Here we change the default name to have a prefix which is the key
			# name for all except the "cmon" dataset
			if 'cmon' not in key:
			
				gdfreNamed = gdf.rename(columns ={'min':key+'_min', 'max':key+'_max', 'mean':key+'_mean', 'count':key+'_count'})
	
			# the cmon dataset is categorical so we dont need to change the feild names and we can just resign and 
			# append the dataframe to the merger list. 
			elif 'cmon' in key:

				# resign varible 
				gdfreNamed = gdf
			
			# append dataframe to list
			gdf_list.append(gdfreNamed)

		# The cmon dataset has less bands then the rest of the image datasets. Thus, onece we drop the cmon dataset from the 
		# zonal stats process. This is seen in the condionals below as we 'break' when the iteration intersects the cmon
		# dataset. Otherwize the process is the same as above just without the Cmon.
		elif not run_cmon:

			if 'Val' in key:

				stats = zonal_stats(shp, value, geojson_out=True, band = band+1)

			if 'cmon' in key:

				break
			else:
				stats = zonal_stats(shp, value, geojson_out=True, band = band)

			
			geoJson = {"type": "FeatureCollection","features": stats}
			json_object = json.dumps(geoJson)
			gdf = gpd.read_file(json_object)
			gdfreNamed = gdf.rename(columns ={'min':key+'_min', 'max':key+'_max', 'mean':key+'_mean', 'count':key+'_count'})

			gdf_list.append(gdfreNamed)

	# here merge all the single zonal stat dataframes, one per image dataset, together. Since the Pandas merge can only merge 
	# two dataset together at a time we use functools and lambda to iterate the process allowing use to merge a list of dataframes 
	# together. The merger in on th column "id" which is a row uquine value between the dataframes.
	if len(gdf_list) > 1:
		df_merged = functools.reduce(lambda  left,right: pd.merge(left,right,on=['id'],how='inner'), gdf_list)
	else:
		df_merged = gdf_list[0]
	# this empty list will be populated with column names that will be removed from the merged dataframe.
	colNames = []
	df_merged = df_merged.loc[:,~df_merged.columns.duplicated()]

	#remove unneeded columns. Here columns are removed if they fit a condistion, mainly if they contain "_x" or "_y". This 
	# columns are artifacts from the merger process and are redunent feilds. 
	for col in df_merged.columns:

		if 'geometry' in df_merged.columns:
		
			if '_x' in col:
    				colNames.append(col)
			if '_y' in col:
    				colNames.append(col)

		elif not 'geometry' in df_merged.columns:
		
			df_merged['geometry'] = gdf_list[0]['geometry']			

			if '_x' in col:
    				colNames.append(col)
			if '_y' in col:
    				colNames.append(col)

	df_merged['yod'] = df_merged['yod_x']

	# removes columns in dataframe that are listed in the list "colNames"
	df_merged = df_merged.drop(columns=colNames)

	# calc area and shape 
	df_merged['perimeter'] = df_merged['geometry'].length
	df_merged['area'] = df_merged['geometry'].area
	
	# set the coordinate system of the dataframe  --! HardCoded Projection !--
	df_merged.set_crs(epsg=5070, inplace=True, allow_override=True)
   	# below we preform some proportion calculation on the counts of a pixel type 
	# over the total pixel count for a poygon. The logic goes like this: if a feild exists
	# calculate the proportion with that feild involved and make a new for the proportion.

	if run_cmon:
	#if 1 == 22:

		proportion_names = ["masked","Stable","Unknw Agent","Other","Part Harvest","Salvage","Development","Clearcut","Fire","Insect/Disease","MPB-29","MPB-239","WSB-29","WSB-239","Water","Ukn Slow Disturbance","Ukn Abrupt Disturbance","Recovery","False Change"]
		
		# this empty list will be populated with column names on which dataframe max value is detirmed.
		pro_col_names = []		

		for name in proportion_names:
			
			if name in df_merged:
				new_name = name.replace(" ", "")
				df_merged["%_"+new_name]=0.0
				df_merged["%_"+new_name]=df_merged[name]/df_merged["count"]
				pro_col_names.append("%_"+new_name)
		
		# generate a new column "top_class" that contain the name of the column with the highest proportion	
		df_merged['top_class'] = df_merged[pro_col_names].eq(df_merged[pro_col_names].max(1), axis=0).dot(df_merged[pro_col_names].columns)

		# generate a new column "top_value" that contain the value of the column with the highest proportion	
		df_merged['top_value'] = df_merged[pro_col_names].max(axis=1)

		#query high magnitude change (harvests, clearcuts, fire) that has a proportion of 0.80 or higher
		#df_merged = df_merged[(df_merged['top_value'] >= 0.80)]#  &((df_merged['top_class'] == '%_Fire')|(df_merged['top_class']=='%_Clearcut')|(df_merged['top_class']=='%_PartHarvest'))]

		# fill any nan values with 0.0
		df_merged.fillna(0.0, inplace=True)
		
	# check if out dir is real
	os.makedirs(outDir, exist_ok=True)
	# write the geopandas dataframe to a shp file 
	df_merged.to_file(outDir+'attributed_'+os.path.basename(shp))
	#df_merged.to_csv(outDir+"attributed_80_"+os.path.basename(shp)[0:-4]+".csv")	
	
	
# main function
def main(inDir):

	# makes a list of shp file paths. That is fed to the paraelell function
	shp_file_list = glob.glob(inDir+"vector/change/**/change_*.shp") # this runs the risk of globing more than one directory

	c = []
	for i in shp_file_list:
		c.append([i,inDir])

	
	# testing the function on a single file
	#zonal_stat_operator(c[-1])

	# run the program in parrellel
	with Pool(6) as p:
        	p.map(zonal_stat_operator, c)

# run main function 	
main(inDir)
# exit program
sys.exit()
