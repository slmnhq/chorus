describe("chorus.models.DynamicInstance", function() {
    it("should return a greenplum instance when the entity_type is greenplum_instance", function() {
        var model = new chorus.models.DynamicInstance({entityType: "greenplum_instance"});
        expect(model).toBeA(chorus.models.GreenplumInstance);
    });

    it("should return a hadoop instance when the entity_type is hadoop_instance", function() {
        var model = new chorus.models.DynamicInstance({entityType: "hadoop_instance"});
        expect(model).toBeA(chorus.models.HadoopInstance);
    });

    it("should return a gnip instance when the entity_type is gnip_instance", function() {
        var model = new chorus.models.DynamicInstance({entityType: "gnip_instance"});
        expect(model).toBeA(chorus.models.GnipInstance);
    });
});