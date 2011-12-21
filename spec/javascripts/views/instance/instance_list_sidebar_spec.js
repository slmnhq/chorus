describe("InstanceListSidebar", function() {
    beforeEach(function() {
        this.view = new chorus.views.InstanceListSidebar();
    });

    describe("render", function() {
        beforeEach(function() {
            this.view.render();
        });
        describe("when no instance is selected", function() {
            it("should not display instance information", function() {
                expect(this.view.$(".info")).not.toExist();
            });
        });
    });

    describe("instance:selected event handling", function() {
        beforeEach(function() {
            fixtures.model = "Instance";
            this.instance = fixtures.modelFor("fetch")
            this.view.trigger("instance:selected", this.instance);
        });

        it("displays instance name", function() {
            expect(this.view.$(".instance_name").text()).toBe("instance1");
        });

        it("displays instance type", function() {
            expect(this.view.$(".instance_type").text()).toBe("Greenplum Database and Hadoop");
        })
    });
});