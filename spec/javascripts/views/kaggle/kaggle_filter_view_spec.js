describe("chorus.views.KaggleFilter", function () {
    beforeEach(function () {
        this.view = new chorus.views.KaggleFilter({model: new chorus.models.KaggleFilter({name: 'rank'})});
    });

    it("should have kaggle column set as collection", function () {
        expect(this.view.collection).toBeA(chorus.collections.KaggleColumnSet);
    });

    it("should have a KaggleFilter model", function () {
        expect(this.view.model).toBeA(chorus.models.KaggleFilter);
    });

    describe("#render", function() {
        beforeEach(function () {
            stubDefer();
            this.selectMenuStub = stubSelectMenu();
            spyOn(chorus, "styleSelect").andCallThrough();
            this.view.render();
        });

        it("populates the filter's select options with the names of the columns", function() {
            expect(this.view.$(".column_filter option").length).toBe(this.view.collection.length);
            var view = this.view;
            this.view.collection.each(function(model, index) {
                var option = view.$(".column_filter option:eq(" + index + ")");
                expect(option).toContainText(model.get("name"));
            }, this);
        });

        it("does not have the aliased_name", function() {
            expect(this.selectMenuStub.find(".aliased_name")).not.toExist();
        });

        it("styles the select", function() {
            expect(chorus.styleSelect).toHaveBeenCalled();
        });

        it("displays remove button", function() {
            expect(this.view.$(".remove")).toExist();
        });

        describe("clicking on the remove button", function() {
            beforeEach(function() {
                spyOnEvent(this.view, "deleted");
                this.view.$(".remove").click();
            });

            it("raises the deleted event", function() {
                expect("deleted").toHaveBeenTriggeredOn(this.view);
            });
        });
    });
});