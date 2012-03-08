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
});