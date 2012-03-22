describe("chorus.alerts.UserDelete", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-id='42'></a>")
        this.alert = new chorus.alerts.UserDelete({ launchElement : this.launchElement });
    });

    it("finds the user from the data attributes on the link", function(){
        expect(this.alert.model.get("id")).toBe(42)
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
