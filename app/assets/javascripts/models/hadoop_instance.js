chorus.models.HadoopInstance = chorus.models.Instance.extend({
    constructorName: "HadoopInstance",
    urlTemplate: "hadoop_instances/{{id}}",
    showUrlTemplate: "hadoop_instances/{{id}}/browse/",
    shared: true,

    dataBinding: 'data-hadoop-instance-id',

    providerIconUrl: function() {
        return this._imagePrefix + "hadoop_instance.png";
    },

    initialize: function() {
        this._super("initialize", arguments);
        this.set({shared: true});
    },

    isGreenplum: function() {
        return false;
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

    entriesForPath: function(path) {
        return new chorus.collections.HdfsEntrySet([], {
            path: path,
            hadoopInstance: {
                id: this.get("id")
            }
        });
    },

    accountForCurrentUser: function() {
        return null;
    },

    accounts: function() {
        return [];
    },

    usage: function() {
        return false;
    }

});
