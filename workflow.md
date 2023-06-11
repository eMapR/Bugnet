<!-----

Yay, no errors, warnings, or alerts!

Conversion time: 0.658 seconds.


Using this Markdown file:

1. Paste this output into your source file.
2. See the notes and action items below regarding this conversion run.
3. Check the rendered output (headings, lists, code blocks, tables) for proper
   formatting and use a linkchecker before you publish this page.

Conversion notes:

* Docs to Markdown version 1.0β34
* Sun Jun 11 2023 13:53:11 GMT-0700 (PDT)
* Source doc: Bugnet_workflow
* This is a partial selection. Check to make sure intra-doc links work.
----->


This workflow outlines the whole process for running Bugnet. Bugnet is a workflow that highlights the locations of insect and disease in the landscape using a group of models and geoprocessing programs. These programs involve two computing languages Python and GEE-javaScript. The programs and documentation can be downloaded from GitHub [link]. IF THERE ARE ANY ISSUES OR ERRORS PLEASE SUBMITTED AN ISSUE AT THIS GITHUB REPO. 

The processing is broken up into four phases: Project setup, finding high magnitude change, thinning-aggregating  and predicting, and lastly labeling by distance to agent.  

Processing:

Setup project space 



1. Make workspace directory on your local computer
    1. C:\path\to\new\project\folder\
2. Download scripts to workspace directory 
    2. GitHub link
3. Install or open Anaconda 
4. Make python environment LT-Change 
    3. Command
        1. conda env create -n ENVNAME --file ENV.yml
    4. Activate anaconda environment
        2. Conda activate 
    5. Command
5. Setup project directory structure  
    6. Edit line 22 of script 02 to point your project directory  
        3. Example of path
            1. C:\path\to\new\project\folder\
    7. Save script
    8. Run Script

Get High Magnitude Change polygons 



1. AOI to GEE 
    1. Create or upload an AOI to GEE
2. Get Data - GEE [link](https://code.earthengine.google.com/b7db3a3dee52c3eb542b1e464efd8320)
    2. Edit asset path and parameters as needed 
    3. Run script 
    4. Download data from google drive and save it in the gee_chunks directory  
        1. C:\path\to\new\project\folder\raster\prep\gee_chunks\
3. Extract files  
    5. Edit 04_unpack_lt_ee_data.py
        2. Edit line 27 with project folder path
            1. C:\path\to\new\project\folder\
    6. Run 04_unpack_lt_ee_data.py
4. Extract annual change 
    7. Edit 05_extract_annual_change.py
        3. Edit line 25 with project folder path
            2. C:\path\to\new\project\folder\
    8. Run 05_extract_annual_change.py (this script will take some time)
        4. This  Python program will ask questions about the disturbance to capture.
            3. My responses 
                1. Disturbance 
                2. 100
                3. No
                4. 0
5. Make polygons 
    9. Edit 06_make_polygons.py
        5. Edit line 25 with project folder path
            4. C:\path\to\new\project\folder\
    10. Run 06_make_polygons.py
        6. This  Python program will ask questions about making polygons.
            5. My responses
                5. 1 - project 
                6. 9 - MMU 
                7. Yes - yes to diagonal pixels
            6. Complete (an hour)
6. Attribute polygons
    11. 07_get_zonal_stats_R6.py
    12. Deactivate conda
    13. Activate BugNet_v2
    14. Edit
        7. Line : 26 - to point to working directory
            7. C:\path\to\new\project\folder\
    15. Run Script
7. LT Change Post processing 
    16. 08_get_zonal_stats_postprocess.py
    17. Edit line 17 with project folder path
        8. C:\path\to\new\project\folder\
8. Train and predict 
    18. 09_predict_high_mag_vector_labels.py
    19. Edit line 35 with project folder path
        9. C:\path\to\new\project\folder\
9. Upload predicted polygons to GEE

Bugnet



1. Bugnet GEE config file 
    1. 
2. Modified Forest Mask 
    2. 00_option2_forest_mask.js
        1. Edit 
            1. Make sure it is pointing to your config file.
        2. Run
3. TTTS (GEE)
    3. 01_option2_LTSD.js
        3. Edit 
            2. Make sure it is pointing to your config file.
        4. Run
4. SNIC
    4. 02_option2_LTSD_SNIC.js
        5. Edit 
            3. Make sure it is pointing to your config file.
        6. Run
5. Decline
    5. 03_option2_SNIC_Decline.js
        7. Edit 
            4. Make sure it is pointing to your config file.
        8. Run
6. KMeans
    6. 04_option2_Decline_kmeans.js
        9. Edit 
            5. Make sure it is pointing to your config file.
        10. Run
7. Proportion
    7. 05_option2_KMeans_Proportion.js
        11. Edit 
            6. Make sure it is pointing to your config file.
        12. Run
8. Predict
    8. 06_option2_Predict.js
        13. Edit 
            7. Make sure it is pointing to your config file.
        14. Run

Agent labeling 

