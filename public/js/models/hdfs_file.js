chorus.models.HdfsFile = chorus.models.Base.extend({
    constructorName: "HdfsFile",

    urlTemplate: function() {
        return "data/{{instanceId}}/hdfs/{{path}}/sample";
    }
})