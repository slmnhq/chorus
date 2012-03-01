describe("chorus.views.DashboardInstanceList", function() {
    beforeEach(function(){
        this.instance1 = fixtures.instance({ name: "Broccoli" });
        this.instance2 = fixtures.instance({ name: "Camels", instanceProvider: "Hadoop" });
        this.collection = new chorus.collections.InstanceSet([ this.instance1, this.instance2 ]);
        this.collection.loaded = true;
        this.view = new chorus.views.DashboardInstanceList({ collection : this.collection });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("displays the names of the instances", function() {
            expect(this.view.$(".name").eq(0).text()).toBe("Broccoli");
            expect(this.view.$(".name").eq(1).text()).toBe("Camels");
        });

        it("displays the icon for each instance", function() {
            expect(this.view.$(".image img").eq(0).attr("src")).toBe(this.instance1.providerIconUrl());
            expect(this.view.$(".image img").eq(1).attr("src")).toBe(this.instance2.providerIconUrl());
        });

        it("has a link to browse each instance", function() {
            var browseLinks = this.view.$("a.dialog[data-dialog=SchemaBrowser]");

            expect(browseLinks.length).toBe(1);
            expect(browseLinks.eq(0).text()).toMatchTranslation("dashboard.instances.browse_datasets");

            expect(browseLinks.eq(0).data("instance").id).toEqual(this.instance1.get("id"));
            expect(browseLinks.eq(0).data("instance").name).toEqual(this.instance1.get("name"));

            var hdfsLink = this.view.$("a.browse_hadoop");
            expect(hdfsLink.length).toBe(1);
            expect(hdfsLink.eq(0).attr("href")).toBe("#/instances/" + this.instance2.id + "/browse/");
            expect(hdfsLink.eq(0)).toContainTranslation("dashboard.instances.browse_files");
        });
    });
});

