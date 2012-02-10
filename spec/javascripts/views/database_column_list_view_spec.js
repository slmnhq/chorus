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
        
        describe("clicking on a list item", function() {
            context("with selectMulti false", function() {
                beforeEach(function() {
                    expect(this.view.$("li:eq(0)")).toHaveClass("selected");
                    this.view.$("li:eq(1)").click();
                })

                it("moves the selected class", function() {
                    expect(this.view.$("li:eq(0)")).not.toHaveClass("selected");
                    expect(this.view.$("li:eq(1)")).toHaveClass("selected");
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
                })

                describe("deselecting", function() {
                    it("can deselect everything", function() {
                        this.view.$("li:eq(1)").click();
                        expect(this.view.$("li:eq(0)")).toHaveClass("selected");
                        expect(this.view.$("li:eq(1)")).not.toHaveClass("selected");

                        this.view.$("li:eq(0)").click();
                        expect(this.view.$("li:eq(0)")).not.toHaveClass("selected");
                    });
                });
            });
        })
    });
});