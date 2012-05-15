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

    it("links to the root directory of the hadoop instance", function() {
        expect(this.model.showUrl()).toBe("#/instances/" + this.model.get('id') + "/browse/");
    });

    describe("#entriesForDir(directoryName)", function() {
        it("returns an HdfsEntrySet with the right instance id and path", function() {
            var entries = this.model.entriesForPath("foo");
            expect(entries).toBeA(chorus.collections.HdfsEntrySet);
            expect(entries.attributes.path).toBe("foo");
            expect(entries.attributes.instance.id).toBe(this.model.get("id"));
        });
    });
});
