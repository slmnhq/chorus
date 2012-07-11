chorus.alerts.FunctionInfo = chorus.alerts.Base.extend({
    constructorName: "FunctionInfo",

    cancel: t("actions.close_window"),
    additionalClass: "info function_info",

    makeModel: function(options) {
        this.model = options.launchElement.data("model");
    },

    preRender: function() {
        this.text = this.textContent();
        this.body = this.bodyContent();
    },

    postRender: function() {
        this.$("button.submit").addClass("hidden");
    },

    bodyContent: function() {
        return chorus.helpers.renderTemplate("function_info_body", {
            definition: this.model.get("definition"),
            description: this.model.get("description")
        });
    },

    textContent: function() {
        return chorus.helpers.renderTemplate("function_info_text", {
            returnType: this.model.get('returnType'),
            name: this.model.get("name"),
            arguments: this.model.formattedArgumentList()
        });
    }
});
