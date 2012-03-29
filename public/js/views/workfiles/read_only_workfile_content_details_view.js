chorus.views.ReadOnlyWorkfileContentDetails = chorus.views.Base.extend({
    className: "read_only_workfile_content_details",
    additionalClass: "workfile_content_details",

    additionalContext: function() {
        return {
            explanationText: this.explanationText,
            downloadUrl: this.model.downloadUrl()
        };
    }
});

chorus.views.BinaryWorkfileContentDetails = chorus.views.ReadOnlyWorkfileContentDetails.extend({
    explanationText: t("workfile.not_previewable")
});

chorus.views.ArchivedWorkfileContentDetails = chorus.views.ReadOnlyWorkfileContentDetails.extend({
    explanationText: t("workfile.workspace_archived")
});
