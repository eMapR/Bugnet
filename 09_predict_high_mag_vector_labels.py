#==============================================================================================================
#	rf_classifier.py
#==============================================================================================================
#	Peter Clary Clarype@oregonstate.edu
#
#	10.15.2021
#
#	This program classifies a unlabeled polygon with labeled polygons. The classifier used is a Random 
#	Forest Classifier. Each of the labeled and unlabeled polygons are contain in separate shapefiles.
#	Both files are read in a geo pandas dataframes. The labeled dataframe is used to train and test the 
#	Random Forest model. We test the training model by withholding some labeled polygon and seeing how the 
#	model labels thems. Then, using the same training model we label the the unlabeled dataframe and export
#	it as a shp file.
#
#	TODO: add rf model choice portion to the export shpfile as feilds. 
#	
#	TODO: add calculation for label sample size	   
#

#===========LIB=================================
import geopandas as gpd
import os
import sys
import random
from sklearn.ensemble import RandomForestClassifier
from osgeo import gdal, gdal_array
import numpy as np
import pandas as pd

#________________________Accessing_Data_and_Initiate_Dataframes_________________________
# Input DataSets
# Both of these files were once a single file but were split by labeled and unlabed. Now we will use Random Forest
# to label the unlabed.

# shapefiles path labeled (1992-2011)
shpfile = "/vol/v1/proj/bugnet/region6/bugnet_lt_change/1990_2021/blueMountains/workspace/vector/change/NBR-7-19902021-06010910-v1-vloss_idx_75.0-col_0.0-4mmu_8con/labeling/labeled/processed_bugnet_r6_blues_labeled_1991_2012.shp"

# shapefiles not labeled (2013-2020) 
shpfile_not_labeled = "/vol/v1/proj/bugnet/region6/bugnet_lt_change/1990_2021/blueMountains/workspace/vector/change/NBR-7-19902021-06010910-v1-vloss_idx_75.0-col_0.0-4mmu_8con/labeling/not_labeled/bugnet_r6_blues_not_labeled_2013_2021.shp"

#output path
#outDir = "/vol/v1/proj/FS_Agent_Classifier/region6/bugnet_v2/blueMountains/ltChange_project_blueAll_1990_2021/vector/change/NBR-7-19902021-06010930-v3-vloss_idx_100.0-col_0.0-5mmu_8con/labeling/rf_output_debug/"
outDir = "/vol/v2/temp/"

# List of columns names with values important for classification
value_columns_table = ['dur_min', 'dur_max', 'dur_mean', 'idxMag_min', 'idxMag_max', 'idxMag_mea', 'tcbMag_min', 'tcbMag_max', 'tcbMag_mea', 'tcgMag_min', 'tcgMag_max', 'tcgMag_mea', 'tcwMag_min', 'tcwMag_max', 'tcwMag_mea', 'tcbPre_min', 'tcbPre_max', 'tcbPre_mea', 'tcgPre_min', 'tcgPre_max', 'tcgPre_mea', 'tcwPre_min', 'tcwPre_max', 'tcwPre_mea', 'tcbPst_min', 'tcbPst_max', 'tcbPst_mea', 'tcgPst_min', 'tcgPst_max', 'tcgPst_mea', 'tcwPst_min', 'tcwPst_max', 'tcwPst_mea', 'tcbDelta_m', 'tcbDelta_1', 'tcbDelta_2', 'tcgDelta_m', 'tcgDelta_1', 'tcgDelta_2', 'tcwDelta_m', 'tcwDelta_1', 'tcwDelta_2', 'tcbVal_min', 'tcbVal_max', 'tcbVal_mea', 'tcbVal_cou', 'tcgVal_min', 'tcgVal_max', 'tcgVal_mea', 'tcwVal_min', 'tcwVal_max', 'tcwVal_mea', 'perimeter', 'area']
# The statments below create geoPandas dataframes from the shpfile path above
gdf_labeled = gpd.read_file(shpfile)
gdf_not_labeled = gpd.read_file(shpfile_not_labeled)

# get list of column names from labeled shp file 
#namelist = []
#for col in gdf_labeled.columns:
#    namelist.append(col)
#print(namelist)
#sys.exit()

#____________________Spliting_Dataframes_into_training_and_Accessment_frames ____________________________________________________

# Randomly select rows for each class based on minimum number of polygon for a class. 
df_fire = gdf_labeled[gdf_labeled["top_class"]=="%_Fire"].sample(300)
df_cut = gdf_labeled[gdf_labeled["top_class"]=="%_Clearcut"].sample(300)
df_partH = gdf_labeled[gdf_labeled["top_class"]=="%_PartHarvest"].sample(300)
df_defol = gdf_labeled[gdf_labeled["top_class"]=="%_defoliation"].sample(300)
df_uknSlowD = gdf_labeled[gdf_labeled["top_class"]=="%_UknSlowDisturbance"].sample(300)
df_uknAbrup = gdf_labeled[gdf_labeled["top_class"]=="%_UknAbruptDisturbance"].sample(300)
df_recover = gdf_labeled[gdf_labeled["top_class"]=="%_Recovery"].sample(300)
df_stable = gdf_labeled[gdf_labeled["top_class"]=="%_Stable"].sample(300)
df_falseCha = gdf_labeled[gdf_labeled["top_class"]=="%_FalseChange"].sample(130)
print(1)
#dflist =[df_fire, df_cut,df_partH, df_defol, df_uknSlowD,df_uknAbrup,df_recover,df_stable,df_falseCha]
#label_size_list = []
#for i in dflist:
#	print(i.shape[0])
#	label_size_list.append(i.shape[0])
#print(label_size_list)
#sys.exit()

#____________________Holdback data prep____________________________________________________

#split each sample into a validation holdback sample
df_fire_holdback = df_fire[:50] 
df_cut_holdback = df_cut[:50]
df_partH_holdback = df_partH[:50]
df_defol_holdback = df_defol[:50]
df_uknSlowD_holdback = df_uknSlowD[:50]
df_uknAbrup_holdback = df_uknAbrup[:50]
df_recover_holdback = df_recover[:50]
df_stable_holdback = df_stable[:50]
df_falseCha_holdback = df_falseCha[:30]


# list of holdback dataframes that will be merged into one dataframe
holdback_list = [df_fire_holdback,df_cut_holdback,df_partH_holdback,df_defol_holdback,df_uknSlowD_holdback,df_uknAbrup_holdback,df_recover_holdback,df_stable_holdback, df_falseCha_holdback] 

#merge different classed samples back together (Valdiation)
gdf_holdback = gpd.GeoDataFrame(pd.concat(holdback_list, ignore_index=True), crs=holdback_list[0].crs)

# Here we make a dataframe of just the top classes. This will later act as the labels. 
gdf_holdback_labels = gdf_holdback[["top_class"]] 

# Here we make a dataframe of just the predictor values. This will later act as the labels. 
gdf_holdback_values = gdf_holdback[value_columns_table] 

#Change the training values dataframe to numpy array 
gdf_holdback_values_array = gdf_holdback_values.to_numpy()

#______________________________Training_Data_Prep_____________________________

#split each sample into a training sample
df_fire_training = df_fire[50:300]
df_cut_training = df_cut[50:300]
df_partH_training = df_partH[50:300]
df_defol_training = df_defol[50:300]
df_uknSlowD_training = df_uknSlowD[50:300]
df_uknAbrup_training = df_uknAbrup[50:300]
df_recover_training = df_recover[50:300]
df_stable_training = df_stable[50:300]
df_falseCha_training = df_falseCha[50:130]

# list of training dataframes that will be merged into one dataframe
trainer_list = [df_fire_training, df_cut_training, df_partH_training, df_defol_training, df_uknSlowD_training, df_uknAbrup_training, df_recover_training,df_stable_training, df_falseCha_training]

#merge different classed samples back together (Training)
gdf_training = gpd.GeoDataFrame(pd.concat(trainer_list, ignore_index=True), crs=trainer_list[0].crs)

# Here we make a dataframe of just the top classes. This will later act as the labels. 
gdf_training_labels = gdf_training[["top_class"]]

#This makes a dataframe for the values important for classification
gdf_training_values = gdf_training[value_columns_table]

#Change the training values dataframe to numpy array 
gdf_training_values_array = gdf_training_values.to_numpy()

#Change the training labels dataframe to numpy array 
gdf_training_labels_array = gdf_training_labels.to_numpy()

#_____________________Not_label_Dataframe_Prep___________________________

#This makes a dataframe for the values important for classification
gdf_not_labeled_values = gdf_not_labeled[value_columns_table] 

#Change the training values dataframe to numpy array 
gdf_not_labeled_values_array = gdf_not_labeled_values.to_numpy()

#______________________Train_Random_Forest___________________________________

# Initialize our model with 500 trees
rf = RandomForestClassifier(n_estimators=500, oob_score=True)

# Build a forest of trees from the training set
rf = rf.fit(gdf_training_values_array, gdf_training_labels_array)

#______________________Random_Forest_OOB_______________________________

#print('Our OOB prediction of accuracy is: {oob}%'.format(oob=rf.oob_score_ * 100))

# Setup a dataframe -- just like R
#df = pd.DataFrame()
#df['truth'] = gdf_holdback_labels
#df['predict'] = rf.predict(gdf_holdback_values_array)

# Cross-tabulate predictions
#print(pd.crosstab(df['truth'], df['predict'], margins=True))

#data = rf.predict_proba(gdf_holdback_values_array)

#____________________________Predict_________________________________

gdf_not_labeled['predicted'] = rf.predict(gdf_not_labeled_values_array)
print(rf.classes_)
#____________________________Prediction_Class_Proability_____________________________________
#add rf predicted proability to dataframe 

# define column names for each new feild
col_names = rf.classes_

# make dataframe from list that is the proability of each class
data = rf.predict_proba(gdf_not_labeled_values_array)
df_prob = pd.DataFrame(data, columns=col_names)
# select highest value across a few column and store value as a new column
df_prob["max_prob"] = df_prob.max(axis=1)
#______________________________Prep_for_export__________________________________

# add the proability dataframe to the predicted dataframe
out_df = pd.concat([gdf_not_labeled,df_prob], axis=1)
#______________________________Export__________________________________________

out_df.to_file(outDir+"rf_labeled_polygons_140_315_350.shp")


#________________________________________________________________________
#________________________________________________________________________
#________________________________________________________________________

print("DONE")
sys.exit()
