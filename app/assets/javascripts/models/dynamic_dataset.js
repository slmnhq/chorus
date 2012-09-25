chorus.models.DynamicDataset = function(attributes) {
    if (attributes && attributes.workspace) {
        return new chorus.models.WorkspaceDataset(attributes);
    } else {
        return new chorus.models.Dataset(attributes);
    }
};