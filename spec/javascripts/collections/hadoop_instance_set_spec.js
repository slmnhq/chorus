describe("chorus.collections.HadoopInstanceSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.HadoopInstanceSet();
    });

    it("has the right url", function() {
        expect(this.collection.url()).toHaveUrlPath("/hadoop_instances");
    });
});
