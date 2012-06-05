describe("chorus.dialogs.CreateDirectoryExternalTableFromHdfs", function() {
    beforeEach(function() {

        this.collection = fixtures.csvHdfsFileSet(null, {hadoopInstance: {id : "234"}}).filesOnly();
        this.csv = new chorus.models.CsvHdfs({lines: [
            "COL1,col2, col3 ,col 4,Col_5",
            "val1.1,val1.2,val1.3,val1.4,val1.5",
            "val2.1,val2.2,val2.3,val2.4,val2.5",
            "val3.1,val3.2,val3.3,val3.4,val3.5"
        ],
//            hadoopInstance: {id : "234"},
//            path: "/foo/bar.txt",
            name: "bar.csv"
        });

        this.collection.at(0).set(this.csv);
        this.dialog = new chorus.dialogs.CreateDirectoryExternalTableFromHdfs({
            workspaceName: "workspace1",
            workspaceId: "22",
            directoryName: "test",
            collection: this.collection
        });
    });

    it("does not include a header row", function() {
        expect(this.dialog.includeHeader).toBeFalsy();
    });

    describe("#setup", function() {
        it("sets csv to be the first models in the collection", function() {
            expect(this.dialog.csv).toEqual(this.collection.at(0))
        });
    });

    describe("#setupCsv", function () {
        context("when the directory path is /", function() {
            beforeEach(function() {
                this.dialog.collection.attributes.path = "/";
                this.dialog.setupCsv();
            });
            it("prevents an extra / from being included in the file path", function() {
                expect(this.dialog.csv.get("path")).toBe("/bar.csv");
            });

        });

        it("sets the toTable, instanceId and file path to the model", function() {
            expect(this.dialog.csv.get("toTable")).toBe("test");
            expect(this.dialog.csv.get("instanceId")).toBe("234");
            expect(this.dialog.csv.get("path")).toBe("/data/bar.csv");
        });
    });

    describe("#render", function () {
        beforeEach(function() {
            this.dialog.render();
        });

        it("populates the table name with the directory name", function() {
            expect(this.dialog.$("input[name=toTable]").val()).toBe("test")
        });

        it("populates the select sample file with hdfs text files", function() {
            expect(this.dialog.$("select option").length).toBe(3);
        })

        it("selects the all files option by default", function() {
            expect(this.dialog.$('input:radio[name=pathType]:checked').val()).toBe("directory");
        });

        it("creates a textbox for the file expression", function() {
            expect(this.dialog.$("[name=expression]")).toExist();
        });

        describe("changing the file", function () {
            beforeEach(function() {
                spyOn(chorus, 'styleSelect')
                this.dialog.$("input[name='expression']").val("*.csv")
                this.dialog.$("input#pattern").prop("checked", "checked").change();
                var selElement = this.dialog.$("select").val(this.collection.at(1).get("name"))
                selElement.change();
            });
            it("should fetch the new sample", function() {
                expect(this.server.lastFetch().url).toBe("/data/"+this.collection.attributes.hadoopInstance.id+"/hdfs/"+
                    encodeURIComponent(this.collection.at(1).get("path")) + "/sample")
            });
            it("display spinner", function() {
                expect(this.dialog.$(".data_table").isLoading()).toBeTruthy();
            });

            context("when the fetch completes", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.dialog.csv, this.csv);
                });

                it("stops the spinner", function() {
                    expect(this.dialog.$(".data_table").isLoading()).toBeFalsy();
                });
                it("display the correct toTable name", function() {
                    expect(this.dialog.$("input[name=toTable]").val()).toBe("test")
                });

                it("display the correct elements", function() {
                    expect(this.dialog.$("input[name='expression']").val()).toBe("*.csv");
                    expect(this.dialog.$("input#pattern:checked")).toBeTruthy();
                    expect(this.dialog.$(".field_name input").eq(0).val()).toBe("column_1");
                });

                it("uses the custom styleSelect", function() {
                    expect(chorus.styleSelect).toHaveBeenCalled();
                });
            });
        });

        context("clicking submit", function() {
            context("with invalid values", function() {
                beforeEach(function() {
                    this.dialog.$(".directions input:text").val("");
                    this.dialog.$("button.submit").click();
                });

                it("marks the table name as having an error", function() {
                    expect(this.dialog.$(".directions input:text")).toHaveClass("has_error");
                });
            });

            context("with an invalid file name expression", function() {
                it("succeeds when the pathType expression is not checked even if no match", function() {
                    this.dialog.$("input[name='expression']").val(".*.txt");
                    this.dialog.$("button.submit").click();
                    expect(this.dialog.$("input[name='expression']")).not.toHaveClass("has_error");
                });

                it("fails validation when the current sample does not match the expression", function() {
                    this.dialog.$("input#directory").removeAttr('checked');
                    this.dialog.$("input#pattern").attr('checked', 'checked').change();
                    this.dialog.$("input[name='expression']").val(".*.txt");
                    this.dialog.$("button.submit").click();
                    expect(this.dialog.$("input[name='expression']")).toHaveClass("has_error");
                });

                it("fails validation when the current sample does match the expression", function() {

                    this.dialog.$("input[name='expression']").val("*.csv");
                    this.dialog.$("button.submit").click();
                    expect(this.dialog.$("input[name='expression']")).not.toHaveClass("has_error");
                });
            });

            context("when importing an entire directory", function() {
                beforeEach(function() {
                    this.dialog.$("input#directory").attr('checked', 'checked');
                    this.dialog.$('button.submit').click();
                });

                it("starts the loading spinner", function() {
                    expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
                    expect(this.dialog.$("button.submit")).toContainTranslation("hdfs.create_external.creating")
                });

                it("posts to the right URL", function() {
                    var request = this.server.lastCreate();
                    var statement = "test (column_1 text, column_2 text, column_3 text, column_4 text, column_5 text)";

                    expect(request.url).toMatchUrl("/workspace/22/externaltable");

                    expect(request.params()['csv_hdfs[path]']).toBe("/data");
                    expect(request.params()['csv_hdfs[instance_id]']).toBe("234");
                    expect(request.params()['csv_hdfs[statement]']).toBe(statement);
                    expect(request.params()['csv_hdfs[path_type]']).toBe('directory');
                });

                context("when the post to import responds with success", function() {
                    beforeEach(function() {
                        spyOn(this.dialog, "closeModal");
                        spyOn(chorus, 'toast');
                        spyOn(chorus.PageEvents, 'broadcast');
                        this.server.lastCreate().succeed();
                    });

                    it("closes the dialog and displays the right toast", function() {
                        expect(this.dialog.closeModal).toHaveBeenCalled();
                        expect(chorus.toast).toHaveBeenCalledWith("hdfs.create_external.success", {tableName: this.dialog.$("input:text").eq(0).val(), workspaceName: "workspace1"});
                    });

                    it("triggers csv_import:started", function() {
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("csv_import:started");
                    });
                })
            });

            context("when importing only files that match a pattern", function() {
                beforeEach(function() {
                    this.dialog.$("input#directory").removeAttr('checked');
                    this.dialog.$("input#pattern").attr('checked', 'checked').change();
                    this.dialog.$("input[name='expression']").val("*.csv");
                    this.dialog.$('button.submit').click();
                });

                it("posts to the right URL", function() {
                    var request = this.server.lastCreate();

                    expect(request.url).toMatchUrl("/workspace/22/externaltable");
                    expect(request.params()['csv_hdfs[path_type]']).toBe('pattern');
                    expect(request.params()['csv_hdfs[path]']).toBe("/data/*.csv");
                });
            })

            context("when the server responds with errors", function() {
                beforeEach(function() {
                    this.$type = this.dialog.$(".th .type").eq(1);
                    this.$type.find(".chosen").click();
                    this.$type.find(".popup_filter li").eq(3).find("a").click();
                    this.dialog.$("input[name=toTable]").val("testisgreat").change();
                    this.dialog.$(".field_name input").eq(0).val("gobbledigook").change();
                    this.dialog.$("button.submit").click();

                    this.server.lastCreate().fail();
                    this.dialog.csv.serverErrors = [{message: "I like Cheese"}];
                });

                it("has no validation errors", function() {
                    expect(this.dialog.$(".has_error").length).toBe(0)
                });

                it("retains column names", function() {
                    expect(this.dialog.$(".field_name input").eq(0).val()).toBe("gobbledigook");
                });

                it("retains the table name", function() {
                    expect(this.dialog.$("input[name=toTable]").val()).toBe("testisgreat");
                });

                it("retains the data types", function() {
                    this.$type = this.dialog.$(".th .type").eq(1);
                    expect(this.$type.find(".chosen")).toHaveText("date");
                    expect(this.$type).toHaveClass("date");
                });
            });
        });
    });

    describe("select styling", function() {
        it("uses custom styled select box", function() {
            spyOn(chorus, 'styleSelect')
            $(document).trigger("reveal.facebox");
            expect(chorus.styleSelect).toHaveBeenCalled();
        });
    });

    describe("the help text tooltip", function() {
        beforeEach(function() {
            spyOn($.fn, 'qtip');
            this.dialog.render();
            this.qtipCall = $.fn.qtip.calls[0];
        });

        it("makes a tooltip for each help", function() {
            expect($.fn.qtip).toHaveBeenCalled();
            expect(this.qtipCall.object).toBe(".help");
        });

        it("renders a help text", function() {
            expect(this.qtipCall.args[0].content).toMatchTranslation("hdfs_instance.create_external.specify_expression_help_text");
        });
    });
});
