describe("chorus.models.HadoopInstance", function() {
    beforeEach(function() {
        this.model = new chorus.models.HadoopInstance({ id: 123 });
    });

    it("inherits from Instance", function() {
        expect(this.model).toBeA(chorus.models.Instance);
    });

    it("has the right url", function() {
        expect(this.model.url()).toBe("/hadoop_instances/123");
    });

    it("has the right provider icon url", function() {
        expect(this.model.providerIconUrl()).toBe("/images/instances/hadoop_instance.png");
    });
});
