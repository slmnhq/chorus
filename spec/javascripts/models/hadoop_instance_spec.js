describe("chorus.models.HadoopInstance", function() {
    beforeEach(function() {
        this.model = new chorus.models.HadoopInstance({ id: 123 });
    });

    it("has the right url", function() {
        expect(this.model.url()).toBe("/hadoop_instances/123");
    });
});
