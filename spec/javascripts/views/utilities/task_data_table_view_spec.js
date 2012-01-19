describe("chorus.views.TaskDataTable", function() {
    beforeEach(function() {
        this.task = fixtures.task({ result: {
            columns: [{ name: "id" }, { name: "city" }, { name: "state" }, { name: "zip" }],
            rows: [
                { id: 1 , city: "Oakland"   , state: "CA" , zip: "94612" } ,
                { id: 2 , city: "Arcata"    , state: "CA" , zip: "95521" } ,
                { id: 3 , city: "Lafayette" , state: "IN" , zip: "47909" }
            ]
        }});

        this.view = new chorus.views.TaskDataTable({ model: this.task });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("renders a column div for every column of the result", function() {
            expect(this.view.$("div.column").length).toBe(4);
        });

        it("renders a column header for each column, with the column's name", function() {
            expect(this.view.$("div.th:eq(0)").text()).toBe("id");
            expect(this.view.$("div.th:eq(1)").text()).toBe("city");
            expect(this.view.$("div.th:eq(2)").text()).toBe("state");
            expect(this.view.$("div.th:eq(3)").text()).toBe("zip");
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
            expect(this.view.$(".column:eq(3) div.td:eq(2)").text()).toBe("47909");
        });
    });
});
