describe("chorus.pages.InstanceIndexPage", function() {
    describe("#initialize", function() {
        beforeEach(function() {
            this.page = new chorus.pages.InstanceIndexPage();
        })

        it("has a helpId", function() {
            expect(this.page.helpId).toBe("instances")
        })
    })

    describe("pre-selection", function() {
        it("pre-selects the first item by default", function() {
            var page = new chorus.pages.InstanceIndexPage();
            this.server.completeFetchAllFor(page.collection, [fixtures.instance(), fixtures.instance()]);
            page.render();
            expect(page.mainContent.content.$("li.instance:eq(0)")).toHaveClass("selected");
        });

        it("pre-selects the instance with ID specified in chorus.pageOptions, when available", function() {
            var page = new chorus.pages.InstanceIndexPage();
            page.pageOptions = {selectId: 123456};
            this.server.completeFetchAllFor(page.collection, [fixtures.instance(), fixtures.instance({id: 123456})]);

            page.render();
            expect(page.mainContent.content.$("li.instance:eq(1)")).toHaveClass("selected");
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.page = new chorus.pages.InstanceIndexPage();
            chorus.bindModalLaunchingClicks(this.page);
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
