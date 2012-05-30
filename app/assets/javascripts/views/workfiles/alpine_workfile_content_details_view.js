chorus.views.AlpineWorkfileContentDetails = chorus.views.WorkfileContentDetails.extend({
    templateName:"alpine_workfile_content_details",

    additionalContext: function() {
    return  { alpineUrl: this.createAlpineUrl() }
    },

    createAlpineUrl: function() {
        host = window.location.host;
        workfileId = this.model.id;
        versionFilePath = this.model.get('versionInfo').versionFilePath;

        
        alpineUrl = URI("/AlpineIlluminator/alpine/result/runflow.jsp")
            .addQuery("flowFilePath", versionFilePath);
        alpineUrl.addQuery("actions[create_workfile_insight]",
                'http://' + host + '/edc/comment/workfile/'+ workfileId + '?isInsight=true');
        return alpineUrl.toString();
    }
});
