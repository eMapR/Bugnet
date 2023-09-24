param=dict(
	path=r"E:\bugnet\workspace", # path to your project directory
    change_type = ['disturbance'],                  # What change do you want to map (disturbance or growth)?
    minMags = [100],                                # What is the desired minimum change magnitude:
    collapseEm = [0],                               # Consecutive change segment collapse threshold (0 to ignore)
    dsnrs = ['no'],                                 # minimum change magnitude unit DSNR? (yes or no)
    mmu = [9],                                      # the minumum grouping of pixels to form polygons
    connectednesses = ['yes']                       # Should diagonal adjacency warrant pixel inclusion in patches
    )
