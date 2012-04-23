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
            expect(this.view.$(".name").eq(0)).toContainText("broccoli");
            expect(this.view.$(".name").eq(0)).toHaveHref(this.instance1.showUrl());

            expect(this.view.$(".name").eq(1)).toContainText("Camels");
            expect(this.view.$(".name").eq(1)).toHaveHref(this.instance2.showUrl());
        });

        it("sorts the instances case-insensitively", function() {
            expect(this.view.$(".name").eq(0)).toContainText("broccoli");
            expect(this.view.$(".name").eq(1)).toContainText("Camels");
            expect(this.view.$(".name").eq(2)).toContainText("doppler");
            expect(this.view.$(".name").eq(3)).toContainText("Ego");
            expect(this.view.$(".name").eq(4)).toContainText("fatoush");
        });

        it("displays the icon for each instance", function() {
            expect(this.view.$(".image img").eq(0).attr("src")).toBe(this.instance1.providerIconUrl());
            expect(this.view.$(".image img").eq(1).attr("src")).toBe(this.instance2.providerIconUrl());
        });
    });
});

