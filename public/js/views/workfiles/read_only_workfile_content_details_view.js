chorus.views.ReadOnlyWorkfileContentDetails = chorus.views.Base.extend({
    className: "read_only_workfile_content_details",
    additionalClass: "workfile_content_details",

    additionalContext: function() {
        return {
            downloadUrl: this.model.downloadUrl()
        };
    }
});


