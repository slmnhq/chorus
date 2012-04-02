describe("chorus.dialogs.WorkfilesAttach", function() {
    beforeEach(function() {
        this.workfiles = fixtures.workfileSet([
            fixtures.workfile({lastUpdatedStamp: "2011-11-29 10:46:03.152"}),
            fixtures.workfile({lastUpdatedStamp: "2012-11-29 10:46:03.152"})
        ]);
        this.dialog = new chorus.dialogs.WorkfilesAttach({ workspaceId : "33" });
        this.server.completeFetchAllFor(this.dialog.collection, this.workfiles.models);
        spyOn(this.dialog.collection.at(0), "isImage").andReturn(true);
        spyOn(this.dialog.collection.at(1), "isImage").andReturn(false);
        this.dialog.render();
    });

    it("sorts workfiles by last modified date", function() {
        expect(this.dialog.$("li:eq(0)")).toHaveAttr("data-id", this.workfiles.at(1).get('id'));
        expect(this.dialog.$("li:eq(1)")).toHaveAttr("data-id", this.workfiles.at(0).get('id'));
    });

    it("has the correct submit button text", function() {
        expect(this.dialog.$('button.submit')).toContainTranslation("workfiles.button.attach_file")
    });

    it("has the correct iconUrl", function() {
        expect(this.dialog.$('.collection_list img:eq(0)')).toHaveAttr('src', chorus.urlHelpers.fileIconUrl(this.workfiles.at(1).get("fileType"), 'medium'));
        expect(this.dialog.$('.collection_list img:eq(1)')).toHaveAttr('src', this.dialog.collection.at(0).thumbnailUrl());
    });

    it("has the correct name", function() {
        expect(this.dialog.$('.name:eq(0)')).toContainText(this.workfiles.at(1).get("fileName"));
    });
});
