describe("chorus.views.DatabaseColumnList", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.collection = fixtures.databaseColumnSet([], { comment : "column comment" });
            this.collection.at(0).set({ name : "column_name_2", ordinalPosition : "2", typeCategory: "WHOLE_NUMBER", type: "int4" });
            this.collection.at(1).set({ name : "column_name_1", ordinalPosition : "1", typeCategory: "BOOLEAN", type: "boolean" });
            this.view = new chorus.views.DatabaseColumnList({collection: this.collection});
            this.view.render();
        });

        it("defaults to selectMulti false", function(){
            expect(this.view.selectMulti).toBeFalsy();
        });

        it("renders an item for each column", function() {
            expect(this.view.$("> li").length).toBe(this.collection.length);
        });

        it("shows the comment for each column", function() {
            expect(this.view.$("li:eq(0) .summary")).toHaveText("column comment");
        })

        it("shows the type for each column", function() {
            expect(this.view.$("li:eq(0) .type")).toHaveClass("boolean");
            expect(this.view.$("li:eq(0) .type_name").text().trim()).toBe("boolean");

            expect(this.view.$("li:eq(1) .type")).toHaveClass("numeric");
            expect(this.view.$("li:eq(1) .type_name").text().trim()).toBe("int4");
        })

        it("sorts the columns by ordinalPosition", function() {
            expect(this.view.$("li:eq(0) .name")).toHaveText("column_name_1");
            expect(this.view.$("li:eq(1) .name")).toHaveText("column_name_2");
        })

        describe("column:deselected", function() {
           beforeEach(function(){
               this.view.selectMulti = true;

               this.view.trigger("column:deselected", this.collection.at(0));
           });

            it("deselects the column", function() {
                expect(this.view.$("li.selected").length).toBe(0);
            });
        });
        
        describe("clicking on a list item", function() {
            beforeEach(function() {
                spyOnEvent(this.view, "column:selected");
                spyOnEvent(this.view, "column:deselected");
            });
            context("with selectMulti false", function() {
                beforeEach(function() {
                    expect(this.view.$("li:eq(0)")).toHaveClass("selected");
                    this.view.$("li:eq(1)").click();
                })

                it("moves the selected class", function() {
                    expect(this.view.$("li:eq(0)")).not.toHaveClass("selected");
                    expect(this.view.$("li:eq(1)")).toHaveClass("selected");
                })

                it("triggers the column:selected event with the corresponding model as an argument", function(){
                    expect("column:selected").toHaveBeenTriggeredOn(this.view, [this.collection.at(1)]);
                });

                it("triggers the column:deselected event with the corresponding model as an argument", function(){
                    expect("column:deselected").toHaveBeenTriggeredOn(this.view, [this.collection.at(0)]);
                });

                describe("#deselectAll", function() {
                    beforeEach(function() {
                        this.view.deselectAll();
                    });

                    it("should remove class selected from all list items and select the first item", function() {
                        expect(this.view.$("li.selected").length).toBe(1);
                        expect(this.view.$("li:eq(0)")).toHaveClass("selected");
                    })
                })
            });

            context("with selectMulti true", function() {
                beforeEach(function() {
                    this.view.selectMulti = true;
                    expect(this.view.$("li:eq(0)")).toHaveClass("selected");
                    this.view.$("li:eq(1)").click();
                })

                it("selects both", function() {
                    expect(this.view.$("li:eq(0)")).toHaveClass("selected");
                    expect(this.view.$("li:eq(1)")).toHaveClass("selected");
                });

                it("triggers the column:selected event with the corresponding model as an argument", function(){
                    expect("column:selected").toHaveBeenTriggeredOn(this.view, [this.collection.at(1)]);
                });

                describe("deselecting", function() {
                    beforeEach(function() {
                        this.view.$("li:eq(1)").click();
                    });
                    it("can deselect everything", function() {
                        expect(this.view.$("li:eq(0)")).toHaveClass("selected");
                        expect(this.view.$("li:eq(1)")).not.toHaveClass("selected");

                        this.view.$("li:eq(0)").click();
                        expect(this.view.$("li:eq(0)")).not.toHaveClass("selected");
                    });

                    it("triggers the column:deselected event with the corresponding model as an argument", function(){
                        expect("column:deselected").toHaveBeenTriggeredOn(this.view, [this.collection.at(1)]);
                    });
                });
            });
        })
    });
});