describe("WorkfilesAttach", function() {
    beforeEach(function() {
        fixtures.model = "WorkfileSet"
        this.workfiles = fixtures.modelFor("fetch");
        spyOn(chorus.models.WorkfileSet.prototype, 'fetchAll');
        this.dialog = new chorus.dialogs.WorkfilesAttach({ workspaceId : "33" });
    });

    describe("#setup", function() {
        it("fetches all workfiles for the specified workspace", function() {
            expect(this.dialog.collection.fetchAll).toHaveBeenCalled();
        })
    })

    describe("render", function() {
        beforeEach(function() {
            this.dialog.collection = this.workfiles;
            this.dialog.render();
        });

        it("renders an item for each workfile", function() {
            expect(this.dialog.$("li").length).toBe(2);
        })

        it("sorts workfiles by last modified date", function() {
            expect(this.dialog.$("li:eq(0)")).toHaveAttr("data-id", "10021");
            expect(this.dialog.$("li:eq(1)")).toHaveAttr("data-id", "10020");
        })

        it("includes an image for each workfile", function() {
            var images = this.dialog.$(".collection_list img");
            expect(images.length).toBe(this.workfiles.length);
            expect(images.eq(0)).toHaveAttr("src", chorus.urlHelpers.fileIconUrl(this.workfiles.models[1].get("fileType"), 'medium'));
            expect(images.eq(1)).toHaveAttr("src", chorus.urlHelpers.fileIconUrl(this.workfiles.models[0].get("fileType"), 'medium'));
        });

        it("includes a name for each workfile", function() {
            var names = this.dialog.$('.name');
            expect(names.length).toBe(this.workfiles.length);
            expect(names.eq(0).text().trim()).toBe(this.workfiles.models[1].get("fileName"));
            expect(names.eq(1).text().trim()).toBe(this.workfiles.models[0].get("fileName"));
        })

        it("has a close window button that cancels the dialog", function() {
            expect(this.dialog.$("button.cancel").length).toBe(1);
        });
    });

    describe("selecting files", function() {
        beforeEach(function() {
            this.dialog.collection = this.workfiles;
            this.dialog.render();
            this.dialog.$("li a").eq(0).click();
            this.dialog.$("li a").eq(1).click();
        });

        it("add class selected", function() {
            expect(this.dialog.$("li").eq(0)).toHaveClass("selected");
            expect(this.dialog.$("li").eq(1)).toHaveClass("selected");
        });

        it("removes class selected when user click previously selected workfile", function() {
            this.dialog.$("li a").eq(0).click();
            expect(this.dialog.$("li").eq(0)).not.toHaveClass("selected");
        });
    });

    describe("submit", function() {
        beforeEach(function() {
            this.dialog.collection = this.workfiles;
            this.dialog.render();
            this.dialog.$("li a").eq(1).click();
            spyOnEvent($(document), "close.facebox");
            this.dialog.$("button.submit").click();
        });

        it("populates the selectedFiles attribute", function() {
            expect(this.dialog.selectedFiles.length).toBe(1);
            expect(this.dialog.selectedFiles.models[0].get("id")).toBe("10020")
        })

        it("dismisses the dialog", function() {
            expect("close.facebox").toHaveBeenTriggeredOn($(document))
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
