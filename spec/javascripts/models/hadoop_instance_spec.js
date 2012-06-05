describe("chorus.models.HadoopInstance", function() {
    beforeEach(function() {
        this.model = new chorus.models.HadoopInstance({ id: 123 });
        this.attrs = {};
    });

    it("has the right url", function() {
        expect(this.model.url()).toBe("/hadoop_instances/123");
    });

    it("is shared", function() {
        expect(this.model.get("shared")).toBeTruthy();
    });

    it("has the right provider icon url", function() {
        expect(this.model.providerIconUrl()).toBe("/images/instances/hadoop_instance.png");
    });

    it("links to the root directory of the hadoop instance", function() {
        expect(this.model.showUrl()).toBe("#/hadoop_instances/" + this.model.get('id') + "/browse/");
    });

    it("returns true for isHadoop", function() {
        expect(this.model.isHadoop()).toBeTruthy();
    });

    it("returns false for isGreenplum", function() {
        expect(this.model.isGreenplum()).toBeFalsy();
    });

    _.each(["name", "host", "username", "groupList", "port"], function(attr) {
        it("requires " + attr, function() {
            this.attrs[attr] = "";
            expect(this.model.performValidation(this.attrs)).toBeFalsy();
            expect(this.model.errors[attr]).toBeTruthy();
        })
    });

    describe("#entriesForDir(directoryName)", function() {
        it("returns an HdfsEntrySet with the right instance id and path", function() {
            var entries = this.model.entriesForPath("foo");
            expect(entries).toBeA(chorus.collections.HdfsEntrySet);
            expect(entries.attributes.path).toBe("foo");
            expect(entries.attributes.hadoopInstance.id).toBe(this.model.get("id"));
        });
    });

    describe("#providerIconUrl", function() {
        it("returns the right url for hadoop instances", function() {
            expect(this.model.providerIconUrl()).toBe("/images/instances/hadoop_instance.png");
        });
    });

});