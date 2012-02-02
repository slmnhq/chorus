describe("chorus.views.DatasetFilter", function() {
    beforeEach(function () {
        this.collection = fixtures.databaseColumnSet();
        this.view = new chorus.views.DatasetFilter({collection: this.collection});
    });

    describe("#render", function() {
        beforeEach(function () {
            // styleSelect is deferred, but call it immediately for these tests
            spyOn(_, "defer").andCallFake(function(f){return f()});
            spyOn(chorus, "styleSelect");

            this.view.render();
        });

        it("populates the filter's select options with the names of the columns", function() {
            expect(this.view.$("option").length).toBe(this.collection.length);

            var view = this.view;
            this.collection.each(function(model){
                expect(view.$(".column_filter option")).toContainText(model.get("name"));
            });
        });

        it("styles the select", function() {
            expect(chorus.styleSelect).toHaveBeenCalled();
        });

        it("displays remove button", function() {
            expect(this.view.$(".remove")).toExist();
        });

        describe("clicking on the remove button", function() {
            beforeEach(function () {
                spyOnEvent(this.view, "filterview:deleted");
                this.view.$(".remove").click();
            });

            it("raises the filterview:deleted event", function() {
                expect("filterview:deleted").toHaveBeenTriggeredOn(this.view, [this.view]);
            });
        });

        describe("columns with typeCategory: other", function() {
            beforeEach(function () {
                this.collection.models[0].set({typeCategory:"OTHER"});
                this.view.render();
            });

            it("disables the option for the 'other' column", function() {
                expect(this.view.$(".column_filter option[value='" + this.collection.models[0].get("name") + "']")).toHaveAttr("disabled");
                expect(this.view.$(".column_filter option[value='" + this.collection.models[1].get("name") + "']")).not.toHaveAttr("disabled");
            });
        });

        describe("columns with typeCategory: STRING, LONG_STRING", function() {
            beforeEach(function () {
                this.collection.models[0].set({typeCategory:"STRING"});
                this.view.render();

                this.keys = [
                    "equal",
                    "not_equal",
                    "null",
                    "not_null",
                    "like",
                    "begin_with",
                    "end_with",
                    "alpha_after",
                    "alpha_after_equal",
                    "alpha_before",
                    "alpha_before_equal"
                ];
            });

            it("adds a second select with the string options", function() {
                var view = this.view;

                _.each(this.keys, function(key){
                    expect(view.$(".string option")).toContainTranslation("dataset.filter." + key);
                });
            });

            describe("when choosing an option", function() {
                _.each(_.keys(chorus.views.DatasetFilter.stringMap), function(key){
                    if (chorus.views.DatasetFilter.stringMap[key].usesInput){
                        it("correctly shows the input for " + key, function() {
                            this.view.$(".comparator").val(key).change();
                            expect(this.view.$("input.filter_input")).not.toHaveClass("hidden");
                        });
                    } else {
                        it("correctly hides the input for " + key, function() {
                            this.view.$(".comparator").val(key).change();
                            expect(this.view.$("input.filter_input")).toHaveClass("hidden");
                        });
                    }
                });
            });
        });
    });
});