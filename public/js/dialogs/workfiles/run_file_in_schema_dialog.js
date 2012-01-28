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
        this.workspace.bind("loaded", this.workspaceLoaded, this);
        this.workspace.fetch();

        this.schemaPicker = new chorus.views.SchemaPicker();
        this.schemaPicker.bind("change", this.onSchemaPickerChange, this);
    },

    workspaceLoaded:function () {
        this.$(".name").text(this.workspace.sandbox().schema().canonicalName());
    },

    postRender:function () {
        this.$(".loading").startLoading();
    },

    onSchemaPickerChange:function () {
        this.$("button.submit").attr("disabled", !this.schemaPicker.ready());
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

        this.trigger("run", options);
        this.closeModal();
    },

    sandboxSchemaSelected:function () {
        this.$(".another_schema").addClass("collapsed");
        this.$("button.submit").attr("disabled", false);
    },

    anotherSchemaSelected:function () {
        this.$(".another_schema").removeClass("collapsed");
        this.onSchemaPickerChange();
    }
});