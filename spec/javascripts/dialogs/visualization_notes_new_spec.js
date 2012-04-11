describe("chorus.dialogs.VisualizationNotesNew", function() {
    describe("when in workspace context ( in Data tab )", function() {
        beforeEach(function() {
            stubDelay();
            spyOn(chorus.dialogs.NotesNew.prototype, "modelSaved").andCallThrough();

            this.dialog = new chorus.dialogs.VisualizationNotesNew({
                entityId: "1",
                entityName: "my dataset",
                workspaceId: "22",
                entityType: "databaseObject",
                allowWorkspaceAttachments: "true",
                pageModel: newFixtures.datasetSandboxTable(),
                attachVisualization: {
                    fileName: "hello-frequency.png",
                    svgData: "<svg/>"
                }
            });
            $('#jasmine_content').append(this.dialog.el);
            this.dialog.render();
        });

        describe("#setup", function() {
            it("creates the correct model", function() {
                expect(this.dialog.model).toBeA(chorus.models.Comment);
            });

            it("sets the correct properties on the model", function() {
                expect(this.dialog.model.get("entityId")).toBe("1")
                expect(this.dialog.model.get("entityType")).toBe("databaseObject");
            });
        });

        it("sub-classes NoteNewDialog", function() {
            expect(this.dialog).toBeA(chorus.dialogs.NotesNew);
        });

        describe("#render", function() {
            it("has the right placeholder", function() {
                expect(this.dialog.$("textarea[name=body]").attr("placeholder")).toBe(t("notes.placeholder", {noteSubject: "databaseObject"}));
            });

            it("display the chart image and chart fileName", function() {
                expect(this.dialog.$(".options_area")).not.toHaveClass("hidden");
                expect(this.dialog.$(".options_area .row.file_details.visualization .name")).toHaveText("hello-frequency.png");
                expect(this.dialog.$(".icon").attr("src")).toBe("images/workfiles/medium/img.png");
                expect(this.dialog.$("a.remove")).toHaveClass("hidden");
            });
        });

        describe("#save", function() {
            beforeEach(function() {
                this.dialog.$("textarea[name=body]").val("The body of a note");
                this.dialog.$("form").trigger("submit");
                this.server.completeSaveFor(this.dialog.model, _.extend({id: 2}, this.dialog.model.attributes));
            });

            it("calls super#modelSaved", function() {
                expect(chorus.dialogs.NotesNew.prototype.modelSaved).toHaveBeenCalled();
            });

            it("saves the visualization chart as an attachment to the note", function() {
                expect(this.server.lastCreate().url).toEqual("/edc/comment/databaseObject/1/2/file")
                expect(this.server.lastCreate().params()).toEqual({ fileName : 'hello-frequency.png', svgData : '<svg/>' });
            });

            describe("after the v11n attachment has been saved", function() {
                beforeEach(function() {
                    spyOn(chorus, "toast");
                    this.server.lastCreate().succeed();
                });

                it("refreshes the dataset's activity stream after the v11n attachment has been saved", function() {
                    this.server.lastCreate().succeed();
                    expect(this.dialog.pageModel.activities()).toHaveBeenFetched();
                });

                it("pops toast", function() {
                    expect(chorus.toast).toHaveBeenCalledWith("dataset.visualization.toast.note_from_chart", {
                        datasetName: 'my dataset'
                    });
                });
            });

        });
    });
});
