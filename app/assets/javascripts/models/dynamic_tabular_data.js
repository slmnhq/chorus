chorus.models.DynamicTabularData = function(attributes) {
    if (attributes && attributes.datasetType == "CHORUS_VIEW") {
        return new chorus.models.WorkspaceDataset(attributes);
    } else {
        return new chorus.models.Dataset(attributes);
    }
};