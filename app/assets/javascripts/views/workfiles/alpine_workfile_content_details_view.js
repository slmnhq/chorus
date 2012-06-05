chorus.views.AlpineWorkfileContentDetails = chorus.views.WorkfileContentDetails.extend({
    templateName:"alpine_workfile_content_details",

    additionalContext: function() {
    return  { alpineUrl: this.createAlpineUrl() }
    },

    createAlpineUrl: function() {
        var versionFilePath = this.model.get('versionInfo').versionFilePath;
        var newInsight = new chorus.models.Insight({entityType: "workfile", entityId: this.model.id});
        var createInsightUrl = 'http://' + window.location.host + newInsight.url();

        var alpineUrl = URI("/AlpineIlluminator/alpine/result/runflow.jsp")
            .addQuery("flowFilePath", versionFilePath)
            .addQuery("actions[create_workfile_insight]", createInsightUrl);
        return alpineUrl.toString();
    }
});
