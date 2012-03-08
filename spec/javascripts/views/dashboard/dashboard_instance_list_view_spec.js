describe("chorus.views.DashboardInstanceList", function() {
    beforeEach(function(){
        this.instance1 = fixtures.instance({ name: "broccoli" });
        this.instance2 = fixtures.instance({ name: "Camels", instanceProvider: "Hadoop" });
        this.instance3 = fixtures.instance({ name: "doppler", instanceProvider: "Hadoop" });
        this.instance4 = fixtures.instance({ name: "Ego" });
        this.instance5 = fixtures.instance({ name: "fatoush" });
        this.collection = new chorus.collections.InstanceSet([
            this.instance5,
            this.instance2,
            this.instance4,
            this.instance3,
            this.instance1
        ]);
        this.collection.loaded = true;
        this.view = new chorus.views.DashboardInstanceList({ collection : this.collection });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("displays the names of the instances", function() {
            expect(this.view.$(".name").eq(0).text()).toBe("broccoli");
            expect(this.view.$(".name").eq(1).text()).toBe("Camels");
        });

        it("sorts the instances case-insensitively", function() {
            expect(this.view.$(".name").eq(0).text()).toBe("broccoli");
            expect(this.view.$(".name").eq(1).text()).toBe("Camels");
            expect(this.view.$(".name").eq(2).text()).toBe("doppler");
            expect(this.view.$(".name").eq(3).text()).toBe("Ego");
            expect(this.view.$(".name").eq(4).text()).toBe("fatoush");
        });

        it("displays the icon for each instance", function() {
            expect(this.view.$(".image img").eq(0).attr("src")).toBe(this.instance1.providerIconUrl());
            expect(this.view.$(".image img").eq(1).attr("src")).toBe(this.instance2.providerIconUrl());
        });

        it("has a link to browse each instance", function() {
            expect(this.view.$("a.browse").eq(0)).toHaveHref(this.instance1.showUrl());
            expect(this.view.$("a.browse").eq(3)).toHaveHref(this.instance4.showUrl());
            expect(this.view.$("a.browse").eq(4)).toHaveHref(this.instance5.showUrl());
        });

        it("has a link to browse the hadoop instances", function() {
            var hdfsLink = this.view.$("a.browse");

            expect(hdfsLink.eq(1)).toContainTranslation("dashboard.instances.browse_files");
            expect(hdfsLink.eq(2)).toContainTranslation("dashboard.instances.browse_files");
            expect(hdfsLink.eq(1).attr("href")).toBe("#/instances/" + this.instance2.id + "/browse/");
            expect(hdfsLink.eq(2).attr("href")).toBe("#/instances/" + this.instance3.id + "/browse/");

            expect(this.view.$("a.name").eq(1).attr("href")).toBe("#/instances/" + this.instance2.id + "/browse/");
            expect(this.view.$("a.name").eq(2).attr("href")).toBe("#/instances/" + this.instance3.id + "/browse/");
        });
    });
});

