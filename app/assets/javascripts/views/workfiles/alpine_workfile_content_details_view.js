chorus.views.AlpineWorkfileContentDetails = chorus.views.WorkfileContentDetails.extend({
    templateName:"alpine_workfile_content_details",

    additionalContext: function() {
        host = window.location.host;
        workfileId = this.model.id;
        versionFilePath = this.model.get('versionInfo').versionFilePath;

        return {
            alpineUrl: "/AlpineIlluminator/alpine/result/runflow.jsp?" + 
                "flowFilePath=" + versionFilePath +
                "actions[create_workfile_insight]=" +
                encodeURIComponent('http://' + host + '/edc/comment/workfile/'+ workfileId + '?isInsight=true')
        }
    }
});
