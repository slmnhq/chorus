describe("chorus.dialogs.InstanceUsage", function() {
    beforeEach(function() {
        this.instance = newFixtures.greenplumInstance.greenplum({
            name: "pasta",
            host: "greenplum",
            port: "8555",
            description: "it is a food name"
        });
        this.launchElement = $("<a/>");
        this.launchElement.data("instance", this.instance);
        this.dialog = new chorus.dialogs.InstanceUsage({launchElement : this.launchElement });
    });

    it("requires the config object", function() {
        expect(this.dialog.requiredResources).toContain(chorus.models.Config.instance());
    });

    it("fetches the usage", function() {
        expect(this.dialog.usage).toHaveBeenFetched();
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
            $('#jasmine_content').append(this.dialog.el);
        });

        it("has the right title", function() {
            expect(this.dialog.title).toMatchTranslation("instances.usage.title");
        });

        context("when the usage and config have been fetched", function() {
            beforeEach(function(){
                var sourceUsage = fixtures.instanceUsage();
                sourceUsage.set({instanceId : this.dialog.usage.get("instanceId")});
                this.server.completeFetchFor(sourceUsage);
                this.server.completeFetchFor(chorus.models.Config.instance(), fixtures.configJson());
                this.workspaces = this.dialog.usage.get("workspaces");
            });

            it("displays the estimated total usage", function() {
                expect(this.dialog.$(".total_usage").text().trim()).toMatchTranslation("instances.usage.total", {size: this.dialog.usage.get("sandboxesSize")});
            });

            it("renders a li for each workspace", function() {
                expect(this.dialog.$("li").length).toBe(this.workspaces.length)
            })

            it("renders the workspace_small.png image for each workspace", function() {
                expect(this.dialog.$("li img[src='/images/workspaces/workspace_small.png']").length).toBe(this.workspaces.length);
            });

            it("displays a link to each workspace", function() {
                expect(this.dialog.$("li a.workspace_link").length).toBe(this.workspaces.length)
            })

            it("sets the width of the 'used' bar to be the percentage of the workspace size vs the recommended size", function() {
                var zipped = _.zip(this.dialog.$("li"), this.workspaces);
                var recommendedSize = this.dialog.config.get("sandboxRecommendSizeInBytes");
                _.each(zipped, function(z) {
                    var el = $(z[0]);
                    var workspace = z[1];
                    var expectedPercentage = parseInt(workspace.sizeInBytes, 10) /recommendedSize;
                    var actualPercentage = el.find(".used").width() / el.find(".usage_bar").width();
                    expect(actualPercentage).toBeCloseTo(expectedPercentage, 1);
                });
            });

            it("displays the 'location'", function() {
                expect(this.dialog.$("li:eq(0) .location .value").text().trim()).
                    toBe(this.workspaces[0].databaseName + "/" + this.workspaces[0].schemaName);
            });

            it("displays the owner", function() {
                expect(this.dialog.$("li:eq(0) .owner .value").text().trim()).
                    toBe(this.workspaces[0].ownerFullName);
            });
        });
    });
});