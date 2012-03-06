describe("chorus.alerts.ImportFailed", function() {
    beforeEach(function() {
        this.model = fixtures.datasetImportFailed();
        this.launchElement = $("<a/>");
        this.launchElement.attr("data-id", this.model.get("datasetId"));
        this.launchElement.attr("data-workspace-id", this.model.get("workspaceId"));
        this.alert = new chorus.alerts.ImportFailed({ launchElement: this.launchElement });
    });

    describe("initialization", function() {
        it("should have the correct title", function() {
            expect(this.alert.title).toMatchTranslation("import.failed.alert.title");
        });

        it("fetches the failed import details", function() {
            expect(this.server.lastFetchFor(this.model)).toBeDefined();
        });

        it("declares the import details as a required resource", function() {
            expect(this.alert.requiredResources).toContain(this.alert.model)
        });

        context("when the launchElement has data-import-type", function() {
            beforeEach(function() {
                this.launchElement.attr("data-import-type", "CSV");
                this.alert = new chorus.alerts.ImportFailed({ launchElement: this.launchElement });
            });

            it("sets urlParams", function() {
                expect(this.alert.model.url()).toContainQueryParams({ importType: "CSV" })
            });
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.server.lastFetch().succeed(this.model);
        });

        it("renders the error details", function() {
            expect(this.alert.$(".body p")).toHaveText(this.model.get("executionInfo").result)
        });
    });
})
