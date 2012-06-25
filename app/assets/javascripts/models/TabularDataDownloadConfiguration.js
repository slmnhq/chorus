chorus.models.DatasetDownloadConfiguration = chorus.models.Base.extend({
    constructorName: "DatasetDownloadConfiguration",

    declareValidations: function(newAttrs) {
        this.requirePositiveInteger("numOfRows", newAttrs, 'import.validation.sampleCount.positive');
    }
});
