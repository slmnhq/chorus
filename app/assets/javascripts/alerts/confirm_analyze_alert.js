chorus.alerts.Analyze = chorus.alerts.Base.extend({
    constructorName: "Analyze",
    text: t("analyze.alert.text"),
    ok: t("analyze.alert.ok"),

    setup: function() {
        this.title = t("analyze.alert.title", {name: this.model.name()});
    },

    confirmAlert: function() {
        this.$("button.submit").startLoading("analyze.alert.loading");
        this.bindings.add(this.model.analyze(), "fetchFailed", this.fetchFailed);
        this.bindings.add(this.model.analyze(), "loaded", this.fetchCompleted);
        this.model.analyze().fetch();
    },

    fetchFailed: function() {
        this.$("button.submit").stopLoading();
        this.showErrors(this.model.analyze());
    },

    fetchCompleted: function() {
        chorus.PageEvents.broadcast("analyze:running");
        chorus.toast("analyze.alert.toast", {name: this.model.name()});
        this.closeModal();
    }
});