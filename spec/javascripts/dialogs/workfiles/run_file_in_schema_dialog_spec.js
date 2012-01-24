describe("chorus.dialogs.RunFileInSchema", function() {
    beforeEach(function() {
        chorus.page = { workspace : fixtures.workspace({ id : 999 }) };
        this.workfile = fixtures.workfile({ fileType : "SQL", workspaceId : chorus.page.workspace.get("id") });
        this.dialog = new chorus.dialogs.RunFileInSchema({ pageModel : this.workfile });
    });

    it("does not re-render when the model changes", function() {
        expect(this.dialog.persistent).toBeTruthy()
    })

    describe("#setup", function() {
        it("fetches the workspace sandbox", function() {
            expect(this.server.lastFetch().url).toBe("/edc/workspace/999/sandbox");
        })
    })

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        })

        context("before sandbox fetches complete", function() {
            it("should show loading spinner", function() {
                expect(this.dialog.$(".loading")).not.toHaveClass("hidden");
                expect(this.dialog.$(".loading").isLoading()).toBeTruthy();
            })

            it("does not show other content", function() {
                expect(this.dialog.$(".schema_picker")).toHaveClass("hidden")
            })

            it("selects 'within another schema' by default", function() {
                expect(this.dialog.$("#another_schema")).toBeChecked();
            })

            it("expands 'within another schema' by default", function() {
              expect(this.dialog.$("#another_schema")).not.toHaveClass("collapsed")
            })

            it("has the right title", function() {
                expect($(this.dialog.el).attr("title")).toMatchTranslation("workfile.run_in_schema.title")
            });

            it("has a Run File button", function() {
                expect(this.dialog.$("button.submit").text().trim()).toMatchTranslation("workfile.run_in_schema.run_file")
            })

            it("has a Cancel button", function() {
                expect(this.dialog.$("button.cancel").text().trim()).toMatchTranslation("actions.cancel")
            })

            it("disables both buttons", function() {
                expect(this.dialog.$("button.submit")).toBeDisabled();
                expect(this.dialog.$("button.cancel")).toBeDisabled();
            })
        })

        context("after sandbox fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(fixtures.sandbox({
                    databaseName : "database",
                    instanceName : "instance",
                    schemaName : "schema",
                    workspaceId : 999
                }));
            });

            it("displays the canonical name for the sandbox schema", function() {
                expect(this.dialog.$(".name").text().trim()).toBe("instance / database / schema")
            })

            describe("clicking on 'within the workspace sandbox'", function() {
                beforeEach(function() {
                    this.dialog.$("input#sandbox_schema").click();
                })

                it("collapses 'within another schema", function() {
                    expect(this.dialog.$(".another_schema")).toHaveClass("collapsed")
                })

                describe("clicking on 'within another schema'", function() {
                    beforeEach(function() {
                        this.dialog.$("input#another_schema").click();
                    })

                    it("expands 'within another schema'", function() {
                        expect(this.dialog.$(".another_schema")).not.toHaveClass("collapsed");
                    })
                })
            })
        })
    })
});
