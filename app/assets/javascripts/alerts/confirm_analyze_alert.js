chorus.alerts.Analyze = chorus.alerts.Base.extend({
    constructorName: "Analyze",
    text: t("analyze.alert.text"),
    ok: t("analyze.alert.ok"),

    setup: function() {
        this.title = t("analyze.alert.title", {name: this.model.name()});
    },

    confirmAlert: function() {
        this.$("button.submit").startLoading("analyze.alert.loading");
        this.bindings.add(this.model.analyze(), "saveFailed", this.saveFailed);
        this.bindings.add(this.model.analyze(), "saved", this.saved);
        this.model.analyze().save();
    },

    saveFailed: function() {
        this.$("button.submit").stopLoading();
        this.showErrors(this.model.analyze());
    },

    saved: function() {
        chorus.PageEvents.broadcast("analyze:running");
        chorus.toast("analyze.alert.toast", {name: this.model.name()});
        this.closeModal();
    }
});