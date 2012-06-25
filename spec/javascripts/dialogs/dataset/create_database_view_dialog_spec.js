describe("chorus.dialogs.CreateDatabaseView", function() {
    beforeEach(function() {
        this.dataset = fixtures.chorusView({workspace: {id: "42"}});
        this.schema = rspecFixtures.schema();
        spyOn(this.schema, "canonicalName").andReturn("I.D.S");
        spyOn(this.dataset, "schema").andReturn(this.schema);
        this.launchElement = $("<a data-dialog='CreateDatabaseView'></a>")
        this.view = new chorus.dialogs.CreateDatabaseView({
            launchElement: this.launchElement,
            pageModel: this.dataset
        });
        this.view.render();
    });

    it("should have the correct title", function() {
        expect(this.view.$("h1")).toContainTranslation("create_database_view.title");
    });

    it('should have a close link', function() {
        var $cancelButton = this.view.$('.modal_controls .cancel')
        expect($cancelButton).toContainTranslation("actions.cancel");
    });

    it("should have a submit button that starts out disabled", function() {
        expect(this.view.$("button.submit")).toContainTranslation("create_database_view.submit");
    });

    it("shows the target schema", function() {
        expect(this.view.$(".target_location")).toContainTranslation("create_database_view.target");
        expect(this.view.$(".target_location .target_location_value")).toContainText("I.D.S");
    });

    it("has an input for the name", function() {
        expect(this.view.$("input").attr("placeholder")).toMatchTranslation("create_database_view.name");
        expect(this.view.$("input#create_database_view_name")).toExist();
    });

    describe("validation", function() {
        var invalids = ["something_UPPERCASE", "1234"];

        _.each(invalids, function(input) {
            it("does not accept " + input + " as valid input", function() {
                this.server.reset();
                this.view.$("#create_database_view_name").val(input);
                this.view.$("button.submit").click();

                expect(this.view.$("#create_database_view_name")).toHaveClass("has_error");
                expect(this.server.requests.length).toBe(0);
            });
        });
    });

    describe("input", function() {
        describe("invalid input", function() {
            beforeEach(function() {
                this.view.$("input#create_database_view_name").val("0123");
                this.view.$("button.submit").click();
            });

            it("rejects names that don't match the ChorusIdentifier64 rules", function() {
                expect(this.view.$("input#create_database_view_name")).toHaveClass("has_error");
            });

            itAcceptsValidInput();
        });

        itAcceptsValidInput();

        function itAcceptsValidInput() {
            describe("valid input", function() {
                beforeEach(function() {
                    this.server.reset();
                    this.view.$("input#create_database_view_name").val("a_name");
                    this.view.$("form").submit();
                });

                it("accepts names that match the ChorusIdentifier64 rules", function() {
                    expect(this.view.$("input#create_database_view_name")).not.toHaveClass("has_error");
                    expect(this.view.$("button.submit").isLoading()).toBeTruthy();
                    expect(this.view.$("button.submit")).toContainTranslation("actions.creating");

                    expect(this.view.model.get("objectName")).toBe("a_name");
                    expect(this.view.model).toHaveBeenCreated();
                });

                context("save succeeds", function() {
                    it("shows a toast", function() {
                        spyOn(chorus, "toast");
                        this.server.completeSaveFor(this.view.model, {id: 'foo', workspace: {id: 25} });
                        expect(chorus.toast).toHaveBeenCalledWith("create_database_view.toast_success", {
                            viewName: "a_name",
                            canonicalName: "I.D.S"
                        });
                    });

                    context("and returned data includes a workspace", function() {
                        it("navigates to show page of new db view", function() {
                            spyOn(chorus.router, 'navigate')
                            this.server.completeSaveFor(this.view.model, {id: 'foo', workspace: {id: 25} });
                            expect(chorus.router.navigate).toHaveBeenCalledWith("#/workspaces/25/datasets/foo");
                        });
                    });

                    context("and returned data does not have a workspace", function() {
                        it("uses the Chorus View's workspace to navigate to the show page of the new db view", function() {
                            spyOn(chorus.router, 'navigate')
                            this.server.completeSaveFor(this.view.model, { id: 'foo' });
                            expect(chorus.router.navigate).toHaveBeenCalledWith("#/workspaces/42/datasets/foo");
                        });
                    });
                });

                it("save fails", function() {
                    this.server.lastCreateFor(this.view.model).failUnprocessableEntity({ fields: { a: { BLANK: {} } } });
                    expect(this.view.$(".errors")).toContainText("A can't be blank");
                    expect(this.view.$("button.submit").isLoading()).toBeFalsy();
                });
            });
        }
    });
});