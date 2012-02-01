chorus.dialogs.Visualization = chorus.dialogs.Base.extend({
    className : "visualization",

    setup : function() {
        this.title = t("visualization.title", {name: this.options.launchElement.data("name")});
    }
});