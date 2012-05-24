describe("chorus.views.WorkfileVersionList", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.WorkfileVersionSet([
            newFixtures.workfile.sql({
                fileName: "Foo",
                versionInfo: {
                    versionNum: 1,
                    modifier: {
                        id: "1",
                        firstName: "Bob",
                        lastName: "Smith"
                    },
                    updatedAt: "2011-11-29 10:46:03.255"
                }
            }),

            newFixtures.workfile.sql({
                fileName: "Foo",
                versionInfo: {
                    versionNum: 2,
                    modifier: {
                        id: "1",
                        firstName: "Jim",
                        lastName: "Jones"
                    },
                    updatedAt: "2012-11-29 10:46:03.255"
                }
            })
        ]);

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
            authorName: "Jim Jones", formattedDate: "November 29, 2012"
        });

        expect(this.view.$("li:eq(1) .version_details")).toContainTranslation("workfile.version_saved_by", {
            authorName: "Bob Smith", formattedDate: "November 29, 2011"
        });
    });
});
