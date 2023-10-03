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

#import geopandas as gpd
import glob
import sys
import os
import config
# shp file path directory
import time
import arcpy
import shutil
import zipfile

def copy_and_zip_change_files(source_folder):
    try:
        # Get the parent directory of the source folder
        parent_dir = os.path.dirname(source_folder)
        
        # Create a new folder 'change_attri' at the same location
        destination_folder = os.path.join(parent_dir, 'change_attri')
        os.makedirs(destination_folder, exist_ok=True)
        
        # Traverse the source folder with a depth limit of 2
        for root, _, files in os.walk(source_folder):
            depth = root[len(source_folder):].count(os.sep)
            
            if depth <= 2:
                for filename in files:
                    if '_change_merged' in filename:
                        print(filename)
                        source_file = os.path.join(root, filename)
                        destination_file = os.path.join(destination_folder, filename)
                        try:
                                shutil.copy2(source_file, destination_file)
                        except:
                                print(filename)
        
        # Create a zip file of the 'change_attri' folder
        zip_filename = os.path.join(parent_dir, 'change_attri.zip')

        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(destination_folder):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, destination_folder)
                    zipf.write(file_path, arcname=arcname)
        
        print(f"Files copied and zipped successfully to '{zip_filename}'")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")



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

def calculate_metrics(dir):
    shapefile_path = dir[0]
    # output directory path
    outDir = dir[1]+"\\vector\\"
        
    try:
        # Check out the ArcGIS Spatial Analyst extension
        arcpy.CheckOutExtension("Spatial")

        # Open the shapefile for editing
        with arcpy.da.UpdateCursor(shapefile_path, ["SHAPE@", "Size", "Perimeter"]) as cursor:
            # Check if the "Size" field exists, and if not, create it
            fields = [field.name for field in arcpy.ListFields(shapefile_path)]
            if "Size" not in fields:
                arcpy.AddField_management(shapefile_path, "Size", "DOUBLE")

            # Check if the "Perimeter" field exists, and if not, create it
            if "Perimeter" not in fields:
                arcpy.AddField_management(shapefile_path, "Perimeter", "DOUBLE")

            for row in cursor:
                # Get the geometry of the current feature
                geometry = row[0]

                # Calculate the area (size) of the polygon
                size = geometry.area

                # Calculate the perimeter of the polygon
                perimeter = geometry.length

                # Update the Size and Perimeter fields with calculated values
                row[1] = size
                row[2] = perimeter

                cursor.updateRow(row)

        # Check in the ArcGIS Spatial Analyst extension
        arcpy.CheckInExtension("Spatial")

        print("Metrics calculated and added as attributes successfully.")


    
    except Exception as e:
        print(f"Error: {str(e)}")



	
# main function
#def main(inDir):
if __name__ == "__main__":
        inDir = config.param['path']
        print("started")
        
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

        for f in c:
                #zonal_stat_operator(f)
                calculate_metrics(f)
                # Example usage:
        arcpy.ClearWorkspaceCache_management() 
        time.sleep(5)
        copy_and_zip_change_files(inDir+"\\vector\\")
        print("done")
# run main function 	
#main(inDir)
# exit program
sys.exit()
