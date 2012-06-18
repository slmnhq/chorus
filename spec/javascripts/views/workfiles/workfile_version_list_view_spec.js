describe("chorus.views.WorkfileVersionList", function() {
    beforeEach(function() {
        var version2attributes = rspecFixtures.workfileVersion({
            versionInfo: {
                modifier: {firstName: 'Bob'},
                versionNum: 2,
                updatedAt: '2012-11-29T10:00:00Z'
            }
        }).attributes;

        var version1attributes = rspecFixtures.workfileVersion({
            versionInfo: {
                modifier: {firstName: 'Rob'},
                versionNum: 1,
                updatedAt: '2011-11-29T10:00:00Z'
            }
        }).attributes;

        this.collection = new chorus.collections.WorkfileVersionSet([version1attributes, version2attributes]);
        this.view = new chorus.views.WorkfileVersionList({ collection: this.collection });
        this.view.render();
    });

    it("renders an li for each workfile version", function() {
        expect(this.view.$("li").length).toBe(2);
    });

    it("displays the version number for each item", function() {
        expect(this.view.$("li:eq(0) .version_title")).toContainTranslation("workfile.version_title", {versionNum: 2});
        expect(this.view.$("li:eq(1) .version_title")).toContainTranslation("workfile.version_title", {versionNum: 1});
    });

    it("displays the author and date for each item", function() {
        expect(this.view.$("li:eq(0) .version_details")).toContainTranslation("workfile.version_saved_by", {
            authorName: "Bob Doe", formattedDate: "November 29, 2012"
        });

        expect(this.view.$("li:eq(1) .version_details")).toContainTranslation("workfile.version_saved_by", {
            authorName: "Rob Doe", formattedDate: "November 29, 2011"
        });
    });
});
