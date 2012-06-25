chorus.views.SearchAttachment = chorus.views.SearchItemBase.extend({
    constructorName: "SearchAttachment",
    templateName: "search_attachment",
    eventType: "attachment",

    additionalContext: function() {
        var workspaceLink = this.model.workspace() && this.model.workspace().get('id') && this.model.workspace().showLink();
        var datasetLink = this.model.dataset() && this.model.dataset().showLink();
        var workfileLink = this.model.workfile() && this.model.workfile().showLink();
        var hdfsFileLink = this.model.hdfsFile() && this.model.hdfsFile().showLink();
        var instanceLink = this.model.instance() && this.model.instance().showLink();

        var composedLinkString = "";
        if (workspaceLink && datasetLink) {
            composedLinkString = t("attachment.found_in.dataset_in_workspace",
                { workspaceLink: workspaceLink, datasetLink: datasetLink })
        } else if (datasetLink) {
            composedLinkString = t("attachment.found_in.dataset_not_in_workspace",
                { datasetLink: datasetLink })
        } else if (workspaceLink && workfileLink) {
            composedLinkString = t("attachment.found_in.workfile_in_workspace",
                { workfileLink: workfileLink, workspaceLink: workspaceLink })
        } else if (hdfsFileLink) {
            composedLinkString = t("attachment.found_in.file_in_hdfs",
                { hdfsFileLink: hdfsFileLink })
        } else if (workspaceLink) {
            composedLinkString = t("attachment.found_in.workspace",
                { workspaceLink: workspaceLink })
        } else if (instanceLink) {
            composedLinkString = t("attachment.found_in.instance",
                { instanceLink: instanceLink })
        }


        return {
            downloadUrl: this.model.downloadUrl(),
            iconUrl: this.model.iconUrl(),
            composedLinkString: new Handlebars.SafeString(composedLinkString)
        }
    }
});
