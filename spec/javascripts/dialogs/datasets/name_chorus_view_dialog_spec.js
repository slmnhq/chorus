describe("chorus.dialogs.NameChorusView", function() {
    beforeEach(function() {
        stubModals();
        this.chorusView = fixtures.datasetChorusView();
        this.dialog = new chorus.dialogs.NameChorusView({ model: this.chorusView});
        this.dialog.render();
    });

    it("has the right title", function() {
        expect(this.dialog.$("h1").text()).toMatchTranslation("dataset.name_chorus_view.title");
    });

    it("has the correct submit button text", function() {
        expect(this.dialog.$("button.submit").text()).toMatchTranslation("dataset.name_chorus_view.create");
    })

    it("initializes the name", function() {
        expect(this.dialog.$("input[name=name]").val()).toBe(this.chorusView.get("objectName"))
    })

    it("starts with the submit button enabled", function() {
        expect(this.dialog.$("button.submit")).toBeEnabled();
    });

    describe("submit button disabling", function() {
        context("when the name is non-empty", function(){
            beforeEach(function() {
                this.dialog.$("input[name=name]").val("whatever").keyup();
            });

            it("enables the submit button", function() {
                expect(this.dialog.$("button.submit")).toBeEnabled();
            })
        })

        context("when the name is empty", function() {
            beforeEach(function() {
                this.dialog.$("input[name=name]").val("  ").keyup();
            });

            it("disables the submit button", function() {
                expect(this.dialog.$("button.submit")).toBeDisabled();
            })
        })
    })

    describe("creating the chorus view", function() {
        beforeEach(function() {
            spyOn(this.dialog.model, "save")
            this.dialog.$("input[name=name]").val(" whatever  ").keyup();
            this.dialog.$("button.submit").click();
        });

        it("puts the button in the loading state", function() {
            expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
            expect(this.dialog.$("button.submit").text()).toMatchTranslation("actions.creating")
        });

        it("fills in the objectName, with trim", function() {
            expect(this.dialog.model.get("objectName")).toBe("whatever")
        })

        it("saves the chorus view", function() {
            expect(this.dialog.model.save).toHaveBeenCalled()
        })

        context("when chorus view creation is successful", function() {
            beforeEach(function() {
                spyOn(chorus.router, "navigate");
                spyOnEvent($(document), "close.facebox");
                this.dialog.model.set({ id: "10102" }, { silent: true })
                this.dialog.model.trigger("saved");
            })

            it("redirects to the new chorus view show page", function() {
                expect(chorus.router.navigate).toHaveBeenCalledWith(this.dialog.model.showUrl(), true);
            });

            it("dismisses the dialog", function() {
                expect("close.facebox").toHaveBeenTriggeredOn($(document))
            })
        })

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
            })

            it("doesn't navigate", function() {
                expect(chorus.router.navigate).not.toHaveBeenCalled();
            })
        })
    })
});
