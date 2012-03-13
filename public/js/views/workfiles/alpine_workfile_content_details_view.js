chorus.views.AlpineWorkfileContentDetails = chorus.views.WorkfileContentDetails.extend({
    className:"alpine_workfile_content_details",

    additionalContext: function() {
        return {
            diskPath: this.model.diskPath()
        }
    }
});