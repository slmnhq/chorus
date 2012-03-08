describe("chorus.models.HdfsEntry", function() {
    it("has the right entityType", function() {
        this.model = fixtures.hdfsEntryFile();
        expect(this.model.entityType).toBe("hdfs");
    });

    describe("showUrl", function() {
        context("when entry is a directory", function() {
            beforeEach(function() {
                this.model = fixtures.hdfsEntryDir({
                    instance: {
                        id: '42'
                    },
                    path: '/data/somewhere'
                });
            });

            it("is correct", function() {
                var url = "#/instances/42/browse/data/somewhere/" + this.model.get("name");
                expect(this.model.showUrl()).toBe(url);
            });
        });

        context("when entry is a file", function() {
            beforeEach(function() {
                this.model = fixtures.hdfsEntryFile({
                    instance: {
                        id: '42'
                    },
                    path: '/data/somewhere'
                });
            });

            it("is correct", function() {
                var url = "#/instances/42/browseFile/data/somewhere/" + this.model.get("name");
                expect(this.model.showUrl()).toBe(url);
            });

            it("is correct when path is /", function() {
                this.model.set({path: "/"})
                var url = "#/instances/42/browseFile/" + this.model.get("name");
                expect(this.model.showUrl()).toBe(url);
            });
        });
    });

    describe("pathSegments", function() {
        beforeEach(function() {
            this.model = fixtures.hdfsEntryFile({
                path: '/foo/bar/baz',
                randomAttr: 'something'
            });
            this.segments = this.model.pathSegments();
        });

        it("returns one segment for each path segment", function() {
            expect(this.segments.length).toBe(3);
        });

        it("the first segment represents the first entry", function() {
            var segment = this.segments[0];
            expect(segment.get('path')).toBe('/');
            expect(segment.get('name')).toBe('foo');
        });

        it("the last segment represents the last entry", function() {
            var segment = this.segments[2];
            expect(segment.get('path')).toBe('/foo/bar');
            expect(segment.get('name')).toBe('baz');
        });

        it("maintains random attributes", function() {
            expect(this.segments[0].get('randomAttr')).toEqual(this.model.get('randomAttr'));
        });

        it("sets isDir to true for all segments", function() {
            expect(this.segments[0].get('isDir')).toBeTruthy();
        });
    });

    describe('getInstance', function() {
        beforeEach(function() {
            this.model = fixtures.hdfsEntryFile({
                instance: {
                    id: '3',
                    name: 'obscene'
                }
            });
            this.instance = this.model.getInstance();
        });

        it('returns an instance object', function() {
            expect(this.instance).toBeA(chorus.models.Instance);
        });

        it('has the correct attributes', function() {
            expect(this.instance.get('id')).toBe('3');
            expect(this.instance.get('name')).toBe('obscene');
        });

        it("should have an instanceProvider of Hadoop", function() {
            expect(this.instance.get('instanceProvider')).toBe('Hadoop');
        })
    });
});