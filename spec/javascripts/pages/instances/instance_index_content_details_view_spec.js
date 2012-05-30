describe("chorus.views.InstanceIndexContentDetails", function() {
    beforeEach(function() {
        var greenplumInstances = new chorus.collections.InstanceSet([
            newFixtures.instance.greenplum(),
            newFixtures.instance.greenplum()
        ]);
        var hadoopInstances = new chorus.collections.HadoopInstanceSet([
            newFixtures.instance.hadoop(),
            newFixtures.instance.hadoop()
        ]);

        this.view = new chorus.views.InstanceIndexContentDetails({greenplumInstances : greenplumInstances, hadoopInstances: hadoopInstances});
        this.view.render();
    });

    it("displays the loading text", function() {
        expect(this.view.$(".loading")).toExist();
    });

    describe("when gpInstances and hadoopInstances are loaded", function() {
        beforeEach(function() {
            this.view.options.greenplumInstances.loaded = true;
            this.view.options.hadoopInstances.loaded = true;
            this.view.render();
        });

        it("doesn't display the loading text", function() {
            expect(this.view.$(".loading")).not.toExist();
        });

        it("shows the instances count", function() {
            expect(this.view.$(".number")).toContainText(4);
        });
    });
});