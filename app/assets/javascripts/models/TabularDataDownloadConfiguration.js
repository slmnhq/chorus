chorus.models.TabularDataDownloadConfiguration = chorus.models.Base.extend({
    constructorName: "TabularDataDownloadConfiguration",

    declareValidations: function(newAttrs) {
        this.requirePositiveInteger("numOfRows", newAttrs, 'import.validation.sampleCount.positive');
    }
});
