describe("chorus.pages.InstanceIndexPage", function() {
    beforeEach(function() {
    })

    describe("#render", function() {
        beforeEach(function() {
            this.page = new chorus.pages.InstanceIndexPage();
            this.page.collection.add(fixtures.instance());
            this.page.collection.add(fixtures.instance());
            this.page.render();
        })

        it("forwards the instance:selected event from the instance list view to the instance list sidebar", function() {
            var spy = jasmine.createSpy('instance selected')
            this.page.sidebar.bind("instance:selected", spy);
            this.page.$("li.instance").eq(1).click();

            expect(spy).toHaveBeenCalled();
        });
    })
})