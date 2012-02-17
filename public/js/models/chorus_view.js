chorus.models.ChorusView = chorus.models.Dataset.extend({
    declareValidations: function(newAttrs) {
        this.require('objectName', newAttrs, "dataset.chorusview.validation.object_name_required");
        this.requirePattern("objectName", /^[a-zA-Z][a-zA-Z0-9_]*/, newAttrs, "dataset.chorusview.validation.object_name_pattern");
    }
});
