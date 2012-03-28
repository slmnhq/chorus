describe("chorus.models.TabularDataPreview", function() {
    beforeEach(function() {
        this.model = new chorus.models.TabularDataPreview({databaseName: "data%man", instanceId: "33", schemaName: "party/man"});
    });

    context("with a table name", function() {
        beforeEach(function() {
            this.model.set({tableName : "foo"});
        });
        it("should have the correct url template", function() {
            expect(this.model.url()).toBe("/edc/data/33/database/data%25man/schema/party%2Fman/table/foo/sample");
        });
    });

    context("with a view name", function() {
        beforeEach(function() {
            this.model.set({viewName : "bar"});
        });
        it("should have the correct url template", function() {
            expect(this.model.url()).toBe("/edc/data/33/database/data%25man/schema/party%2Fman/view/bar/sample");
        });
    });

    context("with a chorus view dataset id", function() {
        beforeEach(function() {
            this.model.set({workspaceId: "123", datasetId: "my%CV"});
        });
        it("should have the correct url template", function() {
            expect(this.model.url()).toBe("/edc/workspace/123/dataset/my%25CV/sample");
        })
    })

    context("with a chorus view query", function() {
        beforeEach(function() {
            this.model.set({query: "select * from hello;", workspaceId: "12345"})
        });
        it("should have the correct url template", function() {
            expect(this.model.url()).toBe("/edc/workspace/12345/dataset?type=preview")
        });
    })

    it("mixes in SQLResults", function() {
        expect(this.model.errorMessage).toBeDefined();
        expect(this.model.columnOrientedData).toBeDefined();
    })

    it("has a cancel method", function() {
        expect(this.model.cancel).toBeDefined();
    });
});
