describe("chorus.views.DatasetVisualizationSidebar", function() {
    beforeEach(function() {
        this.column1 = fixtures.databaseColumn({typeCategory: "ANIMAL", name: "B Liger"})
        this.column2 = fixtures.databaseColumn({typeCategory: "REAL_NUMBER", name: "a Speed"})
        this.column3 = fixtures.databaseColumn({typeCategory: "WHOLE_NUMBER", name: "A Milk Duds"})
        this.column4 = fixtures.databaseColumn({typeCategory: "DATE", name: "the date"})
        this.column5 = fixtures.databaseColumn({typeCategory: "TIME", name: "the time"})
        this.column6 = fixtures.databaseColumn({typeCategory: "DATETIME", name: "the time & date"})

        this.columns = fixtures.databaseColumnSet([this.column1, this.column2, this.column3, this.column4, this.column5, this.column6]);
        this.view = new chorus.views.DatasetVisualizationSidebar({collection: this.columns})
    });

    it("should not modify the collection order", function() {
        expect(this.columns.pluck('name')).toEqual([ 'B Liger', 'a Speed', 'A Milk Duds', 'the date', 'the time', 'the time & date']);
    });

    describe("allColumnNames", function() {
        it("returns a sorted array of column names", function() {
            expect(this.view.allColumnNames()).toEqual(['A Milk Duds', 'a Speed', 'B Liger', 'the date', 'the time', 'the time & date']);
        })
    })

    describe("numericColumnNames", function() {
        it("returns a sorted array of numeric column names", function() {
            expect(this.view.numericColumnNames()).toEqual(['A Milk Duds', 'a Speed']);
        })
    })

    describe("datetimeColumnNames", function() {
        it("returns a sorted array of date/time column names", function() {
            expect(this.view.datetimeColumnNames()).toEqual(["the date", "the time", "the time & date"]);
        })
    })

    describe("Creating a Visualization", function() {
        beforeEach(function() {
            spyOn(chorus.dialogs.Visualization.prototype, "onExecutionComplete");
            spyOn(this.view, "onSqlError");
            spyOn(this.view, "clearSqlErrors");
            spyOn(this.view, "showLoadingSpinner")
            spyOn(this.view, "hideLoadingSpinner")
            stubModals();
            this.server.reset();
            this.view.chartOptions = function() {return {type: 'histogram'};};
            this.view.model = fixtures.datasetSourceTable();
            this.view.launchVisualizationDialog();
        })

        it("should clear the sql error bar", function() {
            expect(this.view.clearSqlErrors).toHaveBeenCalled();
        });

        it("should call save on the task", function() {
            expect(this.server.lastCreate()).toBeDefined();
        });

        it("should have a spinner", function() {
            expect(this.view.showLoadingSpinner).toHaveBeenCalled()
        })

        it("should disable the create button", function() {
            expect(this.view.showLoadingSpinner).toHaveBeenCalled()
        })

        describe("when the save completes", function() {
            beforeEach(function() {
                this.view.task.trigger("saved");
            });

            it("starts up the visualization dialog", function() {
                expect(this.view.dialog.onExecutionComplete).toHaveBeenCalled();
            });

            it("should not have a spinner", function() {
                expect(this.view.hideLoadingSpinner).toHaveBeenCalled()
            })

            it("should enable the create button", function() {
                expect(this.view.hideLoadingSpinner).toHaveBeenCalled()
            })
        });

        describe("when the save fails", function() {
            beforeEach(function() {
                this.view.task.trigger("saveFailed");
            });

            it("displays the error DIV", function() {
                expect(this.view.onSqlError).toHaveBeenCalled();
            });

            it("should not have a spinner", function() {
                expect(this.view.hideLoadingSpinner).toHaveBeenCalled()
            })

            it("should enable the create button", function() {
                expect(this.view.hideLoadingSpinner).toHaveBeenCalled()
            })
        });
    })

    describe("errors", function() {
        beforeEach(function() {
            this.view.errorContainer = jasmine.createSpyObj("errorContainer", ['showError', 'closeError']);
            this.view.task = {};
        });

        describe("onSqlError", function() {
            it("passes the task and the alert class to showErrors on the errorContainer", function() {
                this.view.onSqlError();
                expect(this.view.errorContainer.showError).toHaveBeenCalledWith(this.view.task, chorus.alerts.VisualizationError);
            });
        });

        describe("clearSqlErrors", function() {
            it("passes the task and the alert class to showErrors on the errorContainer", function() {
                this.view.clearSqlErrors();
                expect(this.view.errorContainer.closeError).toHaveBeenCalled();
            });
        });
    });
});