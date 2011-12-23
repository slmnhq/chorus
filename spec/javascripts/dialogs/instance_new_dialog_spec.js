describe("InstanceNewDialog", function() {
    beforeEach(function() {
        this.launchElement = $("<button/>");
        this.dialog = new chorus.dialogs.InstancesNew({launchElement : this.launchElement});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        });

        it("starts with no radio buttons selected", function() {
            expect(this.dialog.$("input[type=radio]:checked").length).toBe(0);
        });

        it("starts with all fieldsets collapsed", function() {
            expect(this.dialog.$("fieldset").not(".collapsed").length).toBe(0);
        });

        it("starts with the submit button disabled", function() {
            expect(this.dialog.$("button.submit").attr("disabled")).toBe("disabled");
        });

        describe("selecting a radio button", function() {
            beforeEach(function() {
                // Only setting attr("checked", true) doesn't raise change event.
                this.dialog.$("input[type=radio]").eq(0).attr('checked', true).change();
            });

            it("removes the collapsed class from only that radio button", function() {
                expect(this.dialog.$("fieldset").not(".collapsed").length).toBe(1);
                expect(this.dialog.$("input[type=radio]:checked").closest("fieldset")).not.toHaveClass("collapsed");
            });

            it("enables the submit button", function() {
                expect(this.dialog.$("button.submit")).not.toHaveAttr("disabled");
            });

            context("clicking another radio", function() {
                it("has only one that is not collapsed", function() {
                    this.dialog.$("input[type=radio]").eq(0).attr('checked', false).change();
                    this.dialog.$("input[type=radio]").eq(1).attr('checked', true).change();

                    expect(this.dialog.$("fieldset").not(".collapsed").length).toBe(1);
                    expect(this.dialog.$("input[type=radio]:checked").closest("fieldset")).not.toHaveClass("collapsed");
                });
            });
        });

        describe("submitting the form", function() {
            context("using register existing greenplum", function() {
                beforeEach(function() {
                    this.dialog.$(".register_existing_greenplum input[type=radio]").attr('checked', true).change();

                    this.dialog.$(".register_existing_greenplum input[name=name]").val("Instance Name");
                    this.dialog.$(".register_existing_greenplum textarea[name=description]").val("Instance Description");
                    this.dialog.$(".register_existing_greenplum input[name=host]").val("foo.bar");
                    this.dialog.$(".register_existing_greenplum input[name=port]").val("1234");
                    this.dialog.$(".register_existing_greenplum input[name=dbUserName]").val("user");
                    this.dialog.$(".register_existing_greenplum input[name=dbPassword]").val("my_password");

                    spyOn(this.dialog.model, "save").andCallThrough();
                });

                it("calls save on the dialog's model", function() {
                    this.dialog.$("button.submit").click();
                    expect(this.dialog.model.save).toHaveBeenCalled();

                    var attrs = this.dialog.model.save.calls[0].args[0];

                    expect(attrs.dbPassword).toBe("my_password");
                    expect(attrs.name).toBe("Instance Name");
                    expect(attrs.provisionType).toBe("register");
                    expect(attrs.description).toBe("Instance Description");
                });

                context("when the form is not valid", function() {
                    beforeEach(function() {
                        spyOn(Backbone.Model.prototype, 'save');

                        this.dialog.$(".register_existing_greenplum input[name=port]").val("not a port");
                        this.dialog.$("button.submit").click();
                    });

                    it("doesn't complete a save", function() {
                        expect(Backbone.Model.prototype.save).not.toHaveBeenCalled();
                    });
                });

                context("#upload", function() {
                    beforeEach(function() {
                        this.dialog.$("button.submit").click();
                    });

                    it("puts the button in 'loading' mode", function() {
                        expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
                    });

                    it("changes the text on the upload button to 'saving'", function() {
                        expect(this.dialog.$("button.submit").text()).toMatchTranslation("instances.new_dialog.saving");
                    });

                    it("disables the cancel button", function() {
                        expect(this.dialog.$("button.cancel").attr("disabled")).toBe("disabled");
                    });

                    context("when save completes", function() {
                        beforeEach(function() {
                            this.doneSpy = jasmine.createSpy("save done");
                            chorus.page = new chorus.pages.Base();
                            chorus.page.bind("instance:added", this.doneSpy);
                            spyOn(this.dialog, "closeModal");

                            this.dialog.model.set({id: "123"});
                            this.dialog.model.trigger("saved");
                        });

                        it("closes the dialog", function() {
                            expect(this.dialog.closeModal).toHaveBeenCalled();
                        });

                        it("raises the instance:added event", function() {
                            expect(this.doneSpy).toHaveBeenCalledWith("123");
                        });
                    });

                    context("when the upload gives a server error", function() {
                        beforeEach(function() {
                            this.dialog.model.set({serverErrors : [
                                { message: "foo" }
                            ]});
                            this.dialog.model.trigger("saveFailed");
                        });

                        it("display the correct error", function() {
                            expect(this.dialog.$(".errors").text()).toContain("foo");
                        });

                        itRecoversFromError();
                    });

                    context("when the validation fails", function() {
                        beforeEach(function() {
                            this.dialog.model.trigger("validationFailed");
                        });

                        itRecoversFromError();
                    });

                    function itRecoversFromError() {
                        it("takes the button out of 'loading' mode", function() {
                            expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                        });

                        it("sets the button text back to 'Uploading'", function() {
                            expect(this.dialog.$("button.submit").text()).toMatchTranslation("instances.new_dialog.save");
                        });
                    }
                });
            });
        });
    });
});