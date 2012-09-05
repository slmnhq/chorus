describe("chorus.models.HdfsEntry", function() {
    it("it has the right entity type", function() {
       expect(new chorus.models.HdfsEntry().entityType).toBe("hdfs_file");
    });

    describe("showUrl", function() {
        context("when entry is a directory", function() {
            beforeEach(function() {
                this.model = new chorus.models.HdfsEntry({
                   id: 10012,
                   hadoopInstance: {
                       id: 42
                   },
                    path: "/data/a%pct",
                    name: "%foo%",
                    isDir: true
                })
            });

            it("is correct", function() {
                expect(this.model.showUrl()).toBe("#/hadoop_instances/42/browse/" + this.model.id);
            });
        });

        context("when entry is a file", function() {
            beforeEach(function() {
                this.model = new chorus.models.HdfsEntry({
                    id: 10012,
                    hadoopInstance: {
                        id: '42'
                    },
                    path: '/data/a space',
                    name: '%foo%'
                });
            });

            it("is correct", function() {
                expect(this.model.showUrl()).toBe("#/hadoop_instances/42/browseFile/" + this.model.id);
            });

            it("is correct when path is /", function() {
                this.model.set({path: "/"});
                expect(this.model.showUrl()).toBe("#/hadoop_instances/42/browseFile/" + this.model.id);
            });
        });
    });

    describe("#parent", function() {
        it("returns the entry's parent directory", function() {
            this.model = new chorus.models.HdfsEntry({
               id: 10012,
               hadoopInstance: {
                   id: 10000
               },
               path: "/imports/july/21",
               name: "injuries.csv",
               ancestors: [{id: 2, name: "parent"}, {id: 3, name: "grandparent"}]

           });

            var parent = this.model.parent();
            expect(parent.get("name")).toBe("parent");
        });
    });

    describe("pathSegments", function() {
        beforeEach(function() {
            this.model = new chorus.models.HdfsEntry({
                id: 10012,
                hadoopInstance: {
                    id: 10000
                },
                path: "/foo/bar/%baz",
                name: "foo.csv",
                ancestors: [{id: 2, name: "parent"}, {id: 3, name: "grandparent"}, {id: 4, name: "root"}]

            });

            this.segments = this.model.pathSegments();
        });

        it("returns one segment for each ancestor", function() {
            expect(this.segments.length).toBe(3);
        });

        it("the first segment represents the last ancestor", function() {
            var segment = this.segments[0];
            expect(segment.get('name')).toBe('root');
        });

        it("the last segment represents the first ancestor", function() {
            var segment = this.segments[2];
            expect(segment.get('name')).toBe('parent');
        });

        it("sets isDir to true for all segments", function() {
            expect(this.segments[0].get('isDir')).toBeTruthy();
        });
    });

    describe('getHadoopInstance', function() {
        beforeEach(function() {
            this.model = new chorus.models.HdfsEntry({
               hadoopInstance: {
                   id: 3,
                   name: "obscene"
               },
               path: "/"
           })

            this.hadoopInstance = this.model.getHadoopInstance();
        });

        it('returns a hadoop instance', function() {
            expect(this.hadoopInstance).toBeA(chorus.models.HadoopInstance);
        });

        it('has the correct attributes', function() {
            expect(this.hadoopInstance.get('id')).toBe(3);
            expect(this.hadoopInstance.get('name')).toBe('obscene');
        });

        it("should have an instanceProvider of Hadoop", function() {
            expect(this.hadoopInstance.get('instanceProvider')).toBe('Hadoop');
        })
    });

    describe("getFullAbsolutePath", function() {
        context("path is not root", function() {
            it("returns the path including the filename", function() {
                var model = new chorus.models.HdfsEntry({
                   hadoopInstance: {
                       id: 3
                   },
                    path: "/",
                    name: "file.sql"
               })

                expect(model.getFullAbsolutePath()).toEqual("/file.sql");
            });
        });

        context("path is not root", function() {
            it("returns the path including the filename", function() {
                var model = new chorus.models.HdfsEntry({
                    hadoopInstance: {
                        id: 3
                    },
                    path: "/workfiles",
                    name: "file.sql"
                })

                expect(model.getFullAbsolutePath()).toEqual("/workfiles/file.sql");
            });
        });
    });

    it("has the correct iconUrl", function() {
        var model = new chorus.models.HdfsEntry({
            hadoopInstance: {
                id: 3
            },
            is_dir: false,
            path: "/workfiles/file.txt",
            name: "file.txt"
        });
        expect(model.iconUrl()).toBe("/images/workfiles/large/txt.png")
    });
});
