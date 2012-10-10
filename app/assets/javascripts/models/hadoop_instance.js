chorus.models.HadoopInstance = chorus.models.Instance.extend({
    constructorName: "HadoopInstance",
    urlTemplate: "hadoop_instances/{{id}}",
    showUrlTemplate: "hadoop_instances/{{id}}/browse/",
    shared: true,
    entityType: "hadoop_instance",

    isShared: function() {
        return true;
    },

    providerIconUrl: function() {
        return this._imagePrefix + "hadoop_instance.png";
    },

    isHadoop: function() {
        return true;
    },

    declareValidations: function(newAttrs) {
        this.require("name", newAttrs);
        this.requirePattern("name", chorus.ValidationRegexes.ChorusIdentifier(), newAttrs, "instance.validation.name_pattern");
        this.requirePattern("name", chorus.ValidationRegexes.ChorusIdentifier(44), newAttrs);
        this.require("host", newAttrs);
        this.require("port", newAttrs);
        this.require("username", newAttrs);
        this.require("groupList", newAttrs);
        this.requirePattern("port", chorus.ValidationRegexes.OnlyDigits(), newAttrs);
    },

    sharedAccountDetails: function() {
        return this.get("username") + ", " + this.get("groupList");
    }

});
