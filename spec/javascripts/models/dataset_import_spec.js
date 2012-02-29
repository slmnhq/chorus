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

    describe("#startTime, #endTime, #frequency", function() {
        context("when the import has the 'scheduleStartTime' attribute (as required by the POST api)", function() {
            beforeEach(function() {
                this.model.unset("scheduleInfo");
                this.model.set({
                    scheduleStartTime: "2012-05-27 14:30:00.0",
                    scheduleEndTime: "2012-08-28",
                    scheduleFrequency: "MONTHLY"
                });
            });

            itReturnsTheCorrectTimes();
        });

        context("when the import has a 'scheduleInfo' attribute (as returned by the GET api)", function() {
            beforeEach(function() {
                this.model.unset("scheduleStartTime");
                this.model.unset("scheduleEndTime");
                this.model.set({ scheduleInfo: {
                    startTime: "2012-05-27 14:30:00.0",
                    endTime: "2012-08-28",
                    frequency: "MONTHLY"
                }});
            });

            itReturnsTheCorrectTimes();
        });

        context("when the import doesn't have a 'scheduleInfo' or a 'scheduleStartTime''", function() {
            it("returns undefined", function() {
                this.model.unset("scheduleStartTime");
                this.model.unset("scheduleEndTime");
                this.model.unset("scheduleInfo");
                this.model.unset("scheduleFrequency");
                expect(this.model.startTime()).toBeUndefined();
                expect(this.model.endTime()).toBeUndefined();
                expect(this.model.frequency()).toBeUndefined();
            });
        });

        function itReturnsTheCorrectTimes() {
            it("returns the import's scheduled start time, without the milliseconds", function() {
                expect(this.model.startTime()).toBe("2012-05-27 14:30:00");
            });

            it("returns the import's frequency", function() {
                expect(this.model.frequency()).toBe("MONTHLY");
            });

            it("returns the import's end time", function() {
                expect(this.model.endTime()).toBe("2012-08-28");
            });
        }
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

            context("with a conforming toTable name", function() {
                it("validates", function() {
                    expect(this.model.performValidation(this.attrs)).toBeTruthy();
                });
            });

            context("with a non-conforming toTable name", function() {
                beforeEach(function() {
                    this.attrs.toTable = "__foo"
                });

                it("fails validations", function() {
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

        context("when importing into an existing table", function() {
            beforeEach(function() {
                this.attrs = {
                    toTable: "Foo",
                    rowLimit: "23",
                    truncate: "true",
                    isNewTable: "false"
                };
            });

            context("with a conforming toTable name", function() {
                it("validates", function() {
                    expect(this.model.performValidation(this.attrs)).toBeTruthy();
                });
            });

            context("with a toTable name that does not conform to the new table regex constraints", function() {
                beforeEach(function() {
                    this.attrs.toTable = "__foo"
                });

                it("validates", function() {
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
                isNewTable: 'true'
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
