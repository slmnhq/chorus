describe("chorus.alerts.UserDelete", function() {
    beforeEach(function() {
        this.alert = new chorus.alerts.UserDelete({ id: 42 });
    });

    it("finds the user from the data attributes on the link", function(){
        expect(this.alert.model.get("id")).toBe(42)
    });

    describe("successful deletion", function() {
        beforeEach(function() {
            spyOn(chorus.router, "navigate");
            spyOnEvent($(document), "close.facebox");
            this.alert.model.trigger("destroy", this.alert.model);
        });

        it("navigates to the user list page", function() {
            expect(chorus.router.navigate).toHaveBeenCalledWith("/users");
        });
    })
})
