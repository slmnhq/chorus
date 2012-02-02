describe("chorus.views.TaskDataTable", function() {
    beforeEach(function() {
        this.task = fixtures.task({ result: {
            columns: [
                { name: "id",    typeCategory : "WHOLE_NUMBER" },
                { name: "city",  typeCategory : "OTHER" },
                { name: "state", typeCategory : "OTHER" },
                { name: "zip",   typeCategory : "OTHER" }
            ],
            rows: [
                { id: 1 , city: "Oakland"   , state: "CA" , zip: "94612" } ,
                { id: 2 , city: "Arcata"    , state: "CA" , zip: "95521" } ,
                { id: 3 , city: "Lafayette" , state: "IN" , zip: null }
            ]
        }});

        this.view = new chorus.views.TaskDataTable({ model: this.task });
    });

    describe("#render", function() {
        beforeEach(function() {
            stubDefer();
            spyOn($.fn, "jScrollPane")
            this.view.render();
        });

        it("renders a column div for every column of the result", function() {
            expect(this.view.$("div.column").length).toBe(4);
        });

        it("renders a column header for each column, with the column's name", function() {
            expect(this.view.$("div.th:eq(0) .name").text()).toBe("id");
            expect(this.view.$("div.th:eq(1) .name").text()).toBe("city");
            expect(this.view.$("div.th:eq(2) .name").text()).toBe("state");
            expect(this.view.$("div.th:eq(3) .name").text()).toBe("zip");
        });

        it("renders a cell for every field", function() {
            expect(this.view.$(".column:eq(0) div.td:eq(0)").text()).toBe("1");
            expect(this.view.$(".column:eq(0) div.td:eq(1)").text()).toBe("2");
            expect(this.view.$(".column:eq(0) div.td:eq(2)").text()).toBe("3");

            expect(this.view.$(".column:eq(1) div.td:eq(0)").text()).toBe("Oakland");
            expect(this.view.$(".column:eq(1) div.td:eq(1)").text()).toBe("Arcata");
            expect(this.view.$(".column:eq(1) div.td:eq(2)").text()).toBe("Lafayette");

            expect(this.view.$(".column:eq(2) div.td:eq(0)").text()).toBe("CA");
            expect(this.view.$(".column:eq(2) div.td:eq(1)").text()).toBe("CA");
            expect(this.view.$(".column:eq(2) div.td:eq(2)").text()).toBe("IN");

            expect(this.view.$(".column:eq(3) div.td:eq(0)").text()).toBe("94612");
            expect(this.view.$(".column:eq(3) div.td:eq(1)").text()).toBe("95521");

            // Empty divs don't render correctly - assert null values become non-breaking spaces.
            expect(this.view.$(".column:eq(3) div.td:eq(2)").html().trim()).toBe("&nbsp;");
        });

        it("adds a data attribute to each column, specifying its type", function() {
            expect(this.view.$(".column:eq(0)").attr("data-type")).toBe("WHOLE_NUMBER");
            expect(this.view.$(".column:eq(1)").attr("data-type")).toBe("OTHER");
        });

        it("sets up custom scrolling", function() {
            expect($.fn.jScrollPane).toHaveBeenCalled();
        })

        context("clicking on the jump to left arrow", function() {
            beforeEach(function(){
                this.view.$(".th:eq(2) a.move_to_first").click();
            });

            it("moves the clicked column to the leftmost position", function() {
                expect(this.view.$("div.th:eq(0) .name").text()).toBe("state");
                expect(this.view.$("div.th:eq(1) .name").text()).toBe("id");
                expect(this.view.$("div.th:eq(2) .name").text()).toBe("city");
                expect(this.view.$("div.th:eq(3) .name").text()).toBe("zip");

                expect(this.view.$(".column:eq(0) div.td:eq(0)").text()).toBe("CA");
                expect(this.view.$(".column:eq(1) div.td:eq(0)").text()).toBe("1");
                expect(this.view.$(".column:eq(2) div.td:eq(0)").text()).toBe("Oakland");
                expect(this.view.$(".column:eq(3) div.td:eq(0)").text()).toBe("94612");
            });
        });
    });
});
