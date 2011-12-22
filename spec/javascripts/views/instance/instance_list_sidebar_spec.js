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
            $('#jasmine_content').append(this.view.el);
            this.activityViewStub = stubView("OMG I'm the activity list")
            spyOn(chorus.views, 'ActivityList').andReturn(this.activityViewStub)

            this.instance = fixtures.instance({instanceProvider: "Greenplum", name : "Harry's House of Glamour"})
            spyOn(this.instance.activities(), 'fetch');
            this.view.trigger("instance:selected", this.instance);
        });

        it("displays instance name", function() {
            expect(this.view.$(".instance_name").text()).toBe("Harry's House of Glamour");
        });

        it("displays instance type", function() {
            expect(this.view.$(".instance_type").text()).toBe("Greenplum");
        });

        it("renders ActivityList subview", function() {
            expect(this.view.$(".activity_list")).toBeVisible();
            expect(this.view.$(".activity_list").text()).toBe("OMG I'm the activity list")
        });

        it("populates the ActivityList with the activities", function() {
            expect(chorus.views.ActivityList.mostRecentCall.args[0].collection).toBe(this.instance.activities());
        });

        it("fetches the activities", function() {
            expect(this.instance.activities().fetch).toHaveBeenCalled();
        });
    });
});