;
(function(ns) {
    var stateToPng = {
        "online" : "green.png",
        "fault" : "red.png"
    };

    var providerToPng = {
        "Greenplum Database" : "greenplum_instance.png",
        "Hadoop" : "hadoop_instance.png"
    };

    ns.views.Instance = chorus.views.Base.extend({
        className : "instance",

        additionalContext: function() {
            var imagePrefix = "/images/instances/";
            return {
                stateUrl : imagePrefix + (stateToPng[this.model.get("state")] || "unknown.png"),
                providerUrl : imagePrefix + (providerToPng[this.model.get("instanceProvider")] || "other_instance.png")
            }
        }
    });
})
    (chorus);