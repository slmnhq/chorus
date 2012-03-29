describe("chorus.dialogs.NameChorusView", function() {
    beforeEach(function() {
        stubModals();
        stubDefer();
        spyOn(CodeMirror, "fromTextArea").andCallThrough();
        this.launchElement = $("<a></a>");
        this.launchElement.data("parent", {
            sql : function(){ return "select awesome from sql"; }
        });
        this.chorusView = fixtures.datasetChorusView();
        this.dialog = new chorus.dialogs.NameChorusView({
            model: this.chorusView,
            launchElement: this.launchElement
        });
        this.dialog.launchModal();
    });

    it("has an editable CodeMirror", function() {
        expect(CodeMirror.fromTextArea.calls[0].args[1].readOnly).toBeUndefined();
    });

    it("has the correct submit button text", function() {
        expect(this.dialog.$("button.submit").text()).toMatchTranslation("dataset.name_chorus_view.create");
    });

    it("initializes the name", function() {
        expect(this.dialog.$("input[name=objectName]").val()).toBe(this.chorusView.get("objectName"))
    });

    it("starts with the submit button enabled", function() {
        expect(this.dialog.$("button.submit")).toBeEnabled();
    });

    describe("submit button disabling", function() {
        context("when the name is non-empty", function(){
            beforeEach(function() {
                this.dialog.$("input[name=objectName]").val("whatever").keyup();
            });

            it("enables the submit button", function() {
                expect(this.dialog.$("button.submit")).toBeEnabled();
            })
        })

        context("when the name is empty", function() {
            beforeEach(function() {
                this.dialog.$("input[name=objectName]").val("  ").keyup();
            });

            it("disables the submit button", function() {
                expect(this.dialog.$("button.submit")).toBeDisabled();
            });
        });
    });

    describe("editing the SQL", function() {
        beforeEach(function() {
            this.dialog.editor.setValue("newquery");
        });

        it("uses the changed SQL for the Data Preview", function() {
            this.dialog.$("button.preview").click();

            expect(this.server.lastCreate().requestBody).toContain("query=newquery");
        });
    });

    describe("creating the chorus view", function() {
        beforeEach(function() {
            spyOn(this.dialog.model, "save")
            this.dialog.$("input[name=objectName]").val(" whatever  ").keyup();
            this.dialog.editor.setValue("SELECT column1, column2 FROM other.table");
            this.dialog.$("form").submit();
        });

        it("puts the button in the loading state", function() {
            expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
            expect(this.dialog.$("button.submit").text()).toMatchTranslation("actions.creating")
        });

        it("fills in the objectName, with trim", function() {
            expect(this.dialog.model.get("objectName")).toBe("whatever")
        });

        it("uses the SQL from the form", function() {
            expect(this.dialog.model.get("query")).toBe("SELECT column1, column2 FROM other.table")
        });

        it("saves the chorus view", function() {
            expect(this.dialog.model.save).toHaveBeenCalled()
        });

        context("when chorus view creation is successful", function() {
            beforeEach(function() {
                spyOn(chorus.router, "navigate");
                spyOnEvent($(document), "close.facebox");
                this.dialog.model.set({ id: "10102" }, { silent: true })
                this.dialog.model.trigger("saved");
            });

            it("redirects to the new chorus view show page", function() {
                expect(chorus.router.navigate).toHaveBeenCalledWith(this.dialog.model.showUrl(), true);
            });

            it("dismisses the dialog", function() {
                expect("close.facebox").toHaveBeenTriggeredOn($(document))
            });
        });

        context("when chorus view creation fails", function() {
            beforeEach(function() {
                spyOn(chorus.router, "navigate");
                spyOnEvent($(document), "close.facebox");
                this.dialog.model.set({serverErrors : [
                    { message: "Hi there" }
                ]});
                this.dialog.model.trigger("saveFailed");
            });

            it("displays the error message", function() {
                expect(this.dialog.$(".errors").text()).toContain("Hi there")
            });

            it("does not dismiss the dialog", function() {
                expect("close.facebox").not.toHaveBeenTriggeredOn($(document))
            });

            it("doesn't navigate", function() {
                expect(chorus.router.navigate).not.toHaveBeenCalled();
            });

            it("stops loading", function() {
                expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
            });
        });
    });
});
