describe("WorkfilesAttach", function() {
    beforeEach(function() {
        spyOn(chorus.collections.WorkfileSet.prototype, 'fetchAll');
        this.workfiles = fixtures.workfileSet();
        this.dialog = new chorus.dialogs.WorkfilesAttach({ workspaceId : "33" });
        this.dialog.collection = this.workfiles;
    });

    describe("#setup", function() {
        it("fetches all workfiles for the specified workspace", function() {
            expect(this.dialog.collection.fetchAll).toHaveBeenCalled();
        });
    });

    context("when selectedFiles have been passed", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.WorkfilesAttach({ workspaceId : '33', selectedFiles: this.workfiles});
            this.dialog.collection = this.workfiles;
            this.dialog.render();
        });

        it("renders them as selected", function() {
            expect(this.dialog.$("li").eq(0)).toHaveClass("selected");
            expect(this.dialog.$("li").eq(1)).toHaveClass("selected");
        });
    })

    describe("render", function() {
        beforeEach(function() {
            this.dialog.render();
        });

        it("renders an item for each workfile", function() {
            expect(this.dialog.$("li").length).toBe(this.workfiles.models.length);
        })

        it("sorts workfiles by last modified date", function() {
            expect(this.dialog.$("li:eq(0)")).toHaveAttr("data-id", this.workfiles.models[0].get('id'));
        })

        it("includes an image for workfiles", function() {
            var images = this.dialog.$(".collection_list img");
            expect(images.length).toBe(this.workfiles.length);
            expect(images.eq(0)).toHaveAttr("src", chorus.urlHelpers.fileIconUrl(this.workfiles.models[0].get("fileType"), 'medium'));
        });

        it("includes a name for workfiles", function() {
            var names = this.dialog.$('.name');
            expect(names.length).toBe(this.workfiles.length);
            expect(names.eq(0).text().trim()).toBe(this.workfiles.models[0].get("fileName"));
        })

        it("has a close window button that cancels the dialog", function() {
            expect(this.dialog.$("button.cancel").length).toBe(1);
        });

        it("has the 'Attach File' button disabled by default", function() {
            expect(this.dialog.$('button.submit')).toBeDisabled();
        });
    });

    describe("selecting files", function() {
        beforeEach(function() {
            this.dialog.render();
            this.dialog.$("li a").eq(0).click();
            this.dialog.$("li a").eq(1).click();
        });

        it("add class selected", function() {
            expect(this.dialog.$("li").eq(0)).toHaveClass("selected");
            expect(this.dialog.$("li").eq(1)).toHaveClass("selected");
        });

        it("enables the submit button", function() {
            expect(this.dialog.$('button.submit')).not.toBeDisabled();
        });

        context("clicking a previously selected workfile", function() {
            beforeEach(function() {
                this.dialog.$("li a").eq(0).click();
            });

            it("removes class selected when user click previously selected workfile", function() {
                expect(this.dialog.$("li").eq(0)).not.toHaveClass("selected");
            });

            it("disable the submit button if it was the last selected item", function() {
                expect(this.dialog.$('li.selected').length).toBeGreaterThan(0);
                expect(this.dialog.$('button.submit')).not.toBeDisabled();
                this.dialog.$("li.selected a").click();
                expect(this.dialog.$('li.selected').length).toBe(0);
                expect(this.dialog.$('button.submit')).toBeDisabled();
            });
        });

    });

    describe("submit", function() {
        beforeEach(function() {
            this.dialog.collection = this.workfiles;
            this.dialog.render();
            this.dialog.$("li a").eq(1).click();
        });

        it("populates the selectedFiles attribute", function() {
            this.dialog.$("button.submit").click();
            expect(this.dialog.selectedFiles.length).toBe(1);
            var model = this.dialog.selectedFiles.models[0];
            expect(model).toBe(this.workfiles.get(model.id));
        })

        it("dismisses the dialog", function() {
            spyOnEvent($(document), "close.facebox");

            this.dialog.$("button.submit").click();

            expect("close.facebox").toHaveBeenTriggeredOn($(document))
        });

        it("triggers the 'files:seleted' event on itself, passing in the selected files", function() {
            this.filesSelectedSpy = jasmine.createSpy("filesSelected");
            this.dialog.bind("files:selected", this.filesSelectedSpy);

            this.dialog.$("button.submit").click();

            expect(this.filesSelectedSpy).toHaveBeenCalledWith(this.dialog.selectedFiles);
        });
    });

    describe("cancel", function() {
        beforeEach(function() {
            this.dialog.collection = this.workfiles;
            this.dialog.render();
            this.dialog.$("li").eq(1).click();
            this.dialog.$("button.cancel").click();
        });

        it("should not populate selected files", function() {
            expect(this.dialog.selectedFiles).not.toExist();
        });
    });
});
