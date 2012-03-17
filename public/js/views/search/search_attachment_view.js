chorus.views.SearchAttachment = chorus.views.SearchItemBase.extend({
    constructorName: "SearchAttachment",
    className: "search_attachment",
    eventType: "attachment",

    additionalContext: function () {
        return {
            downloadUrl: this.model.downloadUrl(),
            iconUrl: this.model.iconUrl()
        }
    }
});
