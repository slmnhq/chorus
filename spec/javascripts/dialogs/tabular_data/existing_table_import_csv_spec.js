describe("chorus.dialogs.ExistingTableImportCSV", function() {
    beforeEach(function() {
        chorus.page = {};
        this.sandbox = fixtures.sandbox({
            schemaName: "mySchema",
            databaseName: "myDatabase",
            instanceName: "myInstance"
        })
        chorus.page.workspace = fixtures.workspace();
        this.csv = fixtures.csvImport({lines: [
            "COL1,col2, col3 ,col 4,Col_5",
            "val1.1,val1.2,val1.3,val1.4,val1.5",
            "val2.1,val2.2,val2.3,val2.4,val2.5",
            "val3.1,val3.2,val3.3,val3.4,val3.5",
            "val4.1,val4.2,val4.3,val4.4,val4.5"
        ],
            toTable: "existingTable",
            truncate: true
        });
        this.dialog = new chorus.dialogs.ExistingTableImportCSV({csv: this.csv, datasetId: "dat-id"});
        this.columns = [
            {name: "col1", typeCategory: "WHOLE_NUMBER", ordinalPosition: "3"},
            {name: "col2", typeCategory: "STRING", ordinalPosition: "4"},
            {name: "col3", typeCategory: "WHOLE_NUMBER", ordinalPosition: "1"},
            {name: "col4", typeCategory: "WHOLE_NUMBER", ordinalPosition: "2"},
            {name: "col5", typeCategory: "WHOLE_NUMBER", ordinalPosition: "5"}
        ]
        this.dataset = fixtures.datasetSandboxTable({
            id: "dat-id",
            workspace: {id: this.csv.get("workspaceId")},
            columnNames: this.columns
        });
        this.server.completeFetchFor(this.dataset);
        this.qtip = stubQtip();
        stubDefer();
        this.dialog.render();
    });

    it("has the title", function() {
        expect(this.dialog.$('h1')).toContainTranslation("dataset.import.table.title");
    });

    it("has an import button", function() {
        expect(this.dialog.$('button.submit')).toContainTranslation("dataset.import.table.submit");
    });

    it("has the import button disabled by default", function() {
        expect(this.dialog.$('button.submit')).toBeDisabled();
    })

    it("has comma as the default separator", function() {
        expect(this.dialog.$('input[name=delimiter]:checked').val()).toBe(',');
    });

    it("shows an error when the CSV doesn't parse correctly", function() {
        this.csv.get("lines").push('"Has Spaces",2,3,4,5');
        this.dialog.$("input.delimiter[value=' ']").click();

        expect(this.csv.serverErrors).toBeDefined();
        expect(this.dialog.$(".errors")).not.toBeEmpty();
    });

    describe("click the 'tab' separator", hasRightSeparator('\t'));
    describe("click the 'comma' separator", hasRightSeparator(','));
    describe("click the 'semicolon' separator", hasRightSeparator(';'));
    describe("click the 'space' separator", hasRightSeparator(' '));

    function hasRightSeparator(separator) {
        return function() {
            beforeEach(function() {
                this.csv = fixtures.csvImport({lines: [
                    "COL1" + separator + "col2" + separator + "col3" + separator + "col_4" + separator + "Col_5",
                    "val1.1" + separator + "val1.2" + separator + "val1.3" + separator + "val1.4" + separator + "val1.5",
                    "val2.1" + separator + "val2.2" + separator + "val2.3" + separator + "val2.4" + separator + "val2.5",
                    "val3.1" + separator + "val3.2" + separator + "val3.3" + separator + "val3.4" + separator + "val3.5"
                ],
                    toTable: "existingTable"
                });
                this.dialog = new chorus.dialogs.ExistingTableImportCSV({csv: this.csv, datasetId: "dat-id"});
                this.server.completeFetchFor(this.dataset);
                this.dialog.render();

                this.dialog.$("input.delimiter[value='" + separator + "']").click();
            });

            it("has " + separator + " as separator", function() {
                expect(this.dialog.$('input.delimiter:checked').val()).toBe(separator);
            });

            it("reparses the file with " + separator + " as the separator", function() {
                expect(this.dialog.$(".data_table .tbody .column").length).toEqual(5);
            });
        };
    }

    describe("other delimiter input field", function() {
        beforeEach(function() {
            this.otherField = this.dialog.$('input[name=custom_delimiter]');
        });

        it("is empty on loading", function() {
            expect(this.otherField.val()).toBe("");
        });

        it("checks the Other radio button", function() {
            this.otherField.val("X");
            this.otherField.trigger("keyup");
            expect(this.dialog.$('input.delimiter[type=radio]:checked').val()).toBe("other");
        });

        it("retains its value after re-render", function() {
            this.otherField.val("X");
            this.otherField.trigger("keyup");
            expect(this.otherField).toHaveValue("X");
        });

        describe("clicking on radio button Other", function() {
            beforeEach(function() {
                spyOn($.fn, 'focus');
                this.dialog.$("input#delimiter_other").click();
            });

            it("focuses the text field", function() {
                expect($.fn.focus).toHaveBeenCalled();
                expect($.fn.focus.mostRecentCall.object).toBe("input:text");
            });

            describe("entering 'z' as a separator", function() {
                beforeEach(function() {
                    this.csv = fixtures.csvImport({lines: [
                        "COL1zcol2zcol3zcol_4zCol_5",
                        "val1.1zval1.2zval1.3zval1.4zval1.5",
                        "val2.1zval2.2zval2.3zval2.4zval2.5",
                        "val3.1zval3.2zval3.3zval3.4zval3.5"
                    ],
                        toTable: "existingTable"
                    });
                    this.dialog = new chorus.dialogs.ExistingTableImportCSV({csv: this.csv, datasetId: "dat-id"});
                    this.server.completeFetchFor(this.dataset);
                    this.dialog.render();

                    this.dialog.$("input#delimiter_other").click();
                    this.dialog.$('input[name=custom_delimiter]').val("z");
                    this.dialog.$('input[name=custom_delimiter]').trigger('keyup')
                });

                it("has z as separator", function() {
                    expect(this.dialog.$('input.delimiter:checked').val()).toBe('other');
                });

                it("reparses the file with z as the separator", function() {
                    expect(this.dialog.$(".data_table .tbody .column").length).toEqual(5);
                });
            });
        })
    });

    it("has directions", function() {
        expect(this.dialog.$('.directions')).toContainTranslation("dataset.import.table.existing.directions",
            {
                toTable: "existingTable"
            });
    });

    it("has a progress tracker", function() {
        expect(this.dialog.$(".progress")).toContainTranslation("dataset.import.table.progress", {count: 0, total: 5});
    })

    it("checked the include header row checkbox by default", function() {
        expect(this.dialog.$("#hasHeader")).toBeChecked();
    });

    describe("the data table", function() {
        it("has the right number of column names", function() {
            expect(this.dialog.$(".data_table .thead .column_names .th").length).toEqual(5);
        })

        it("converts the column names into db friendly format", function() {
            var $columnNames = this.dialog.$(".data_table .thead .column_names .th");
            expect($columnNames.eq(0).text()).toBe("col1")
            expect($columnNames.eq(1).text()).toBe("col2")
            expect($columnNames.eq(2).text()).toBe("col3")
            expect($columnNames.eq(3).text()).toBe("col_4")
            expect($columnNames.eq(4).text()).toBe("col_5")
        })

        it("has the right number of column column mapping headers", function() {
            expect(this.dialog.$(".data_table .thead .column_mapping .th").length).toEqual(5);
        })

        it("has the right number of data columns", function() {
            expect(this.dialog.$(".data_table .tbody .column").length).toEqual(5);
        })

        it("displays the provided types", function() {
            _.each(this.dialog.$(".th .type"), function(th, index) {
                expect($(th).find(".chosen").text().trim()).toBe(this.csv.columnOrientedData()[index].type);
            }, this);
        });

        it("has the right data in each cell", function() {
            _.each(this.dialog.$(".data_table .tbody .column"), function(column, i) {
                var cells = $(column).find(".td")
                expect(cells.length).toEqual(4);
                _.each(cells, function(cell, j) {
                    expect($(cell)).toContainText("val" + (j + 1) + "." + (i + 1));
                })
            });
        });

        it("has 'map to...' for each column mapping", function() {
            expect(this.dialog.$(".data_table .column_mapping .map").length).toEqual(5);
            _.each(this.dialog.$(".column_mapping .map"), function(el) {
                expect($(el).text()).toContainTranslation("dataset.import.table.existing.map_to");
                expect($(el).find("a").text()).toContainTranslation("dataset.import.table.existing.select_one");
                expect($(el).find("a")).toHaveClass("selection_conflict");
                expect($(el).find(".arrow")).toHaveClass("selection_conflict");
            });
        })

        describe("selecting a destination column", function() {
            beforeEach(function() {
                this.dialog.$(".column_mapping .map:eq(1)").click();
            })

            it("shows a qtip", function() {
                expect(this.qtip).toHaveVisibleQtip()
            });

            it("populates the qtip with the destination columns and column types", function() {
                expect(this.qtip.find(".ui-tooltip-content li").length).toBe(5);
                var self = this;
                _.each(this.qtip.find(".ui-tooltip-content li"), function(el, index) {
                    expect($(el).find("a").text()).toContain("col" + (index + 1));
                    var type = chorus.models.DatabaseColumn.humanTypeMap[self.columns[index].typeCategory];
                    expect($(el).find(".type").text()).toContain(type);
                });
            });

            context("actually choosing the destination column", function() {
                beforeEach(function() {
                    this.qtip.find(".qtip:eq(0) .ui-tooltip-content li:eq(1) a").click();
                    this.dialog.$(".column_mapping .map:eq(1)").click(); //Just to get it in the dom
                })
                it("names the correct destination column", function() {
                    expect(this.dialog.$(".column_mapping .map:eq(0) a").text()).toMatchTranslation("dataset.import.table.existing.select_one");
                    expect(this.dialog.$(".column_mapping .map:eq(0) a")).not.toHaveClass("selected");
                    expect(this.dialog.$(".column_mapping .map:eq(0) a")).toHaveClass("selection_conflict");

                    expect(this.dialog.$(".column_mapping .map:eq(1) a").text()).toBe("col2");
                    expect(this.dialog.$(".column_mapping .map:eq(1) a")).toHaveClass("selected");
                    expect(this.dialog.$(".column_mapping .map:eq(1) a")).not.toHaveClass("selection_conflict");
                });

                it("marks the column as selected", function() {
                    expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(0) .check")).toHaveClass("hidden");
                    expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(1) .check")).not.toHaveClass("hidden");
                })

                it("updates the count in the selected destination column (for all qtips)", function() {
                    expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(1) .name").text()).toBe("col2 (1)")
                    expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(1) .name")).toHaveClass("selected");
                })

                it("updates the progress tracker", function() {
                    expect(this.dialog.$(".progress")).toContainTranslation("dataset.import.table.progress", {count: 1, total: 5});
                })

                it("keeps the import button disabled", function() {
                    expect(this.dialog.$('button.submit')).toBeDisabled();
                })

                context("choosing the same destination column again", function() {
                    beforeEach(function() {
                        this.qtip.find(".qtip:eq(0) .ui-tooltip-content li:eq(1) a").click();
                    })
                    it("names the correct destination column", function() {
                        expect(this.dialog.$(".column_mapping .map:eq(0) a").text()).toMatchTranslation("dataset.import.table.existing.select_one");
                        expect(this.dialog.$(".column_mapping .map:eq(0) a")).not.toHaveClass("selected");
                        expect(this.dialog.$(".column_mapping .map:eq(0) a")).toHaveClass("selection_conflict");

                        expect(this.dialog.$(".column_mapping .map:eq(1) a").text()).toBe("col2");
                        expect(this.dialog.$(".column_mapping .map:eq(1) a")).toHaveClass("selected");
                        expect(this.dialog.$(".column_mapping .map:eq(1) a")).not.toHaveClass("selection_conflict");
                    });

                    it("does not double-count the column", function() {
                        this.dialog.$(".column_mapping .map:eq(1)").click(); //Just to get it in the dom
                        expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(1) .name").text()).toBe("col2 (1)");
                        expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(1) .name")).toHaveClass("selected");
                        expect(this.dialog.$(".progress")).toContainTranslation("dataset.import.table.progress", {count: 1, total: 5});
                    })
                })

                context("when choosing another destination column for the same source column", function() {
                    beforeEach(function() {
                        this.dialog.$(".column_mapping .map:eq(1)").click();
                        this.qtip.find(".qtip:last .ui-tooltip-content li:eq(0) a").click();
                    })
                    it("names the correct destination column", function() {
                        expect(this.dialog.$(".column_mapping .map:eq(0) a").text()).toMatchTranslation("dataset.import.table.existing.select_one");
                        expect(this.dialog.$(".column_mapping .map:eq(1) a").text()).toBe("col1");
                        expect(this.dialog.$(".column_mapping .map:eq(1) a")).toHaveClass("selected");
                        expect(this.dialog.$(".column_mapping .map:eq(1) a")).not.toHaveClass("selection_conflict");

                    });

                    it("marks the column as selected", function() {
                        this.dialog.$(".column_mapping .map:eq(1)").click();
                        expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(0) .check")).not.toHaveClass("hidden");
                        expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(1) .check")).toHaveClass("hidden");
                    });

                    it("updates the count in the selected destination column (for all qtips)", function() {
                        this.dialog.$(".column_mapping .map:eq(1)").click();
                        expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(0) .name").text()).toBe("col1 (1)");
                        expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(0) .name")).toHaveClass("selected");

                        expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(1) .name").text()).toBe("col2");
                        expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(1) .name")).toHaveClass("unselected");

                    })
                });

                context("when mapping another source column", function() {
                    beforeEach(function() {
                        this.dialog.$(".column_mapping .map:eq(0)").click();
                        this.qtip.find(".qtip:last .ui-tooltip-content li:eq(1) a").click();
                    });

                    it("names the correct destination column", function() {
                        expect(this.dialog.$(".column_mapping .map:eq(0) a").text()).toBe("col2");
                        expect(this.dialog.$(".column_mapping .map:eq(0) a")).not.toHaveClass("selected");
                        expect(this.dialog.$(".column_mapping .map:eq(0) a")).toHaveClass("selection_conflict");

                        expect(this.dialog.$(".column_mapping .map:eq(1) a").text()).toBe("col2");
                        expect(this.dialog.$(".column_mapping .map:eq(1) a")).not.toHaveClass("selected");
                        expect(this.dialog.$(".column_mapping .map:eq(1) a")).toHaveClass("selection_conflict");

                    });

                    it("updates the count in the selected destination column (for all qtips)", function() {
                        this.dialog.$(".column_mapping .map:eq(0)").click();
                        expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(0) .name").text()).toBe("col1")
                        expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(0) .name")).toHaveClass("unselected");
                        expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(1) .name").text()).toBe("col2 (2)")
                        expect(this.qtip.find(".qtip:last .ui-tooltip-content li:eq(1) .name")).toHaveClass("selection_conflict");
                    })

                    it("updates the progress tracker", function() {
                        expect(this.dialog.$(".progress")).toContainTranslation("dataset.import.table.progress", {count: 2, total: 5});
                    })


                });

                context("when all source columns but one are mapped", function() {
                    beforeEach(function() {
                        for (var i = 0; i < 4; i++) {
                            this.dialog.$(".column_mapping .map:eq(" + i + ")").click();
                            this.qtip.find(".qtip:last .ui-tooltip-content li:eq(" + i + ") a").click();
                        }
                    });
                    it("the last unselected column map is still displayed with red", function() {
                        expect(this.dialog.$(".column_mapping .map:eq(0) a")).toHaveClass("selected");
                        expect(this.dialog.$(".column_mapping .map:eq(1) a")).toHaveClass("selected");
                        expect(this.dialog.$(".column_mapping .map:eq(2) a")).toHaveClass("selected");
                        expect(this.dialog.$(".column_mapping .map:eq(3) a")).toHaveClass("selected");
                        expect(this.dialog.$(".column_mapping .map:eq(4) a")).toHaveClass("selection_conflict");
                    });
                });
            })

        })
    });

    describe("unchecking the include header box", function() {
        beforeEach(function() {
            spyOn(this.dialog, "postRender").andCallThrough();
            spyOn(this.dialog, "recalculateScrolling").andCallThrough();
            this.dialog.$("#hasHeader").prop("checked", false).change();
        })

        it("sets header on the csv model", function() {
            expect(this.dialog.csv.get("hasHeader")).toBeFalsy();
        });

        it("re-renders", function() {
            expect(this.dialog.postRender).toHaveBeenCalled();
        });

        it("the box is unchecked", function() {
            expect(this.dialog.$("#hasHeader").prop("checked")).toBeFalsy();
        });

        it("calls recalculate Scrolling", function() {
            expect(this.dialog.recalculateScrolling).toHaveBeenCalled();
        });

        describe("rechecking the box", function() {
            beforeEach(function() {
                this.dialog.postRender.reset();
                this.dialog.$("#hasHeader").prop("checked", true);
                this.dialog.$("#hasHeader").change();
            })
            it("sets header on the csv model", function() {
                expect(this.dialog.csv.get("hasHeader")).toBeTruthy();
            })
            it("re-renders", function() {
                expect(this.dialog.postRender).toHaveBeenCalled();
            })
            it("the box is checked", function() {
                expect(this.dialog.$("#hasHeader").prop("checked")).toBeTruthy();
            })
        })
    });

    describe("scrolling the data", function() {
        beforeEach(function() {
            this.addMatchers(chorus.svgHelpers.matchers);

            spyOn(this.dialog, "adjustHeaderPosition").andCallThrough();
            $('#jasmine_content').append(this.dialog.el);
            this.dialog.render();
            this.dialog.$(".tbody").trigger("scroll");
        });

        it("sets the header position", function() {
            expect(this.dialog.adjustHeaderPosition).toHaveBeenCalled();
        });

        context("scroll position after the page re-renders", function() {
            beforeEach(function() {
                var api = this.dialog.$(".tbody").data("jsp");
                api.scrollTo(7, 4);
                this.dialog.render();
            });

            it("roughly maintains the previous scroll position", function() {
                var api = this.dialog.$(".tbody").data("jsp");
                expect(api.getContentPositionX()).toBeWithinDeltaOf(7, 2);
                expect(api.getContentPositionY()).toBeWithinDeltaOf(4, 2);
            })
        })
    })

    describe("mapping all columns", function() {
        beforeEach(function() {
            spyOn(this.dialog, "closeModal");
            this.expectedColumnsMap = []
            for (var i = 0; i < 5; i++) {
                this.dialog.$(".column_mapping .map:eq(" + i + ")").click();
                this.qtip.find(".qtip:last .ui-tooltip-content li:eq(" + (i) + ") a").click();
                this.expectedColumnsMap.push({sourceOrder: (i + 1), targetOrder: this.columns[i].ordinalPosition})
            }
        });

        it("enables the import button", function() {
            expect(this.dialog.$('button.submit')).toBeEnabled();
        })

        describe("clicking the import button", function() {
            beforeEach(function() {
                this.dialog.$("button.submit").click();
            });

            it("starts the spinner", function() {
                expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
                expect(this.dialog.$("button.submit").text().trim()).toMatchTranslation("dataset.import.importing");
            });

            it("imports the file", function() {
                expect(this.server.lastCreate().url).toBe(this.dialog.csv.url());
                var params = this.server.lastCreate().params();
                expect(params.fileName).toBe(this.dialog.csv.get("fileName"));
                expect(params.toTable).toBe("existingTable");
                expect(params.delimiter).toBe(",");
                expect(params.type).toBe("existingTable");
                expect(params.hasHeader).toBe('true');
                expect(params.truncate).toBe('true');
                expect(JSON.parse(params.columnsMap)).toEqual(this.expectedColumnsMap);

            });

            context("when the post to import responds with success", function() {
                beforeEach(function() {
                    spyOn(chorus, 'toast');
                    spyOn(chorus.router, "navigate");
                    spyOn(chorus.PageEvents, 'broadcast');
                    this.server.lastCreateFor(this.dialog.csv).succeed();
                });

                it("closes the dialog and displays a toast", function() {
                    expect(this.dialog.closeModal).toHaveBeenCalled();
                    expect(chorus.toast).toHaveBeenCalledWith("dataset.import.started");
                });

                it("triggers csv_import:started", function() {
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("csv_import:started");
                });

                it("should navigate to the destination sandbox table", function() {
                    expect(chorus.router.navigate).toHaveBeenCalledWith(this.dialog.dataset.showUrl(), true)
                });
            })

            context("when the import fails", function() {
                beforeEach(function() {
                    this.server.lastCreateFor(this.dialog.csv).fail([
                        {message: "oops"}
                    ]);
                });

                it("displays the error", function() {
                    expect(this.dialog.$(".errors")).toContainText("oops");
                });

                it("re-enables the submit button", function() {
                    expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                })
            })
        })

        describe("and then double mapping a destination column", function() {
            beforeEach(function() {
                this.dialog.$(".column_mapping .map:eq(0)").click();
                this.qtip.find(".qtip:last .ui-tooltip-content li:eq(1) a").click();
            })
            it("disables the import button", function() {
                expect(this.dialog.$('button.submit')).toBeDisabled();
            })
        })
    });

    describe("more source columns than destination columns", function() {
        context("when there's no destination columns", function() {
            beforeEach(function() {
                this.dialog.dataset.attributes.columnNames = undefined;
                this.dialog.dataset.trigger("loaded");
                this.dialog.render();
            });
            it("displays the error message", function() {
                expect(this.dialog.$(".errors").text()).toContainTranslation("dataset.import.table.too_many_source_columns");
            })
        });

        context("when there's destination columns", function() {
            beforeEach(function() {
                this.dialog.dataset.attributes.columnNames.shift();
                this.dialog.dataset.trigger("loaded");
                this.dialog.render();
            });
            it("displays error message", function() {
                expect(this.dialog.$(".errors").text()).toContainTranslation("dataset.import.table.too_many_source_columns");
            });

            context("and then selecting a column", function() {
                beforeEach(function() {
                    this.dialog.$(".column_mapping .map:eq(1)").click();
                    this.qtip.find(".qtip:eq(0) .ui-tooltip-content li:eq(1) a").click();
                })
                it("still shows the errors", function() {
                    expect(this.dialog.$(".errors").text()).toContainTranslation("dataset.import.table.too_many_source_columns");
                })
            })

            context("and then changing the delimiter", function() {
                context("when the number of source columns is less than destination columns", function() {
                    beforeEach(function() {
                        this.dialog.$("input.delimiter[value=';']").click();
                    });
                    it("should clear the error message", function() {
                        expect(this.dialog.$(".errors").text()).toBe("");
                    });
                });
            });
        })
    })
});
