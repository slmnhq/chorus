describe("chorus.views.TabularDataVisualizationSidebar", function() {
    beforeEach(function() {
        this.column1 = fixtures.databaseColumn({typeCategory: "ANIMAL", name: "B Liger"})
        this.column2 = fixtures.databaseColumn({typeCategory: "REAL_NUMBER", name: "a Speed"})
        this.column3 = fixtures.databaseColumn({typeCategory: "WHOLE_NUMBER", name: "A Milk Duds"})
        this.column4 = fixtures.databaseColumn({typeCategory: "DATE", name: "the date"})
        this.column5 = fixtures.databaseColumn({typeCategory: "TIME", name: "the time"})
        this.column6 = fixtures.databaseColumn({typeCategory: "DATETIME", name: "the time & date"})

        this.columns = fixtures.databaseColumnSet([this.column1, this.column2, this.column3, this.column4, this.column5, this.column6]);
        this.view = new chorus.views.TabularDataVisualizationFrequencySidebar({collection: this.columns});
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

    describe("#render", function() {
        beforeEach(function() {
            this.modalSpy = stubModals();
            this.view.render();
        })

        it("has a create chart button", function() {
            expect(this.view.$('button.create')).toExist();
        })

        describe("Creating a Visualization", function() {
            beforeEach(function() {
                spyOn(this.view, "clearSqlErrors");
                spyOn(this.view, "onSqlError");
                this.view.model = fixtures.datasetSourceTable();
                this.view.$('button.create').click();
                this.task = this.view.task;
                spyOn(this.task, 'cancel').andCallThrough();
            })

            it("should clear the sql error bar", function() {
                expect(this.view.clearSqlErrors).toHaveBeenCalled();
            });

            it("should have a spinner", function() {
                expect(this.view.$("button.create")).toHaveSpinner();
            })

            it("should disable the create button", function() {
                expect(this.view.$("button.create")).toBeDisabled();
            })

            it("should show the cancel button", function() {
                expect(this.view.$("button.cancel")).not.toHaveClass('hidden');
            })

            describe("cancel:sidebar", function() {
                beforeEach(function() {
                    chorus.PageEvents.broadcast('cancel:sidebar');
                })

                it("cancels the task", function() {
                    expect(this.task.cancel).toHaveBeenCalled();
                })
            });

            describe("when the user clicks the cancel button", function() {
                beforeEach(function() {
                    this.view.$('button.cancel').click();
                })
                it("should remove the spinner from the create button", function() {
                    expect(this.view.$('button.create')).not.toHaveSpinner()
                })

                it("should enable the create button", function() {
                    expect(this.view.$("button.create")).not.toBeDisabled();
                })

                it("should hide the cancel button", function() {
                    expect(this.view.$("button.cancel")).toHaveClass('hidden');
                })

                it("cancels the task", function() {
                    expect(this.task.cancel).toHaveBeenCalled();
                })

                describe("when the cancel is successful", function() {
                    beforeEach(function() {
                        this.server.lastCreateFor(this.task).fail("The task is cancelled");
                    })

                    it("does not render errors", function() {
                        expect(this.view.onSqlError).not.toHaveBeenCalled();
                    })

                    it("unsets the task from the view", function() {
                        expect(this.view.task).toBeUndefined();
                    })
                })
            })

            describe("when the save completes", function() {
                beforeEach(function() {
                    this.server.completeSaveFor(this.view.task);
                })

                it("starts up the visualization dialog", function() {
                    expect(this.modalSpy).toHaveModal(chorus.dialogs.Visualization);
                });

                it("should remove the spinner from the create button", function() {
                    expect(this.view.$('button.create')).not.toHaveSpinner()
                })

                it("should enable the create button", function() {
                    expect(this.view.$("button.create")).not.toBeDisabled();
                })

                it("should hide the cancel button", function() {
                    expect(this.view.$("button.cancel")).toHaveClass('hidden');
                })

                it("unsets the task from the view", function() {
                    expect(this.view.task).toBeUndefined();
                })
            })

            describe("when the save fails", function() {
                beforeEach(function() {
                    this.server.lastCreateFor(this.view.task).fail("Boom!");
                });

                it("displays the error DIV", function() {
                    expect(this.view.onSqlError).toHaveBeenCalled();
                });

                it("should remove the spinner from the create button", function() {
                    expect(this.view.$('button.create')).not.toHaveSpinner()
                })

                it("should enable the create button", function() {
                    expect(this.view.$("button.create")).not.toBeDisabled();
                })

                it("should hide the cancel button", function() {
                    expect(this.view.$("button.cancel")).toHaveClass('hidden');
                })

                it("unsets the task from the view", function() {
                    expect(this.view.task).toBeUndefined();
                })
            });
        })


        context("not creating a visualization", function() {

            it("does not blow up when cancel:sidebar is triggered", function() {
                chorus.PageEvents.broadcast('cancel:sidebar');
            })
        })
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
