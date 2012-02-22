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

    describe("sorting", function() {
        context("without dataset", function() {
            beforeEach(function() {
                this.columns = new chorus.collections.DatabaseColumnSet();
                this.firstColumn = fixtures.databaseColumn({ordinalPosition: 1});
                this.secondColumn = fixtures.databaseColumn({ordinalPosition: 2});
                this.columns.add(this.secondColumn);
                this.columns.add(this.firstColumn);
            })
            it("should be ordered by ordinalPosition", function() {
                expect(this.columns.models).toEqual([this.firstColumn, this.secondColumn]);
            });
        });

        context("with multiple dataset", function() {
            beforeEach(function() {
                this.columns = new chorus.collections.DatabaseColumnSet();
                this.dataset1 = fixtures.datasetSandboxTable();
                this.dataset1.datasetNumber = 1;
                this.dataset1Columns = this.dataset1.columns();
                this.dataset1Columns.reset([fixtures.databaseColumn({ordinalPosition: 1}), fixtures.databaseColumn({ordinalPosition: 2}), fixtures.databaseColumn({ordinalPosition: 3})]);
                this.dataset2 = fixtures.datasetSandboxTable();
                this.dataset2.datasetNumber = 2;
                this.dataset2Columns = this.dataset2.columns()
                this.dataset2Columns.reset([fixtures.databaseColumn({ordinalPosition: 1}), fixtures.databaseColumn({ordinalPosition: 2})]);
                this.columns.add(this.dataset1Columns.models);
                this.columns.add(this.dataset2Columns.models);
            });

            it("sorts first by datasetNumber, then by ordinalPosition", function() {
                expect(_.pluck(this.columns.models, 'cid')).toEqual(_.pluck((this.dataset1Columns.models.concat(this.dataset2Columns.models)), 'cid'));
            });
        });
    });
});
