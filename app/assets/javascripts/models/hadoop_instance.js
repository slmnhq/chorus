chorus.models.HadoopInstance = chorus.models.Instance.extend({
    constructorName: "HadoopInstance",
    urlTemplate: "hadoop_instances/{{id}}",
    showUrlTemplate: "hadoop_instances/{{id}}/browse/",

    providerIconUrl: function() {
        return "/images/instances/hadoop_instance.png";
    },

    declareValidations: function(newAttrs) {
        this.require("name", newAttrs);
        this.requirePattern("name", chorus.ValidationRegexes.ChorusIdentifier(), newAttrs, "instance.validation.name_pattern");
        this.requirePattern("name", chorus.ValidationRegexes.ChorusIdentifier(44), newAttrs);
        this.require("host", newAttrs);
        this.require("port", newAttrs);
        this.require("username", newAttrs);
        this.require("group_list", newAttrs);
        this.requirePattern("port", chorus.ValidationRegexes.OnlyDigits(), newAttrs);
    },

    entriesForPath: function(path) {
        return new chorus.collections.HdfsEntrySet([], {
            path: path,
            hadoopInstance: {
                id: this.get("id")
            }
        });
    }
});
