describe("chorus.dialogs.WorkfilesAttach", function() {
    beforeEach(function() {
        this.workfile1 = newFixtures.workfile.sql({
            workspace: { id: "33" },
            versionInfo: {
                versionNum: "1"
            }
        });
        this.workfile2 = newFixtures.workfile.text({
            workspace: { id: "33" },
            versionInfo: {
                versionNum: "5"
            }
        });

        // TODO: REMOVEME (this view needs to use 'versionInfo.updatedAt'
        this.workfile1.set({ lastUpdatedStamp: "2011-11-29T10:46:03Z" });
        this.workfile2.set({ lastUpdatedStamp: "2012-11-29T10:46:03Z" });

        this.workfiles = fixtures.workfileSet([this.workfile1, this.workfile2]);
        this.dialog = new chorus.dialogs.WorkfilesAttach({ workspaceId : "33" });
        this.server.completeFetchAllFor(this.dialog.collection, this.workfiles.models);
        this.dialog.render();
    });

    it("allows multiple selections", function() {
        expect(this.dialog.multiSelection).toBeTruthy();
    });

    it("sorts workfiles by last modified date", function() {
        expect(this.dialog.$("li:eq(0)")).toHaveAttr("data-id", this.workfile2.get('id'));
        expect(this.dialog.$("li:eq(1)")).toHaveAttr("data-id", this.workfile1.get('id'));
    });

    it("has the correct submit button text", function() {
        expect(this.dialog.$('button.submit')).toContainTranslation("workfiles.button.attach_file")
    });

    it("has the correct search placeholder text", function() {
        expect(this.dialog.$("input").attr("placeholder")).toMatchTranslation("workfiles.dialog.search");
    });

    it("has the correct iconUrl", function() {
        expect(this.dialog.$('li:eq(0) img')).toHaveAttr('src', this.workfile2.iconUrl({ size: "medium" }));
        expect(this.dialog.$('li:eq(1) img')).toHaveAttr('src', this.workfile1.iconUrl({ size: "medium" }));
    });

    it("has the correct name", function() {
        expect(this.dialog.$('li:eq(0) .name')).toContainText(this.workfiles.at(1).get("fileName"));
    });
});
