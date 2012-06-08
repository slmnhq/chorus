describe("chorus.views.ReadOnlyWorkfileContentDetails", function() {
    beforeEach(function() {
        this.model = rspecFixtures.workfile.binary();
        this.qtipMenu = stubQtip();
        this.view = new chorus.views.ReadOnlyWorkfileContentDetails({model: this.model});
        this.view.render();
    });

    it("has a download button", function() {
        expect(this.view.$("button").length).toBe(1);
        expect(this.view.$("a.download button")).toContainTranslation('actions.download_file');
        expect(this.view.$("a.download")).toHaveHref(this.model.downloadUrl());
    });

    describe("BinaryWorkfileContentDetails subclass", function() {
        beforeEach(function() {
            this.view = new chorus.views.BinaryWorkfileContentDetails({model: this.model});
            this.view.render();
        });

        it("explains the workfile is not editable", function() {
            expect(this.view.$(".not_previewable")).toContainTranslation("workfile.not_previewable");
        })
    });

    describe("ArchivedWorkfileContentDetails subclass", function() {
        beforeEach(function() {
            this.view = new chorus.views.ArchivedWorkfileContentDetails({model: this.model});
            this.view.render();
        });

        it("explains the workfile is not editable", function() {
            expect(this.view.$(".not_previewable")).toContainTranslation("workfile.workspace_archived");
        })
    });
});

