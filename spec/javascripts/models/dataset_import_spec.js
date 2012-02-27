describe("chorus.models.DatasetImport", function() {
    beforeEach(function() {
        this.model = fixtures.datasetImport({
            workspaceId: '101',
            datasetId: '102|my_db_name|my_schema_name|SOURCE_TABLE|my_table_name'
        });
    });

    it("has the right url", function() {
        expect(this.model.url()).toHaveUrlPath("/edc/workspace/101/dataset/102|my_db_name|my_schema_name|SOURCE_TABLE|my_table_name/import");
    });

    describe("validations", function() {
        context("when creating a new table", function() {
            beforeEach(function() {
                this.attrs = {
                    toTable: "Foo",
                    rowLimit: "23",
                    truncate: "true",
                    isNewTable: "true"
                };
            });

            _.each(["toTable", "truncate", "isNewTable"], function(attr) {
                it("should require " + attr, function() {
                    this.attrs[attr] = "";
                    expect(this.model.performValidation(this.attrs)).toBeFalsy();
                });
            });

            context("when useLimitRows is enabled", function() {
                beforeEach(function() {
                    this.attrs.useLimitRows = true;
                });

                it("should only allow digits for the row limit", function() {
                    this.attrs.rowLimit = "a3v4s5";
                    expect(this.model.performValidation(this.attrs)).toBeFalsy();
                });
            });

            context("when useLimitRows is not enabled", function() {
                beforeEach(function() {
                    this.attrs.useLimitRows = false;
                });

                it("should not validate the rowLimit field", function() {
                    this.attrs.rowLimit = "";
                    expect(this.model.performValidation(this.attrs)).toBeTruthy();
                });
            });
        });
    });

    describe("saved", function() {
        beforeEach(function() {
            this.model.set({
                toTable: 'newTable',
                truncate: 'false',
                createTableIfNotExist: 'true'
            });
        })
        context("when executeAfterSave is true", function() {
            beforeEach(function() {
                this.model.executeAfterSave = true;
                this.model.save();
                this.server.completeSaveFor(this.model);
            });

            it("saves a ImportTask", function() {
                var task = this.model.importTask;
                expect(task).toBeA(chorus.models.ImportTask);
                expect(task.get("workspaceId")).toBe(this.model.get("workspaceId"));
                expect(task.get("sourceId")).toBe(this.model.get("datasetId"));
                expect(this.server.lastCreateFor(task)).toBeDefined();
            });
        });

        context("when executeAfterSave is false", function() {
            beforeEach(function() {
                this.model.executeAfterSave = false;
                this.model.save();
                this.server.completeSaveFor(this.model);
            });

            it("does not create an ImportTask", function() {
                expect(this.model.importTask).toBeUndefined();
            })
        })
    });
});
