#______________________________________________________________________________________________________________
#
#	this program consolidates feilds into a single field.
#
#
#_______________________________________________________________________________________________________________

# import mods
import geopandas as gpd
import pandas as pd
import glob
import sys
import os
from multiprocessing import Pool
import config
# shp file 
inDir = config.param['path']
shp_file_list = glob.glob(inDir+'vector/change_attri/*.shp')
list_of_dfs = []
for i in shp_file_list:
	temp_df = gpd.read_file(i)
	list_of_dfs.append(temp_df)

#merge different classed samples back together (Valdiation)
shp_df = gpd.GeoDataFrame(pd.concat(list_of_dfs, ignore_index=True))

outDir = inDir+"vector/change_attri_alter/"
os.makedirs(outDir, exist_ok=True)


# get df columns 
column_names = shp_df.columns.tolist()

# remove salvage and 200 from list of column names 
new_column_names = [ feild for feild in column_names if "Salvage" not in feild ] 
new_column_names2 = [ feild for feild in new_column_names if "200" not in feild ] 

# drop salvage from data frame 
new_shp_df=shp_df[new_column_names2]

#remove rows where top_class == salvage or 200
new_shp_df_minus_sal = new_shp_df[new_shp_df.top_class != "%_Salvage"]
df_rebirth = new_shp_df_minus_sal[new_shp_df_minus_sal.top_class != "%_200"]

# change top_class value to insect if top_class equals WSB-29,WSB-239,MPB-29,MPB-239, and Insect/Dis.
df_rebirth.loc[df_rebirth['top_class'] == '%_WSB-239', 'top_class'] = '%_defoliation'
df_rebirth.loc[df_rebirth['top_class'] == '%_WSB-29', 'top_class'] = '%_defoliation'
df_rebirth.loc[df_rebirth['top_class'] == '%_MPB-239', 'top_class'] = '%_defoliation'
df_rebirth.loc[df_rebirth['top_class'] == '%_MPB-29', 'top_class'] = '%_defoliation'
df_rebirth.loc[df_rebirth['top_class'] == '%_Insect/Dis', 'top_class'] = '%_defoliation'


# write dataframe to shpfile 
df_rebirth.to_file(outDir+'change_attri_alter_all_years.shp')




