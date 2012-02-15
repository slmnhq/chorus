describe("chorus.pages.InstanceIndexPage", function() {
    describe("#initialize", function() {
        beforeEach(function() {
            this.page = new chorus.pages.InstanceIndexPage();
        })

        it("has a helpId", function() {
            expect(this.page.helpId).toBe("instances")
        })
    })

    describe("#render", function() {
        beforeEach(function() {
            this.page = new chorus.pages.InstanceIndexPage();
            this.page.collection.add(fixtures.instance());
            this.page.collection.add(fixtures.instance());
            this.page.render();
        });

        it("launches a new instance dialog", function() {
            stubModals();
            this.page.mainContent.contentDetails.$("button").click();
            expect(chorus.modal instanceof chorus.dialogs.InstancesNew).toBeTruthy();
        });

        it("sets the page model when a 'instance:selected' event is broadcast", function() {
            var instance = fixtures.instance()
            expect(this.page.model).not.toBe(instance);
            chorus.PageEvents.broadcast('instance:selected', instance);
            expect(this.page.model).toBe(instance);
        });
    })
})
