chorus.views.AlpineWorkfileContent = chorus.views.WorkfileContent.extend({
    templateName:"alpine_workfile_content",
    useLoadingSection: true,

    setup: function() {
        this.alpineFlowImage = new chorus.models.AlpineFlowImage({workfileDiskPath: this.model.get("versionInfo").versionFilePath});

        this.requiredResources.push(this.alpineFlowImage);
        this.alpineFlowImage.fetch();
        this.bindings.add(this.alpineFlowImage, "change", this.render);
    },

    additionalContext: function () {
        return this.alpineFlowImage.attributes;
    }
});