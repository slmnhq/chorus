describe("chorus.collections.HdfsEntrySet", function() {
    context("when the collection has path and instance set", function() {
        beforeEach(function() {
            this.hdfsEntrySet = fixtures.hdfsEntrySet(null, {
                path: '/data/somewhere'
            });
        });

        describe("add", function() {
            it("sets the path and instance on the added entries", function() {
                expect(this.hdfsEntrySet.at(0).get('path')).toBe('/data/somewhere');
                expect(this.hdfsEntrySet.at(0).get('instance')).toBe(this.hdfsEntrySet.attributes.instance);
            })
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
