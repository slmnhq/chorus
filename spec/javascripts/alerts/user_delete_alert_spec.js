describe("DeleteUserAlert", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-username='franktastic'></a>")
        this.alert = new chorus.alerts.UserDelete({ launchElement : this.launchElement });
        this.loadTemplate("alert")
    });

    it("finds the user from the data attributes on the link", function(){
        expect(this.alert.model.get("userName")).toBe("franktastic")
    })

    describe("successful deletion", function() {
        beforeEach(function() {
            spyOn(chorus.router, "navigate");
            spyOnEvent($(document), "close.facebox");
            this.alert.model.trigger("destroy", this.alert.model);
        });

        it("navigates to the user list page", function() {
            expect(chorus.router.navigate).toHaveBeenCalledWith("/users", true);
        });
    })
})
