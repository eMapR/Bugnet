
<p align="center">
	<img src="https://docs.google.com/drawings/d/e/2PACX-1vTucBF8oxa3oNVLYTc3UMNwEtstfQM4iyQaBzAohjG6Q2RonlcCKU2aYnUMOPdz750YrBZZwIkX1iox/pub?w=574&amp;h=557" width="50%" height="50%">
</p>

Mapping events on the landscape at small map scales has increasingly become the job of remote sensing. Land management practices have largely been the driving force for such development, and many of these developments have honed in on specific themes. The US Forest Service has a special interest in insects and disease that damage and/or kill trees. This interest has prompted the Forest Service to create the Forest Health Program to monitor these events. On a yearly basis the Aerial Detection Survey (ADS) of the Forest Service are the ones who report the physical observation of insects and disease in the forest, and have increasingly been looking to remote sensing to facilitate their survey. Therefore in concert with Washington State DNR and US Forest Service, the Oregon State University eMapR Lab has been developing Bugnet. Bugnet is a collection of models that outline the locations of insects and disease on the landscape. These models incorporate Landsat imagery, LandTrendr, ADS observations, and other various forms of image processing, and machine learning to complete its task.

Bugnet highlights insects and disease (I&D),and it does so by removing all pixels from the dataspace that are not relevant to the objective and it then evaluates the pixels that remain. These pixels should represent stable and growing forest along with declining regions of forest not associated with forest husbandry or fire, ie, unknown change. The image is further honed using SNIC(simple non-iterative clustering) to remove noise, and simplify the landscape by patchifying pixels that are spectrally similar. This also allows Bugnet to remove stable and growing patches of forests more easily, leaving only regions of forests experiencing unknown change. These patches of declining forest harbor I & D amongst other changes. Then Bugnet splits the spectral dataspace of the declining patches with KMeans. KMeans links SNIC patches that are spectrally similar but spatially separate based on their spectral quality. This effectively groups SNIC patches under KMeans cluster IDs, and I & D detected by Bugnet are grouped under one or more of these cluster IDs, but Bugnet does not know what cluster IDs contain I&D. Using ADS polygon as a means of intersection with KMeans clusters gives us the proportion of ADS polygons that intersect the cluster IDs. Clusters with high proportionality get a label and clusters with low proportionality get a different label. These locations and labels become the bases for sampling and training of an image classifier that predicts the location of I&D in the SNIC imagery.

[Bugnet Report](https://docs.google.com/document/d/e/2PACX-1vTlHyKwfpUdtagEcIl9Dw-EtQ-pI-T2IwbbdZY1Of7HUYS1G4TF_aYkbw496qll-ptPe7FbdS7dX9XL/pub?embedded=true)

[Bugnet Workflow](https://docs.google.com/document/d/e/2PACX-1vS-IXSPd1xrPeAYnkYBdvXjhSiX-6y2igCLKw8MygN78ohwsNQIAhm-0ioZVQPF5zKZYHgAmmNeogDg/pub)
