describe("chorus.views.DashboardInstanceList", function() {
    beforeEach(function(){
        this.instance1 = newFixtures.greenplumInstance.greenplum({ name: "broccoli" });
        this.instance2 = rspecFixtures.hadoopInstance({ name: "Camels" });
        this.instance3 = rspecFixtures.hadoopInstance({ name: "doppler" });
        this.instance4 = newFixtures.greenplumInstance.greenplum({ name: "Ego" });
        this.instance5 = newFixtures.greenplumInstance.greenplum({ name: "fatoush" });
        this.collection = new chorus.collections.InstanceSet([
            this.instance5,
            this.instance2,
            this.instance4,
            this.instance3,
            this.instance1
        ]);

        var proxySet = new chorus.collections.Base(
            _.map(this.collection.models, function(model) {
                return new chorus.models.Base({ theInstance: model });
            })
        )

        this.collection.loaded = true;
        proxySet.loaded = true;
        this.view = new chorus.views.DashboardInstanceList({ collection : proxySet });
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

