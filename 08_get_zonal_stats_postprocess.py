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

# shp file 
shpfile = "/vol/v1/proj/FS_Agent_Classifier/region6/bugnet_v2/blueMountains/ltChange_project_blueAll_1990_2021/vector/change/NBR-7-19902021-06010930-v3-vloss_idx_100.0-col_0.0-5mmu_8con/labeling/labeled/bugnet_r6_blues_labeled_1991_2012.shp"

outDir = "/vol/v1/proj/FS_Agent_Classifier/region6/bugnet_v2/blueMountains/ltChange_project_blueAll_1990_2021/vector/change/NBR-7-19902021-06010930-v3-vloss_idx_100.0-col_0.0-5mmu_8con/labeling/labeled/"

#read in shp file as pandas dataframe 
shp_df = gpd.read_file(shpfile)
print(shp_df.shape)


# get df columns 
column_names = shp_df.columns.tolist()

# remove salvage and 200 from list of column names 
new_column_names = [ feild for feild in column_names if "Salvage" not in feild ] 
new_column_names2 = [ feild for feild in new_column_names if "200" not in feild ] 

# drop salvage from data frame 
new_shp_df=shp_df[new_column_names2]
print(new_shp_df.shape)

#remove rows where top_class == salvage or 200
new_shp_df_minus_sal = new_shp_df[new_shp_df.top_class != "%_Salvage"]
df_rebirth = new_shp_df_minus_sal[new_shp_df_minus_sal.top_class != "%_200"]
print(df_rebirth.shape)

# change top_class value to insect if top_class equals WSB-29,WSB-239,MPB-29,MPB-239, and Insect/Dis.
print("--------")
df_rebirth.loc[df_rebirth['top_class'] == '%_WSB-239', 'top_class'] = '%_defoliation'
df_rebirth.loc[df_rebirth['top_class'] == '%_WSB-29', 'top_class'] = '%_defoliation'
df_rebirth.loc[df_rebirth['top_class'] == '%_MPB-239', 'top_class'] = '%_defoliation'
df_rebirth.loc[df_rebirth['top_class'] == '%_MPB-29', 'top_class'] = '%_defoliation'
df_rebirth.loc[df_rebirth['top_class'] == '%_Insect/Dis', 'top_class'] = '%_defoliation'

# write dataframe to shpfile 
df_rebirth.to_file(outDir+'processed_bugnet_r6_blues_labeled_1991_2012.shp')




