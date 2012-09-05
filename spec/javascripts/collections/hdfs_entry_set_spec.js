describe("chorus.collections.HdfsEntrySet", function() {
    context("when the collection has path and instance set", function() {
        beforeEach(function() {
            this.hdfsEntrySet = fixtures.hdfsEntrySet(null, {
                path: '/data/somewhere',
                hadoopInstance: {id: 222},
                id: 11
            });
        });


        describe("add", function() {
            it("sets the path and instance on the added entries", function() {
                expect(this.hdfsEntrySet.at(0).get('hadoopInstance')).toBe(this.hdfsEntrySet.attributes.hadoopInstance);
            })
        });

        describe("hdfsEntry", function() {
            it("returns a HdfsEntry representing the location of the Set", function() {
                var model = this.hdfsEntrySet.hdfsEntry();
                expect(model).toBeA(chorus.models.HdfsEntry);
                expect(model.id).toBe(11);
                expect(model.get('hadoopInstance')).toEqual({id: 222});
                expect(model.get('isDir')).toBeTruthy();
            });
        });
    });

    context("when the collection does not have path and instanceId set", function() {
        beforeEach(function() {
            this.hdfsEntrySet = fixtures.hdfsEntrySet([], {
                path: null,
                hadoopInstance: null
            });
        });

        describe("add", function() {
            it("keeps the path and instance already set on the entry", function() {
                var entry = rspecFixtures.hdfsFile({path: '/data/foo', hadoopInstance: {id: '10000'}});
                this.hdfsEntrySet.add(entry);
                expect(this.hdfsEntrySet.at(0).get('path')).toBe('/data/foo');
                expect(this.hdfsEntrySet.at(0).get('hadoopInstance').id).toBe('10000');
            })
        });
    });
});
