chorus.dialogs.VisualizationNotesNew = chorus.dialogs.NotesNew.extend({
    title:t("notes.new_dialog.title"),
    submitButton: t("notes.button.create"),

    makeModel:function () {
        this.model = new chorus.models.Comment({
            entityType:this.options.launchElement.data("entity-type"),
            entityId:this.options.launchElement.data("entity-id"),
            workspaceId: this.options.launchElement.data("workspace-id")
        });
        var subject = this.options.launchElement.data("displayEntityType") || this.model.get("entityType");

        this.placeholder = t("notes.placeholder", {noteSubject: subject});
        this._super("makeModel", arguments);
    },

    postRender: function() {
        this._super("postRender", arguments);

        this.showOptions();
        this.showVisualizationData();
    },

    showVisualizationData: function() {
        var $row = $(Handlebars.helpers.renderTemplate("notes_new_file_attachment").toString());
        this.$(".options_area").append($row);

        var visualization = this.options.attachVisualization;

        var iconSrc = "images/workfiles/medium/img.png"
        $row.find('img.icon').attr('src', iconSrc);
        $row.find('span.name').text(visualization.fileName).attr('title', visualization.fileName);
        $row.data("visualization", visualization);
        $row.find("a.remove").addClass("hidden");
        $row.removeClass("hidden");
        $row.addClass("visualization file_details");
    },

    modelSaved: function() {
        var note = this.model;
        var svgFile = new chorus.models.Base(this.options.attachVisualization);
        svgFile.url = function() {
             // weirdly, the note knows how to generate urls for its attachments;
            return note.url({isFile: true});
        };
        svgFile.bind("saved", this.svgSaved, this);
        svgFile.save();

        this._super("modelSaved");
    },

    svgSaved: function() {
        this.pageModel.activities().fetch();
        chorus.toast("dataset.visualization.toast.note_from_chart", {datasetName: this.options.launchElement.data("entity-name") });
    }
});