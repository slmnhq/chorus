describe("chorus.collections.DatabaseColumnSet", function() {
    describe("database table column", function() {
        beforeEach(function() {
            var table = fixtures.datasetSandboxTable({
                instance: {
                    id: '2',
                    name: 'instance2'
                },
                databaseName: 'db1',
                schemaName: 'schema1',
                objectName: 'table1'
            });
            this.columns = table.columns();
        });

        it("has the correct urlTemplate", function() {
            expect(this.columns.url()).toContain("/edc/data/2/database/db1/schema/schema1/table/table1/column");
        })

        describe("add", function() {
            it("sets tabularData on the added column", function() {
                this.columns.add(fixtures.databaseColumn());
                expect(this.columns.models[0].tabularData).toBe(this.columns.attributes.tabularData);
            })

            it("calls initialize on the column", function() {
                var column = fixtures.databaseColumn()
                spyOn(column, 'initialize').andCallThrough();
                this.columns.add(column);
                expect(column.initialize).toHaveBeenCalled();
                expect(column.get('schemaName')).toBe('schema1');
            })
        });
    });

    describe("database view column", function() {
        beforeEach(function() {
            var view = fixtures.datasetSandboxView({
                instance: {
                    id: '2',
                    name: 'instance2'
                },
                databaseName: 'db1',
                schemaName: 'schema1',
                objectName: 'view1'
            })
            this.columns = view.columns();
        });

        it("has the correct urlTemplate", function() {
            expect(this.columns.url()).toContain("/edc/data/2/database/db1/schema/schema1/view/view1/column");
        })

        describe("add", function() {
            it("sets the schemaName and viewName (as parentName) on the added column", function() {
                this.columns.add(fixtures.databaseColumn());
                expect(this.columns.models[0].get('schemaName')).toBe('schema1');
                expect(this.columns.models[0].get('parentName')).toBe('view1');
            })
        });
    });

    describe("database chorus view column", function() {
        beforeEach(function() {
            var chrousView = fixtures.datasetChorusView({
                workspace: {
                    id: '10'
                },
                id: "10000|dca_demo|ddemo|QUERY|chorus_view"
            })
            this.columns = chrousView.columns();
        })

        it("has the correct urlTemplate", function() {
            expect(this.columns.url()).toContain("/edc/workspace/10/dataset/10000|dca_demo|ddemo|QUERY|chorus_view/column");
        })
    })

    describe("#urlParams", function() {
        context("when type attribute is meta", function() {
            beforeEach(function() {
                this.columns = fixtures.datasetSandboxView().columns({type: "meta"});
            });

            it("should include the 'type' parameter in the url", function() {
                expect(this.columns.urlParams().type).toBe("meta");
            });
        });

        context("when type attribute is unspecified", function() {
            beforeEach(function() {
                this.columns = fixtures.datasetSandboxView().columns();
            });

            it("should not include the 'type' parameter in the url", function() {
                expect(this.columns.urlParams().type).toBeFalsy();
            });
        });
    });
});
