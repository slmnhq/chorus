chorus.views.BinaryWorkfileContentDetails = chorus.views.Base.extend({
    className: "binary_workfile_content_details",
    additionalClass: "workfile_content_details",

    additionalContext: function() {
        return {
            downloadUrl: this.model.downloadUrl()
        };
    }
});


