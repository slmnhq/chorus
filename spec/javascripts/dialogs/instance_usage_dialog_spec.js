describe("chorus.dialogs.InstanceUsage", function() {
    beforeEach(function() {
        this.instance = fixtures.instance({name : "pasta", host : "greenplum", port : "8555", description : "it is a food name" });
        this.launchElement = $("<a/>");
        this.dialog = new chorus.dialogs.InstanceUsage({launchElement : this.launchElement, pageModel : this.instance });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        });

        it("has the right title", function() {
            expect(this.dialog.title).toMatchTranslation("instances.usage.title");
        });

        it("fetches the usage", function() {
            expect(this.server.lastFetch().url).toMatchUrl(this.dialog.usage.url());
        });

        context("when the usage has been fetched", function() {
            beforeEach(function(){
                var sourceUsage = fixtures.instanceUsage();
                sourceUsage.set({instanceId : this.dialog.usage.get("instanceId")});
                this.server.completeFetchFor(sourceUsage);
                this.workspaces = this.dialog.usage.get("workspaces");
            });

            it("displays the estimated total usage", function() {
                expect(this.dialog.$(".total_usage").text().trim()).toMatchTranslation("instances.usage.total", {size: this.dialog.usage.get("sandboxesSize")});
            });

            it("renders a li for each workspace", function() {
                expect(this.dialog.$("li").length).toBe(this.workspaces.length)
            })

            it("renders the workspace_small.png image for each workspace", function() {
                expect(this.dialog.$("li img[src='/images/workspace-icon-small.png']").length).toBe(this.workspaces.length);
            });

            it("displays a link to each workspace", function() {
                expect(this.dialog.$("li a.workspace_link").length).toBe(this.workspaces.length)
            })

            xit("sets the width of the 'used' bar to be the percentage of the used chorus space", function() {
                var zipped = _.zip(this.dialog.$("li"), this.workspaces);
                _.each(zipped, function(z) {
                    var el = $(z[0]);
                    var workspace = z[1];
                    expect(el.find(".used").css("width")).toBe("50%");
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