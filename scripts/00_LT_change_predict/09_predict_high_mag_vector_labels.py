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
import glob

#________________________Accessing_Data_and_Initiate_Dataframes_________________________

# ----------------------------------------------------
# read in singe shape file as dataframe
inDir = "/vol/v1/proj/bugnet/region6/bugnet_lt_change/workspace/"

# out DataSets
outDir = inDir+"vector/change_predicted/"
os.makedirs(outDir, exist_ok=True)


shp_of_list = glob.glob(inDir+'vector/change_attri_alter/*.shp')
# splite dataframe by year gourps pre and post 2012 or if labeled by cmonster
gdf = gpd.read_file(shp_of_list[0])
gdf_not_labeled = gdf[gdf['yod']>2012]
gdf_labeled = gdf[gdf['yod']<=2012]

# List of columns names with values important for classification
value_columns_table = ['dur_min', 'dur_max', 'dur_mean', 'idxMag_min', 'idxMag_max', 'idxMag_mea', 'tcbMag_min', 'tcbMag_max', 'tcbMag_mea', 'tcgMag_min', 'tcgMag_max', 'tcgMag_mea', 'tcwMag_min', 'tcwMag_max', 'tcwMag_mea', 'tcbPre_min', 'tcbPre_max', 'tcbPre_mea', 'tcgPre_min', 'tcgPre_max', 'tcgPre_mea', 'tcwPre_min', 'tcwPre_max', 'tcwPre_mea', 'tcbPst_min', 'tcbPst_max', 'tcbPst_mea', 'tcgPst_min', 'tcgPst_max', 'tcgPst_mea', 'tcwPst_min', 'tcwPst_max', 'tcwPst_mea', 'tcbDeltaVa', 'tcbDelta_1', 'tcbDelta_2', 'tcgDeltaVa', 'tcgDelta_1', 'tcgDelta_2', 'tcwDeltaVa', 'tcwDelta_1', 'tcwDelta_2', 'tcbVal_min', 'tcbVal_max', 'tcbVal_mea', 'tcbVal_cou', 'tcgVal_min', 'tcgVal_max', 'tcgVal_mea', 'tcwVal_min', 'tcwVal_max', 'tcwVal_mea', 'perimeter', 'area']

#____________________Spliting_Dataframes_into_training_and_Accessment_frames ____________________________________________________

def check_label_df_size(df,label):

	df_temp = gdf_labeled[gdf_labeled["top_class"]==label]
	df_temp1 = df_temp[df_temp['top_value']>0.90]
	size = df_temp1.shape[0]
	
	return df_temp1, size

label_list = ["%_Fire","%_Clearcut","%_PartHarvest","%_defoliation","%_UknSlowDisturbance","%_UknAbruptDisturbance","%_Recovery","%_Stable","%_FalseChange"]	
#label_list = ["%_Fire","%_Clearcut","%_PartHarvest","%_defoliation","%_UknSlowDisturbance","%_UknAbruptDisturbance","%_FalseChange"]	

pro_list = []

for i in label_list:
	
	inf0 = check_label_df_size(gdf_labeled,i)
	#if inf0[1] <= 300:
	#	#if inf0[1] > 25:
	#	if 1 == 25:
	#		pro_list.append(inf0[0].sample(inf0[0].shape[0]))
	#	else:
	#		continue
	#else:
		#pro_list.append(inf0[0].sample(300))
	pro_list.append(inf0[0])

#____________________Holdback data prep____________________________________________________

#holdback_list = []

#for i in pro_list:

#	proportion = int(i.shape[0]/8)
#	holdback = i[:proportion]
#	holdback_list.append(holdback)

#merge different classed samples back together (Valdiation)
#gdf_holdback = gpd.GeoDataFrame(pd.concat(holdback_list, ignore_index=True), crs=holdback_list[0].crs)
#print(gdf_holdback)
# Here we make a dataframe of just the top classes. This will later act as the labels. 
#gdf_holdback_labels = gdf_holdback[["top_class"]] 
#print(gdf_holdback_labels)
# Here we make a dataframe of just the predictor values. This will later act as the labels. 
#gdf_holdback_values = gdf_holdback[value_columns_table] 

#Change the training values dataframe to numpy array 
#gdf_holdback_values_array = gdf_holdback_values.to_numpy()

#______________________________Training_Data_Prep_____________________________

trainer_list = []

for i in pro_list:

	proportion = int(i.shape[0]/8)
	train = i[proportion:]
	trainer_list.append(train)

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
print(gdf_training_values_array)
print( gdf_training_labels_array)
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
print(1)
gdf_not_labeled['predicted'] = rf.predict(gdf_not_labeled_values_array)
print(gdf_not_labeled)
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

#out_df.to_file(outDir+"rf_labeled_polygons.shp")
gdf_not_labeled.to_file(outDir+"rf_labeled_polygons.shp")


#________________________________________________________________________
#________________________________________________________________________
#________________________________________________________________________

print("DONE")
sys.exit()
