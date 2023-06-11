**Overview:**

Death and destruction is occuring in forests; which is often due to or involves the effects of insects. This death can be widespread, killing hundreds of thousands of acres of trees in a year which was reported in Washington state [reference ] in 2019. However, these effects are not limited to Washington State but occur throughout the forests of the Western United States [reference] and the globe [reference]. This is problematic as an influx of dead standing trees increases the possibility for further damage by fire or the untimely forest reduction by harvest to midgate fire susceptibility [reference].

Public and private agencies have long been monitoring such events to the best of their ability for decades. Region 6 of the Forest Service (Oregon and Washington State) have been conducting aerial surveys since 1947 to monitor such events [[link](https://www.fs.usda.gov/detail/r6/forest-grasslandhealth/insects-diseases/?cid=stelprdb5286951)]. This data from the Aerial Detection Survey gives the approximate size and location of insect and disease outbreaks which is used to address and prioritizes future forest management needs. [link]

However, the aerial survey is a massive task with continuous hurdles such as limited funding, time constraints and safety limitations [Coleman]. Other events like weather or aircraft maintenance protocols can also inhibit the survey. In some Forest Service Regions, like Region 10 of Alaska; the Forest Service can not physically observe all 126 million acres of forest by aircraft [link]. This forced the Forest Service to rely on historical and local information to guide where to conduct their survey.

This style of detection, by ground account is common practice as local stakeholders and agencies are observant to events that can change their landscape. This awareness has prompted these groups to look for other methods in which to observe forest health and they have been increasingly looking to remote sensing. In the last several decades, remote sensing has been building momentum as an alternate option for monitoring insects and disease. Satellite based platforms offer alluring possibilities with observation consistency and data availability. This data can be processed in various ways to provide locations of changing forests as determined by statistical models. The LCMS (Land Cover Monitoring System) of the United States Forest Service (USFS) is one such model used by the USFS to monitor and analyze land cover and land use changes across the nation's forests and grassland. LCMS monitors forest disturbances as vegetation growth or loss, but gives no insight to acting agents. LCMS uses two sub categories of fast or loss change which refers to the duration of the change instead.

This trajectory duration change detection is common in remote sensing, as it skirts having to add agent labels leaving further attribution or interpretation to the end user. LandTrendr, an algorithm that analyzes time series of satellite imagery also offers duration trajectory change detections and can be deployed in the same manner. Again, these change detection models provide insight to the direction a landscape is moving, growth or decline, but do not apply a label to the type of change. Nevertheless, this information is useful to land managers interested in insects and disease as it shows locations of possible interest. But without agent labels, validation or confidence that change is of interest or even real, means there is no defendable way to quantify the extent affected by insects and disease in the landscape. In regions like Alaska a false positive for change that may not even be insects and disease can be costly as they can not observe the whole region by aircraft.

In effort to support land managers, here we leverage current change detection methods and image processing to facilitate land managers in their work to know locations of insects and disease in the forests of Washington and Oregon with Bugnet. While Bugnet uses these common changed detection techniques it differs in that it thins the processing area of regions that are not suitable for insects and disease in forests. [...]

**Method Overview:**

There are 3 options used in this study to locate insect and disease damage in Washington and Oregon forests. All of the options have the same goal but with slightly different ways of generating the locations of insect and disease. Option 1, the simplest of the 3 options, uses simple thresholding to define the sample area which is later used to train a Random Forest Classifier to predict the locations of insect and disease. Option2 uses Simple Non-iterative Clustering (SNIC) and K Means to group areas of insect and disease into labels of likelihood. Option 3 is the same as option 2 but it does not use SNIC in its process. All of the options use ADS polygons to guide their sampling for prediction. Observing the sensitivity of each option is the key reason for the number of options and variations, and to evaluate if the SNIC method, option2 proves to be better than a pixel based approach, option1 and 3. 

Bugnet highlights model defined insects and disease locations by removing all pixels from the dataspace that are not relevant to the objective; It does so in several steps. First by making a forest mask from the LCMS (Land Cover Monitoring System) land use raster for a region of focus. The workflow then uses LandTrendr change detection methods to refine the forest mask by finding and removing areas of high magnitude change associated with forest harvest and fire. The pixels that remain should represent stable and growing forest along with declining regions of forest not associated with forest management or fire.



<p id="gdcalert2" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image2.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert3">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image2.png "image_tooltip")


(This image shows one polygon, in red, that was labeled by the high magnitude disturbance Random forest as harvest.  It is polygons like this that are used to remove high magnitude events like harvest and fire from the dataspace before processing.)

The data space is then thinned by excluding pixels that are stable or increasing with time. [an increase in pixel values represents growth]. With the data space thinned to pixels of subtle or unknown change, Bugnet begins to partition the remaining pixels into groups of similar change types with SNIC (simple non-iterative clustering) and then KMeans; both popular clustering algorithms. The SNIC algorithm is used to remove noise, and simplify the landscape by patchifying pixels that are spectrally similar and neighboring one another [reference]. These patches of declining forest patches contain insects and disease amongst other low magnitude change types. [maybe take this out, or talk about how there are small amounts of uncaught change in the imagery]. Bugnet further groups the spectral dataspace of the declining patches with KMeans. KMeans is a popular unsupervised machine learning algorithm used for clustering data into a specified number of groups or clusters. KMeans in this case links SNIC patches that are spectrally similar but spatially separate based on their spectral temporal information. 



<p id="gdcalert3" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image3.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert4">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image3.png "image_tooltip")


(The images above visually show the input and output of the SNIC algorithm. The image on the left is a Landsat image showing a forested region.  The image on the right is the output from SNIC and we can easily see how SNIC groups land regions that are similar. Note the stand of forest in the red circle)

This effectively groups SNIC patches that are similar under KMeans cluster IDs, and insect & disease detected by Bugnet is grouped under one or more of these cluster IDs, but Bugnet does not yet indicate what cluster IDs contain insect and disease. This is where ADS polygons are used as a means of labeling what KMeans cluster could be associated with insects and disease. Looking at the frequency of how KMeans cluster IDs intersect ADS polygons the model finds cluster IDs that are more or less associated with ADS polygons. Clusters with high proportions of intersection with ADS get a label and clusters with low proportion get a different label. These locations and labels become the bases for sampling and training of an image classifier that predicts on the SNIC imagery. 



<p id="gdcalert4" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image4.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert5">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image4.png "image_tooltip")


<p id="gdcalert5" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image5.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert6">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image5.png "image_tooltip")


<p id="gdcalert6" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image6.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert7">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image6.png "image_tooltip")


(These three images show NAIP imagery on the left, an ADS polygon in the center and Bugnet on the right all for the same location and year. The left Naip image shows various amounts of insect and disease damage as seen as the brown colors in the image. The ADS polygon more or less encapsulates the damaged area, and Bugnet with it various likelihood color code (red: highest likelihood, gray: lowest likelihood) highlights regions of interest. )

The predicted output is an image showing pixels in three categories of likelihood. One being the lowest likelihood of matching with ADS and three being the most likely.These pixels are not associated with any particular agent of insect or disease, but are later vectorized, changed to polygons, and attributed with the distance to the nearest ADS polygons of an agent class. Bugnet is currently being validated by human interpreters to access the accuacates of the outputs and variations of Bugnet models



<p id="gdcalert7" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image7.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert8">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image7.png "image_tooltip")


(The image above shows the Time Sync Plus interface. The top panel shows the temporal trajectory of Landsat pixels in the red or white polygon. The middle panel is NAIP imagery of the target year, giving a high resolution perspective of the landscape. The bottom panel is yearly Landsat imagery such provides a view of texture with time. )

**Method (option 1)**

**    **

The premise to option 1 is to locate pixels in an image that represent insects and disease for a forested region. The process uses Aerial Detection Survey (ADS) polygon to guide sample locations for what is and is not defoliation and mortality. ADS polygons are hand digitized polygons around insects and disease as drawn by observers. The model then uses spectral/temporal imagery to determine the direction the landscape is moving in the ADS polygons. The regions that are either experiencing a growth or decline are sampled as such. These samples are used to extract spectral and temporal information at each sample location. This sample is used to train a Supervised Classifier which will then predict/classify the locations of defoliation and mortality in the imagery of forest regions.  

**Methods (option2)**

**LandTrendr:**

At the base of all the options is LandTrendr temporally stabilized Landsat imagery. LandTrendr (Landsat-based Detection of Trends in Disturbance and Recovery) is a time-series analysis algorithm that is used for monitoring and detecting land cover changes over time, particularly focusing on detecting disturbances and recovery in landscapes [reference]. The algorithm analyzes time-series data from Landsat satellite imagery, which captures spectral information of the Earth's surface in different wavelengths of light. LandTrendr uses a pixel-based approach to analyze these spectral values and identify trends in the data over time. LandTrendr has the ability to identify rates of changes in land cover, such as those caused by forest management, fire, insects and disease, and other events. The algorithm does this by "gdcalert8" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image8.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert9">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image8.png "image_tooltip")
￼

(This shows Landtrendr stabilized imagery in a temporal format where color is change and the grayscale (white to black) is stable. We can easy see forest management as the boxy regions with recent changes as red and yellow )

**Standardized LandTrendr:**

The standardized image represents the distance a pixel value is from the mean of a pixel’s tapered tempo time series (TTTS). TTTS is a time series of imagery with a tapering window of time between yearly observations. That is, the frequency of years used in the time series is not a regular interval. 

The tapered tempo time series starts wide and narrows as the time series approaches present. For example, TTTS could be images from the following years: 2011, 2015, 2018, 2019, and 2020 or in the form  (targeYear - 9, targetYear -5, targetYear - 2, targetYear - 1, targetYear). TTTS puts emphasis on the three most recent years, but is retrospective of the early observations in the time series. The standardized image is calculated by taking the mean of the TTTS and subtracting the mean from each observation in the TTTS for every pixel in the imagery. Essentially, this places the mean of the image at zero, and any value greater or less than zero is a change for “normal” and can be interpreted as change in the landscape. These changes are generally actions we expect in a landscape: phenology, farming, construction, forest husbandry, fire, forest disease, and more. Many change agents are limited to land cover a type, for example, tree husbandry only happens in forest, thus limiting the imagery in the workflow to only forest regions helps in narrowing and removing change agents that we are not interested in. Masking the TTTS with a forest layer greatly reduces what pixels need to be processed, and limits the number of change agents that need to be addressed. This and the following making is foundational to the Bugnet process. 



<p id="gdcalert9" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image9.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert10">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image9.png "image_tooltip")


<p id="gdcalert10" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image10.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert11">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image10.png "image_tooltip")


(These images show the tapered tempo time series (TTTS) on the left and 2013 NAIP imagery on the right. The color in the TTTS shows disturbance with reds, orange and yellows, and  the browns in the NAIP imagery are insect and disease damage. Comparing the two images we can see the spatial relationship between the disturbance in the TTTS on the left and the location of insect and disease on the right. It is clear that there is a readable signal in this outbreak. )

**LCMS Forest Mask:**

The workflow implements LCMS to generate a forest mask layer. More specifically, the forest mask is created by aggregating the forest land use label over the past 10 years of a target year. This gives a general area of where forests are, and fills in areas within forests that may be labeled otherwise, such as; a cleared stand of trees labeled for range land or pasture. This gives the model a base forest mask that includes forest disturbances that is lateta into polygon data. 



<p id="gdcalert11" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image11.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert12">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image11.png "image_tooltip")




<p id="gdcalert12" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image12.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert13">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image12.png "image_tooltip")


(This image shows the LandTrendr Tassel Cap Wetness Temporal imagery and 2002 polygon of change in blue. The temporal shows three years of Tassel Cap Wetness data (2002,2003,2004). Change appears in the image as color, stability as white to black and growth as blues. Red was disturbed in 2002 and yellow for 2003. The blue polygons surrounding regions of high magnitude change clear cuts and partial harvests.)

The polygon data represent discrete regions of change and are attributed with characteristics describing the year of the change as well as spectral and spatial properties that can aid in labeling the change agents. The workflow uses a classified layer (Cmonster) [reference] that contains change events labels like fires and clearcuts to attribute to the change polygons. Only polygons with 80 percent or more pixels belonging to a single label are used in the process. 



<p id="gdcalert13" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image13.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert14">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image13.png "image_tooltip")




<p id="gdcalert14" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image14.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert15">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image14.png "image_tooltip")


(the images above show the Cmonster dataset with blue disturbance polygons overlaid. The red are regions of clearcuts and the yellows are partial harvest. The Cmonster dataset is used to extract and attribute change agent labels to the polygon dataset. This labels along with spectral temporal data is used to label other polygons beyond the end year of the Cmonster dataset.  )

These labeled polygons pertain to only a portion of the full time series (1990-2012) thus the rest of the LT Change polygons need to be labeled with the Random Forest Classifier trained from the earlier labeled years. Using a Random Forest classifier, and the labeled polygon as training data, the polygons from the latter portion of the time series are labeled. These outputs were then validated by human interpreters. The interpreters validated a stratified random sample of the predicted polygons. The validation showed that the model was able to accurately label high magnitude changes like harvest and fire.

**Thinning and Aggregating the Dataspace**

The workflow uses these labeled polygons to remove pixels of change from the USFS-LCMS forest mask of a target year. With a forest mask mostly void of high magnitude changes that are not attributed to insect and disease or unknown change; the workflow starts by masking the TTTS imagery for a target year the models queries pixels that are experiencing a decline with time. This excludes pixels that are stable or have a positive trajectory with time which implies stability or groopular clustering algorithm that is used to segment images into different clusters based on their spectral characteristics [reference]. KMeans is an iterative clustering algorithm that partitions data into K distinct clusters by minimizing the sum of squared distances between data points and their assigned cluster centroids. The SNIC image is passed to KMeans which effectively links SNIC patches that are spectrally similar but spatially separate. These similar SNIC patches are linked under 30 KMean cluster IDs. If insects and disease are detected in the dataspace its signature would be captured under one or more of these cluster IDs.

**Intersection and Prediction:**

The model uses ADS polygons to find the proportion of KMeans Cluster IDs that intersect them. This proportion gives insight into what cluster IDs are more or less associated with ADS polygons. Cluster IDs more associated with ADS polygons should be more correlated to insects and disease then cluster IDs that have a low intersection with ADS polygons. The proportion is grouped into three categories: 1, 2 and 3, with 3 pertaining to the KMeans Cluster IDs with the highest intersection with ADS and group 1 with the lowest. These groups are then randomly sampled from 5000 locations with spectral and temporal values, and then become the training data for the final 500 tree Random Forest model. This model is trained on 70 percent of the sample for training and the remaining 30% of the sample is used for model accuracy. The Random Forest is then applied to the SNIC imagery returning the locations of model defined likelihood of insects and disease.

**Validation: **

Bugnet is being validated by trained human image interpreters. These interpreters are trained in using a computer program called Time Sync Plus (TP+) to validate the Bugnet dataset. TP+ is an attribution tool that allows a user to label vector data based on information from remotely sensed imagery. This spectral temporal data provides context of land dynamics at polygon locations. It is this context that a user uses to put labels on the vector data. TS+ displays both high and medium spatial resolution imagery from several years to guide attribution. The medium resolution imagery is from Landsat; a NASA lineage of satellites. The high resolution NAIP (National Agriculture Image Project) imagery; is a USDA production of aircraft gathered imagery. Both bring their own perspective to the state of the landscape, but that is not all of the data provided to the user. There is also a chart that contains the color intensity at the vector location over time. 



<p id="gdcalert15" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image15.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert16">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image15.png "image_tooltip")


(The image above shows the Time Sync Plus interface. The top panel shows the temporal trajectory of Landsat pixels in the red or white polygon. The middle panel is NAIP imagery of the target year, giving a high resolution perspective of the landscape. The bottom panel is yearly Landsat imagery such provides a view of texture with time. )

**Validation Sample design** 

The validation sample is a stratified random sample of 8 classes. Each of these classes represent portions of the dataspace which include the location flagged by each variation of Bugnet, ADS, and growthing and stable forest. By sampling and validating each of these striatum we will be able to understand how the models perform.  

We would expect there to be error as no small scale moderate resolution geospatial model is perfect. However, where the validation finds errors is also important. The more true positives the validation find for insect and disease in regions sampled for “healthy forests” Bugnet’s robustness   

The sample was drawn from regions of each class that cove  </td>
   <td>Bugnet in ADS region of forest high likelihood
   </td>
  </tr>
</table>


Results 

High Magnitude Random forest model



<p id="gdcalert16" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image16.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert17">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image16.png "image_tooltip")


Bugnet Results 

Acknowledgment

Method Options 1, 2 and 3

There are 3 options used in this study to locate insect and disease damage in Washington and Oregon forests. All of the options have the same goal but with slightly different ways of generating the locations of insect and disease. Option 1, the simplest of the 3 options, uses simple thresholding to define the sample area which is later used to train a Random Forest Classifier. Option2 uses Simple Non-iterative Clustering (SNIC) and K Means to group areas of insect and disease into labels of likelihood. Option 3 is the same as option 2 but it does not use SNIC in its process. All of the options use ADS polygons to guide their sampling. Observing the sensitivity of each option is the key reason for the number of options and variations, and to evaluate if the SNIC method proved to be better than a pixel based approach.  

 

References 

Silva, CD Rullan, et al. "Remote monitoring of forest insect defoliation. A review." Forest Systems 22.3 (2013): 377-391.

Kennedy, R. E., Ohmann, J., Gregory, M., Roberts, H., Yang, Z., Bell, D. M., . . . Seidl, R. (2018). An empirical, integrated forest biomass monitoring system. Environmental Research Letters, 13(2).

Achanta, R., & Susstrunk, S. (2017). Superpixels and polygons using simple non-iterative clustering. In Proceedings of the IEEE conference on computer vision and pattern recognition (pp. 4651-4660).

Kennedy, R. E., Yang, Z., & Cohen, W. B. (2010). Detecting trends in forest disturbance and recovery using yearly Landsat time series: 1. LandTrendr—Temporal segmentation algorithms. Remote Sensing of Environment, 114(12), 2897-2910.

Cohen, W. B., Yang, Z., Healey, S. P., Kennedy, R. E., & Gorelick, N. (2018). A LandTrendr multispectral ensemble for forest disturbance detection. Remote sensing of environment, 205, 131-140.

Barrett, Tara M.; Robertson, Guy C., eds. 2021. Disturbance and sustainability in forests of the Western United States. Gen. Tech. Rep. PNW-GTR-992. Portland, OR: U.S. Department of Agriculture, Forest Service, Pacific Northwest Research Station. 231 p.

Coleman, T. W., Graves, A. D., Heath, Z., Flowers, R. W., Hanavan, R. P., Cluck, D. R., & Ryerson, D. (2018). Accuracy of aerial detection surveys for mapping insect and disease disturbances in the United States. Forest ecology and management, 430, 321-336.


