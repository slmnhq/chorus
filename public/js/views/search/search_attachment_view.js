chorus.views.SearchAttachment = chorus.views.SearchItemBase.extend({
    constructorName: "SearchAttachment",
    templateName: "search_attachment",
    eventType: "attachment",

    additionalContext: function() {
        var workspaceLink = this.model.workspace() && this.model.workspace().get('id') && this.model.workspace().showLink();
        var tabularDataLink = this.model.tabularData() && this.model.tabularData().showLink();
        var workfileLink = this.model.workfile() && this.model.workfile().showLink();
        var hdfsFileLink = this.model.hdfsFile() && this.model.hdfsFile().showLink();
        var instanceLink = this.model.instance() && this.model.instance().showLink();

        var composedLinkString = "";
        if (workspaceLink && tabularDataLink) {
            composedLinkString = t("attachment.found_in.tabular_data_in_workspace",
                { workspaceLink: workspaceLink, tabularDataLink: tabularDataLink })
        } else if (tabularDataLink) {
            composedLinkString = t("attachment.found_in.tabular_data_not_in_workspace",
                { tabularDataLink: tabularDataLink })
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
            iconUrl: this.model.isImage() ? this.model.thumbnailUrl() : this.model.iconUrl(),
            composedLinkString: new Handlebars.SafeString(composedLinkString)
        }
    }
});
