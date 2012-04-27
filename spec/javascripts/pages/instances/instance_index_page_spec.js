describe("chorus.pages.InstanceIndexPage", function() {
    describe("#initialize", function() {
        beforeEach(function() {
            this.page = new chorus.pages.InstanceIndexPage();
        });

        it("has a helpId", function() {
            expect(this.page.helpId).toBe("instances");
        });
    });

    describe("pre-selection", function() {
        it("pre-selects the first item by default", function() {
            this.page = new chorus.pages.InstanceIndexPage();
            this.server.completeFetchAllFor(this.page.collection, [
                newFixtures.instance.greenplum(),
                newFixtures.instance.greenplum()
            ]);
            this.page.render();
            expect(this.page.mainContent.content.$(".greenplum_instance li.instance:eq(0)")).toHaveClass("selected");
        });

        it("pre-selects the instance with ID specified in chorus.pageOptions, when available", function() {
            this.page = new chorus.pages.InstanceIndexPage();
            this.page.pageOptions = {selectId: 123456};
            this.server.completeFetchAllFor(this.page.collection, [
                newFixtures.instance.greenplum(),
                newFixtures.instance.greenplum({id: 123456})
            ]);
            this.page.render();
            expect(this.page.mainContent.content.$(".greenplum_instance li.instance[data-instance-id='123456']")).toHaveClass("selected");
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.page = new chorus.pages.InstanceIndexPage();
            chorus.bindModalLaunchingClicks(this.page);
            this.page.collection.add(newFixtures.instance.greenplum());
            this.page.collection.add(newFixtures.instance.greenplum());
            this.page.render();
        });

        it("launches a new instance dialog", function() {
            var modal = stubModals();
            this.page.mainContent.contentDetails.$("button").click();
            expect(modal.lastModal()).toBeA(chorus.dialogs.InstancesNew);
        });

        it("sets the page model when a 'instance:selected' event is broadcast", function() {
            var instance = newFixtures.instance.greenplum();
            expect(this.page.model).not.toBe(instance);
            chorus.PageEvents.broadcast('instance:selected', instance);
            expect(this.page.model).toBe(instance);
        });
    });
});
