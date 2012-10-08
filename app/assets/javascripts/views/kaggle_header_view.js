chorus.views.KaggleHeader = chorus.views.Base.extend({
    constructorName: "KaggleHeaderView",
    templateName: "kaggle_header",

    additionalContext: function() {
        return {
            title: t("kaggle.summary")
        }
    }
});