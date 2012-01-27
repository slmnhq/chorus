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

        it("creates a new sidebar when the instance:selected event is received", function() {
            var oldSidebar = this.page.sidebar;
            var instanceLi = this.page.$("li .instance:eq(1)").click();
            expect(this.page.sidebar).not.toBe(oldSidebar);
        });

        it("forwards the instance:added event from the page to the content", function() {
            var spy = jasmine.createSpy('instance added');
            this.page.mainContent.content.bind("instance:added", spy);
            this.page.trigger("instance:added", "123");

            expect(spy).toHaveBeenCalledWith("123");
        });

        it("launches a new instance dialog", function(){
            stubModals();
            this.page.mainContent.contentDetails.$("button").click();
            expect(chorus.modal instanceof chorus.dialogs.InstancesNew).toBeTruthy();
        });

        it("sets the page model when a 'instance:selected' event is triggered on the InstanceList", function() {
            var instance = fixtures.instance()
            expect(this.page.model).not.toBe(instance);
            this.page.mainContent.content.trigger('instance:selected', instance);
            expect(this.page.model).toBe(instance);
        });
    })
})
