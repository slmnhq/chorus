(function() {
    var imagePrefix = "/images/instances/";

    var stateIconMap = {
        "online": "green.png",
        "offline": "unknown.png"
    };

    var providerIconMap = {
        "Greenplum Database": "greenplum_instance.png",
        "Hadoop": "hadoop_instance.png"
    };

    chorus.models.HadoopInstance = chorus.models.Base.extend({
        constructorName: "HadoopInstance",
        urlTemplate: "hadoop_instances/{{id}}",
        showUrlTemplate: "hadoop_instances/{{id}}/browse/",
        shared: true,

        entityType: 'instance',

        dataBinding: 'data-hadoop-instance-id',

        providerIconUrl: function() {
            return "/images/instances/hadoop_instance.png";
        },

        isProvisioning: function() {
            return this.get("state") == "provisioning";
        },

        isFault: function() {
            return this.get("state") == "offline";
        },

        isOnline: function() {
            return this.get("state") == "online";
        },

        stateText: function() {
            return t("instances.state." + (this.get("state") || "unknown"));
        },

        version: function() {
            return this.get("instanceVersion");
        },

        initialize: function() {
            this._super("initialize", arguments);
            this.set({shared: true});
        },

        stateIconUrl: function() {
            var filename = stateIconMap[this.get("state")] || "unknown.png";
            return imagePrefix + filename;
        },

        isGreenplum: function() {
            return this.get('instanceProvider') == 'Greenplum Database'
        },

        isHadoop: function() {
            return this.get("instanceProvider") == "Hadoop";
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
        }
    });
})();

