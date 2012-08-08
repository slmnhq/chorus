chorus.models.DatasetDownloadConfiguration = chorus.models.Base.extend({
    constructorName: "DatasetDownloadConfiguration",

    declareValidations: function(newAttrs) {
        this.requirePositiveInteger("rowLimit", newAttrs, 'import.validation.sampleCount.positive');
    }
});
