describe("chorus.views.InstanceList", function() {
    beforeEach(function() {
        this.collection = new chorus.models.InstanceSet();
        this.view = new chorus.views.InstanceList({collection: this.collection});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("renders", function(){
            expect(1).toBe(1);
        });
    });
});