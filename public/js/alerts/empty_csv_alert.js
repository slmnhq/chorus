chorus.alerts.EmptyCSV = chorus.alerts.Base.extend({
    text:t("empty_csv.text"),
    title:t("empty_csv.title"),
    additionalClass:"error",

    postRender:function () {
        this.$("button.submit").addClass("hidden");
    }
});