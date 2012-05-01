describe("chorus.dialogs.ExistingTableImportCSV", function() {
    beforeEach(function() {
        chorus.page = {};
        this.sandbox = newFixtures.sandbox({
            schemaName: "mySchema",
            databaseName: "myDatabase",
            instanceName: "myInstance"
        })
        chorus.page.workspace = newFixtures.workspace();
        this.csv = newFixtures.csvImport({
            lines: [
                "COL1,col2, col3 ,col 4,Col_5",
                "val1.1,val1.2,val1.3,val1.4,val1.5",
                "val2.1,val2.2,val2.3,val2.4,val2.5",
                "val3.1,val3.2,val3.3,val3.4,val3.5",
                "val4.1,val4.2,val4.3,val4.4,val4.5"
            ]
        }, {
            toTable: "existingTable",
            truncate: true,
            hasHeader: true
        });
        this.dialog = new chorus.dialogs.ExistingTableImportCSV({csv: this.csv, datasetId: "dat-id"});
        this.columns = [
            {name: "col1", typeCategory: "WHOLE_NUMBER", ordinalPosition: "3"},
            {name: "col2", typeCategory: "STRING", ordinalPosition: "4"},
            {name: "col3", typeCategory: "WHOLE_NUMBER", ordinalPosition: "1"},
            {name: "col4", typeCategory: "WHOLE_NUMBER", ordinalPosition: "2"},
            {name: "col5", typeCategory: "WHOLE_NUMBER", ordinalPosition: "5"}
        ]
        this.dataset = newFixtures.dataset.sandboxTable({
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

    describe("with an existing toTable that has a funny name", function() {
        beforeEach(function() {
            this.dialog.csv.set({ toTable: "!@#$%^&*()_+" });
            this.dialog.$("a.automap").click();
            this.server.reset();
            this.dialog.$("button.submit").click();
        });

        it("still imports and passes client side validation", function() {
            expect(this.server.lastCreateFor(this.dialog.csv).url.length).toBeGreaterThan(0);
        });
    });

    describe("click the 'tab' separator", hasRightSeparator('\t'));
    describe("click the 'comma' separator", hasRightSeparator(','));
    describe("click the 'semicolon' separator", hasRightSeparator(';'));
    describe("click the 'space' separator", hasRightSeparator(' '));

    describe("changing the separator", function() {
        beforeEach(function() {
            expect(this.dialog.csv.get("types").length).toBe(5);
            this.dialog.$("input.delimiter[value=';']").click();
        });

        it("recalculates the column types", function() {
            expect(this.dialog.csv.get("types").length).toBe(1);
        });
    });

    function hasRightSeparator(separator) {
        return function() {
            beforeEach(function() {
                this.csv = newFixtures.csvImport({
                    lines: [
                        "COL1" + separator + "col2" + separator + "col3" + separator + "col_4" + separator + "Col_5",
                        "val1.1" + separator + "val1.2" + separator + "val1.3" + separator + "val1.4" + separator + "val1.5",
                        "val2.1" + separator + "val2.2" + separator + "val2.3" + separator + "val2.4" + separator + "val2.5",
                        "val3.1" + separator + "val3.2" + separator + "val3.3" + separator + "val3.4" + separator + "val3.5"
                    ]
                }, {
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

            it("updates the total columns in the progress section", function() {
                expect(this.dialog.$(".progress")).toContainTranslation("dataset.import.table.progress", { count: 0, total: 5 });
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
                    this.csv = newFixtures.csvImport({
                        lines: [
                            "COL1zcol2zcol3zcol_4zCol_5",
                            "val1.1zval1.2zval1.3zval1.4zval1.5",
                            "val2.1zval2.2zval2.3zval2.4zval2.5",
                            "val3.1zval3.2zval3.3zval3.4zval3.5"
                        ]
                    }, {
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

    it("has an auto-map link", function() {
        expect(this.dialog.$("a.automap")).toContainTranslation("dataset.import.table.automap")
    });

    describe("clicking the 'automap' link", function() {
        beforeEach(function() {
            this.dialog.$("a.automap").click();
        });

        it("selects destination columns in the dataset's DDL order", function() {
            var columnNameLinks = this.dialog.$(".column_mapping .map a");
            expect(columnNameLinks.eq(0)).toHaveText("col1");
            expect(columnNameLinks.eq(1)).toHaveText("col2");
            expect(columnNameLinks.eq(2)).toHaveText("col3");
            expect(columnNameLinks.eq(3)).toHaveText("col4");
            expect(columnNameLinks.eq(4)).toHaveText("col5");

            expect(columnNameLinks).not.toHaveClass("selection_conflict");
        });
    });

    describe("clicking the 'automap' link when the csv has fewer columns than the table", function() {
        beforeEach(function() {
            this.csv = newFixtures.csvImport({
                lines: [
                    "COL1, col2, col3",
                    "val1.1, val1.2, val1.3",
                    "val2.1, val2.2, val2.3",
                    "val3.1, val3.2, val3.3"
                ]
            }, {
                toTable: "existingTable"
            });
            this.dialog = new chorus.dialogs.ExistingTableImportCSV({csv: this.csv, datasetId: "dat-id"});
            this.server.completeFetchFor(this.dataset);
            this.dialog.render();
            this.dialog.$("a.automap").click();
        });

        it("displays the correct progress text", function() {
            expect(this.dialog.$(".progress")).toContainTranslation("dataset.import.table.progress", {count: 3, total: 3});
        });

        it("displays the correct mapping counts in the destination column menus", function() {
            this.dialog.$(".column_mapping .map a").click();
            var menu = this.qtip.find("ul");
            var counts = menu.find(".count");
            expect(counts.eq(0)).toContainText("(1)");
            expect(counts.eq(1)).toContainText("(1)");
            expect(counts.eq(2)).toContainText("(1)");
            expect(counts.eq(3)).toHaveText("");
            expect(counts.eq(4)).toHaveText("");
        });
    });

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
            });
        })

        describe("clicking a destination column menu link", function() {
            var menuLinks, menus;

            beforeEach(function() {
                menuLinks = this.dialog.$(".column_mapping .map a");
                menuLinks.click(); // just to initialize all qtips
                menus = this.qtip.find("ul");
            });

            it("populates the qtip with the destination columns and column types", function() {
                expect(menus.eq(0).find("li").length).toBe(5);
                _.each(menus.eq(0).find("li"), function(li, i) {
                    var $li = $(li);
                    var type = chorus.models.DatabaseColumn.humanTypeMap[this.columns[i].typeCategory];
                    expect($li.find("a")).toContainText("col" + (i + 1));
                    expect($li.find(".type")).toContainText(type);
                }, this);
            });

            context("selecting a destination column", function() {
                beforeEach(function() {
                    menus.eq(0).find("li:eq(1) a").click();
                });

                itSelectsDestinationColumn(0, 1, "col2");
                itHasSelectedCounts([0, 1, 0, 0, 0]);

                it("does not update the text of a different destination column link", function() {
                    expect(menuLinks.eq(1)).toContainTranslation("dataset.import.table.existing.select_one");
                    expect(menuLinks.eq(1)).not.toHaveClass("selected");
                    expect(menuLinks.eq(1)).toHaveClass("selection_conflict");
                });

                it("updates the progress tracker", function() {
                    expect(this.dialog.$(".progress")).toContainTranslation("dataset.import.table.progress", {count: 1, total: 5});
                });

                it("keeps the import button disabled", function() {
                    expect(this.dialog.$('button.submit')).toBeDisabled();
                });

                context("choosing the same destination column again", function() {
                    beforeEach(function() {
                        menus.eq(0).find("li:eq(1) a").click();
                    });

                    itSelectsDestinationColumn(0, 1, "col2");
                    itHasSelectedCounts([0, 1, 0, 0, 0]);

                    it("does not double-count the column", function() {
                        expect(menus.eq(0).find("li:eq(1) .count")).toContainText("(1)");
                        expect(this.dialog.$(".progress")).toContainTranslation("dataset.import.table.progress", {count: 1, total: 5});
                    });
                });

                context("when choosing a different destination column for the same source column", function() {
                    beforeEach(function() {
                        menus.eq(0).find("li:eq(2) a").click();
                    });

                    itSelectsDestinationColumn(0, 2, "col3")
                    itHasSelectedCounts([0, 0, 1, 0, 0]);
                });

                context("when mapping another source column to the same destination column", function() {
                    beforeEach(function() {
                        menus.eq(1).find("li:eq(1) a").click();
                    });

                    itSelectsDestinationColumn(0, 1, "col2", { conflict: true });
                    itSelectsDestinationColumn(1, 1, "col2", { conflict: true });
                    itHasSelectedCounts([0, 2, 0, 0, 0]);

                    it("updates the progress tracker", function() {
                        expect(this.dialog.$(".progress")).toContainTranslation("dataset.import.table.progress", {count: 2, total: 5});
                    })
                });

                context("when all source columns but one are mapped", function() {
                    beforeEach(function() {
                        for (var i = 0; i < 4; i++) {
                            menus.eq(i).find("li a").eq(i).click();
                        }
                    });

                    itHasSelectedCounts([1, 1, 1, 1, 0]);

                    it("the last unselected column map is still displayed with red", function() {
                        expect(menuLinks.eq(0)).toHaveClass("selected");
                        expect(menuLinks.eq(1)).toHaveClass("selected");
                        expect(menuLinks.eq(2)).toHaveClass("selected");
                        expect(menuLinks.eq(3)).toHaveClass("selected");
                        expect(menuLinks.eq(4)).toHaveClass("selection_conflict");
                    });
                });
            });

            function itSelectsDestinationColumn(sourceIndex, destinationIndex, destinationName, options) {
                it("shows the right destination column as selected", function() {
                    expect(menuLinks.eq(sourceIndex)).toHaveText(destinationName);

                    var menu = menus.eq(sourceIndex);
                    expect(menu.find(".check").not(".hidden").length).toBe(1);
                    expect(menu.find(".name.selected").length).toBe(1);
                    var selectedLi = menu.find("li[name=" + destinationName + "]");
                    expect(selectedLi.find(".check")).not.toHaveClass("hidden");
                    expect(selectedLi.find(".name")).toHaveClass("selected");
                });

                if (options && options.conflict) {
                    it("marks that source column as having a selection conflict", function() {
                        expect(menuLinks.eq(sourceIndex)).not.toHaveClass("selected");
                        expect(menuLinks.eq(sourceIndex)).toHaveClass("selection_conflict");
                    });
                } else {
                    it("marks that source column as having been mapped", function() {
                        expect(menuLinks.eq(sourceIndex)).toHaveClass("selected");
                        expect(menuLinks.eq(sourceIndex)).not.toHaveClass("selection_conflict");
                    });
                }
            }

            function itHasSelectedCounts(counts) {
                it("updates the counts in all of the menus", function() {
                    _.each(menus, function(menu) {
                        _.each($(menu).find(".count"), function(el, index) {
                            var count = counts[index];
                            if (count > 0) {
                                expect($(el).text()).toContainText("(" + count + ")");
                            }
                        });
                    });
                });
            }
        });
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
                this.dialog.$(".column_mapping .map a:eq(" + i + ")").click();
                this.qtip.find(".qtip:last .ui-tooltip-content li:eq(" + (i) + ") a").click();
                this.expectedColumnsMap.push({sourceOrder: (i + 1), targetOrder: this.columns[i].ordinalPosition})
            }
        });

        it("enables the import button", function() {
            expect(this.dialog.$('button.submit')).toBeEnabled();
        })

        context("clicking import button with invalid fields", function() {
            beforeEach(function() {
                spyOn(this.dialog.csv, "performValidation").andReturn(false);
                this.dialog.$("button.submit").click();
            });

            it("re-enables the submit button", function() {
                expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                expect(this.dialog.$("button.submit").text().trim()).toMatchTranslation("dataset.import.table.submit");
            });
        });

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
                expect(params["csvimport[fileName]"]).toBe(this.dialog.csv.get("fileName"));
                expect(params["csvimport[toTable]"]).toBe("existingTable");
                expect(params["csvimport[delimiter]"]).toBe(",");
                expect(params["csvimport[type]"]).toBe("existingTable");
                expect(params["csvimport[hasHeader]"]).toBe('true');
                expect(params["csvimport[truncate]"]).toBe('true');
                expect(JSON.parse(params["csvimport[columnsMap]"])).toEqual(this.expectedColumnsMap);

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
                    expect(chorus.router.navigate).toHaveBeenCalledWith(this.dialog.dataset.showUrl())
                });
            })

            context("when the import fails", function() {
                beforeEach(function() {
                    this.server.lastCreateFor(this.dialog.csv).failUnprocessableEntity([
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
