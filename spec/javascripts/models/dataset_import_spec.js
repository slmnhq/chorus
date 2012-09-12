describe("chorus.models.DatasetImport", function() {
    beforeEach(function() {
        this.model = rspecFixtures.importSchedule({
            datasetId: '102',
            workspaceId: '1'
        });
        this.model.unset("id");
    });

    it("has the right url", function() {
        expect(this.model.url()).toContain("/datasets/102/import");
    });

    describe("#wasSuccessfullyExecuted", function() {
        it("returns true when the import succeeded on its last execution", function() {
            this.model.set({ executionInfo: { state: "success" } })
            expect(this.model.wasSuccessfullyExecuted()).toBeTruthy();
        });

        it("returns false if the import failed on its last execution", function() {
            this.model.set({ executionInfo: { state: "failed" } })
            expect(this.model.wasSuccessfullyExecuted()).toBeFalsy();
        });

        it("returns false if the import has not been executed", function() {
            this.model.unset("executionInfo");
            expect(this.model.wasSuccessfullyExecuted()).toBeFalsy();
        });
    });

    describe("#isInProgress", function() {
        it("returns true when the import has a startedStamp but no completedStamp", function() {
            this.model.set({ executionInfo: { state: "success", startedStamp: "something", completedStamp: null } })
            expect(this.model.isInProgress()).toBeTruthy();
        });

        it("returns false if the import has a completedStamp", function() {
            this.model.set({ executionInfo: { state: "success", completedStamp: "Yesterday" } })
            expect(this.model.isInProgress()).toBeFalsy();
        });

        it("returns false if the import has no executionInfo", function() {
            this.model.unset("executionInfo");
            expect(this.model.isInProgress()).toBeFalsy();
        });

        it("returns false if the import has empty executionInfo", function() {
            this.model.set({ executionInfo: {} });
            expect(this.model.isInProgress()).toBeFalsy();
        });
    });

    describe("#startTime, #endTime, #frequency", function() {
        context("when the import has the 'startDatetime' attribute (as required by the POST api)", function() {
            beforeEach(function() {
                this.model.set({
                    startDatetime: "2012-05-27T14:30:00Z",
                    endDate: "2012-08-28",
                    frequency: "MONTHLY"
                });
            });

            itReturnsTheCorrectTimes();
            it("returns the import's scheduled start time, without the milliseconds", function() {
                expect(this.model.startTime().compareTo(Date.parseFromApi("2012-05-27T14:30:00Z"))).toBe(0);
            });

        });

        context("when the import has a 'scheduleInfo' attribute (as returned by the GET api)", function() {
            beforeEach(function() {
                this.model.unset("startDatetime");
                this.model.unset("endDate");
                this.model.set({
                    startDatetime: "2012-05-27T14:30:00Z",
                    endDate: "2012-08-28",
                    frequency: "MONTHLY"
                });
            });

            itReturnsTheCorrectTimes();
            it("returns the import's scheduled start time, without the milliseconds", function() {
                expect(this.model.startTime().compareTo(Date.parseFromApi("2012-05-27T14:30:00Z"))).toBe(0);
            });

        });

        context("when the import doesn't have a 'scheduleStartTime''", function() {
            beforeEach(function() {
                this.model.unset("startDatetime");
                this.model.unset("endDate");
                this.model.unset("frequency");
            });

            it("returns undefined for endTime and frequency", function() {
                expect(this.model.endTime()).toBeUndefined();
                expect(this.model.frequency()).toBeUndefined();
            });

            it("returns 11pm today for startTime", function() {
                expect(this.model.startTime().compareTo(Date.today().set({hour: 23, minute: 00}))).toBe(0);
            })
        });

        function itReturnsTheCorrectTimes() {
            it("returns the import's frequency", function() {
                expect(this.model.frequency()).toBe("MONTHLY");
            });

            it("returns the import's end time", function() {
                expect(this.model.endTime().compareTo(Date.parse('2012-08-28'))).toBe(0);
            });
        }
    });

    describe("#beforeSave", function() {
        context("when the model has a 'sampleCount'", function() {
            beforeEach(function() {
                this.model.set({
                    newTable: 'true',
                    truncate: 'true',
                    useLimitRows: true,
                    sampleCount: 477
                });
            });

            it("sets the 'sampleMethod' parameter, as required by the API", function() {
                this.model.save();
                var params = this.server.lastCreate().params();
                expect(params["dataset_import[sample_count]"]).toBe('477');
            });
        });
    });

    describe("validations", function() {
        context("when creating a new table", function() {
            beforeEach(function() {
                this.attrs = {
                    toTable: "Foo",
                    sampleCount: "23",
                    truncate: "true",
                    newTable: "true"
                };
            });

            _.each(["toTable", "truncate", "newTable"], function(attr) {
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
                    this.attrs.sampleCount = "a3v4s5";
                    expect(this.model.performValidation(this.attrs)).toBeFalsy();
                });
            });

            context("when useLimitRows is not enabled", function() {
                beforeEach(function() {
                    this.attrs.useLimitRows = false;
                });

                it("should not validate the sampleCount field", function() {
                    this.attrs.sampleCount = "";
                    expect(this.model.performValidation(this.attrs)).toBeTruthy();
                });
            });
        });

        context("when importing into an existing table", function() {
            beforeEach(function() {
                this.attrs = {
                    toTable: "Foo",
                    sampleCount: "23",
                    truncate: "true",
                    newTable: "false"
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

    it("demands that the start date is before the end date", function() {
        this.attrs = {
            isActive: true,
            scheduleStartTime: "y",
            scheduleEndTime: "x",
            toTable: "Foo",
            sampleCount: "23",
            truncate: "true",
            newTable: "false"
        };
        expect(this.model.performValidation(this.attrs)).toBeFalsy();
    });
});
