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

import geopandas as gpd
#import pandas as pd
import glob
import sys
import os
os.environ['GDAL_DATA'] = 'C:\\Users\\clarype\\AppData\\Local\\ESRI\\conda\\envs\\ltchange\\Library\\share\\gdal'
#from multiprocessing import Pool
#import json # or geojson
#import numpy as np
import functools
import config
# shp file path directory


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

	segfiles = glob.glob(seg+"**\\*.tif")
	chafiles = glob.glob(cha+"**\\*.tif")
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
        outDir = dir[1]+"\\vector\\change_attri\\"
        print(shp)
        # get shp to geo pandas df
        df = gpd.read_file(shp)
        # calc area and shape 
        df['perimeter'] = df['geometry'].length
        df['area'] = df['geometry'].area

        # set the coordinate system of the dataframe  --! HardCoded Projection !--
        df.set_crs(epsg=5070, inplace=True, allow_override=True)

        os.makedirs(outDir, exist_ok=True)
        # write the geopandas dataframe to a shp file 
        df.to_file(outDir+'attributed_'+os.path.basename(shp))
        print ('done ', shp)
        return 0

	
# main function
#def main(inDir):
if __name__ == "__main__":
        inDir = config.param['path']
        print("start")
        
        # makes a list of shp file paths. That is fed to the paraelell function
        shp_file_list = glob.glob(inDir+"\\vector\\change\\**\\*merged.shp") # this runs the risk of globing more than one directory

        c = []

        if len(shp_file_list) == 0 :
                print("Check 'shp_file_list' variable. The program is not finding files.")
                sys.exit()


        for i in shp_file_list:
                c.append([i,inDir])

        if len(c) == 0 :
                print("Check 'c' variable. The program is not finding files.")
                sys.exit()
        print(c)

        # testing the function on a single file
        #zonal_stat_operator(c[0])
        # run the program in parrellel
        #with Pool(10) as p:
        #        p.map(zonal_stat_operator, c)

        for f in c:
                zonal_stat_operator(f)
        print("done")
# run main function 	
#main(inDir)
# exit program
sys.exit()
