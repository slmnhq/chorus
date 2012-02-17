chorus.models.ChorusView = chorus.models.Dataset.extend({
    declareValidations: function(newAttrs) {
        this.require('objectName', newAttrs);
    }
});
