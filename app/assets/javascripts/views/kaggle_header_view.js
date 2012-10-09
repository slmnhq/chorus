chorus.views.KaggleHeader = chorus.views.Base.extend({
    constructorName: "KaggleHeaderView",
    templateName: "kaggle_header",

    additionalContext: function() {
        return {
            summary: t("kaggle.summary"),
            listed_below: t("kaggle.listed_below")
        }
    }
});