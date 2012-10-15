describe("chorus.models.Filter", function() {
    beforeEach(function() {
        this.model = new chorus.models.Filter();
        this.column = new chorus.models.Base({ name: 'column_name' })
        this.model.set({column: this.column, comparator: "someComparator", input: {value: "one"}});
    });

    describe("#setColumn", function() {
        context("when the column is the same as the current column", function() {
            it("keeps the cid, comparator, and values the same", function() {
                this.model.setColumn(this.column);
                expect(this.model.get("comparator")).toBe("someComparator");
                expect(this.model.get("input")).toEqual({value: "one"});
            });
        });

        context("when the column is different from the current column", function() {
            it("changes the column and clears the comparator and values", function() {
                var column = new chorus.models.Base({ name: 'column_name' })
                this.model.setColumn(column);
                expect(this.model.get("column").attributes).toEqual(column.attributes);
                expect(this.model.get("comparator")).toBeUndefined();
                expect(this.model.get("input")).toBeUndefined();
            });
        });
    });

    describe("#setComparator", function() {
        it("should set the comparator", function () {
            this.model.setComparator("hello_comparator");
            expect(this.model.get("comparator")).toBe("hello_comparator")
        });
    });

    describe("#setInput", function() {
        it("should set the input", function () {
            this.model.setInput({ value: "hello_input" });
            expect(this.model.get("input").value).toBe("hello_input")
        });
    });
});