describe("chorus.collections.HdfsEntrySet", function() {
    context("when the collection has path and instance set", function() {
        beforeEach(function() {
            this.hdfsEntrySet = fixtures.hdfsEntrySet(null, {
                path: '/data/somewhere'
            });
        });

        it("has the right URL", function() {
            expect(this.hdfsEntrySet.url()).toContain("/hadoop_instances/" + this.hdfsEntrySet.attributes.hadoopInstance.id + "/files/%2Fdata%2Fsomewhere");
        });

        describe("add", function() {
            it("sets the path and instance on the added entries", function() {
                expect(this.hdfsEntrySet.at(0).get('path')).toBe('/data/somewhere');
                expect(this.hdfsEntrySet.at(0).get('hadoopInstance')).toBe(this.hdfsEntrySet.attributes.hadoopInstance);
            })
        });

        describe("hdfsEntry", function() {
            it("returns a HdfsEntry representing the location of the Set", function() {
                var model = this.hdfsEntrySet.hdfsEntry();
                expect(model).toBeA(chorus.models.HdfsEntry);
                expect(model.get('name')).toBe('somewhere');
                expect(model.get('path')).toBe('/data');
                expect(model.get('hadoopInstance')).toBe(this.hdfsEntrySet.attributes.hadoopInstance);
                expect(model.get('isDir')).toBeTruthy();
            });
        });
    });

    context("when the collection does not have path and instanceId set", function() {
        beforeEach(function() {
            this.hdfsEntrySet = fixtures.hdfsEntrySet([], {
                path: null,
                instance: null
            });
        });

        describe("add", function() {
            it("keeps the path and instance already set on the entry", function() {
                var entry = fixtures.hdfsEntryFileJson({
                    instance: {
                        id: '10000'
                    },
                    path: '/data/foo'
                });
                this.hdfsEntrySet.add(entry);
                expect(this.hdfsEntrySet.at(0).get('path')).toBe('/data/foo');
                expect(this.hdfsEntrySet.at(0).get('instance').id).toBe('10000');
            })
        });
    });
});
