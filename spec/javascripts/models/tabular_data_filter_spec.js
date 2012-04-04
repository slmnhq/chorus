describe("chorus.models.TabularDataFilter", function() {
    beforeEach(function() {
        this.model = new chorus.models.TabularDataFilter();
        this.model.set({columnCid: "abc123", comparator: "someComparator", value: ["one"]})
    });

    describe("#setColumnCid", function() {
        context("when the cid is the same as the current columnCid", function() {
            it("keeps the cid, comparator, and values the same", function() {
                this.model.setColumnCid("abc123");
                expect(this.model.get("comparator")).toBe("someComparator");
                expect(this.model.get("value")).toEqual(["one"]);
            });
        });

        context("when the cid is different from the current columnCid", function() {
            it("changes the cid and clears the comparator and values", function() {
                this.model.setColumnCid("abc1234");
                expect(this.model.get("comparator")).toBeUndefined();
                expect(this.model.get("value")).toBeUndefined();
            });
        });
    });
});