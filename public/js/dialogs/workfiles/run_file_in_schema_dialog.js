chorus.dialogs.RunFileInSchema = chorus.dialogs.Base.extend({
    className:"run_file_in_schema",
    title:t("workfile.run_in_schema.title"),

    persistent:true,

    events:{
        "click button.submit":"onClickSubmit",
        "click input#sandbox_schema":"sandboxSchemaSelected",
        "click input#another_schema":"anotherSchemaSelected"
    },

    subviews:{
        ".schema_picker":"schemaPicker"
    },

    setup:function () {
        this.workspace = this.model.workspace();
        this.bindings.add(this.workspace, "loaded", this.workspaceLoaded);
        this.workspace.fetchIfNotLoaded();

        this.schemaPicker = new chorus.views.SchemaPicker();
        this.schemaPicker.bind("change", this.onSchemaPickerChange, this);

        this.bindings.add(this.schemaPicker, "error", this.showErrors);
        this.bindings.add(this.schemaPicker, "clearErrors", this.clearErrors);
    },

    additionalContext : function(ctx) {
        return {
            hasSandbox : this.workspace.sandbox() && !!this.workspace.sandbox()
        }
    },

    workspaceLoaded:function () {
        if (this.workspace.sandbox()) {
            this.$(".name").text(this.workspace.sandbox().schema().canonicalName());
            this.$("input#sandbox_schema").prop("disabled", false);
            this.$("label[for='sandbox_schema']").removeClass('disabled');
        }
    },

    postRender:function () {
        this.$(".loading").startLoading();
    },

    onSchemaPickerChange:function () {
        this.$("button.submit").prop("disabled", !this.schemaPicker.ready());
    },

    onClickSubmit:function () {
        var options = {};
        if (this.$("#sandbox_schema").is(":checked")) {
            options = {
                instance:this.workspace.sandbox().get("instanceId"),
                database:this.workspace.sandbox().get("databaseId"),
                schema:this.workspace.sandbox().get("schemaId")
            };
        } else {
            options = this.schemaPicker.fieldValues();
        }

        chorus.PageEvents.broadcast("file:runInSchema", options);
        this.closeModal();
    },

    sandboxSchemaSelected:function () {
        this.$(".another_schema").addClass("collapsed");
        this.$("button.submit").prop("disabled", false);
        this.clearErrors();
    },

    anotherSchemaSelected:function () {
        this.$(".another_schema").removeClass("collapsed");
        this.onSchemaPickerChange();
    }
});
