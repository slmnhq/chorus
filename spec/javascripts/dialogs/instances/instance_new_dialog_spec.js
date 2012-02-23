describe("chorus.dialogs.InstanceNew", function() {
    beforeEach(function() {
        this.launchElement = $("<button/>");
        this.dialog = new chorus.dialogs.InstancesNew({launchElement: this.launchElement});
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
            expect(this.dialog.$("button.submit")).toBeDisabled();
        });

        describe("selecting the 'register an existing instance' radio button", function() {
            beforeEach(function() {
                this.dialog.$("input[type=radio]#register_existing_greenplum").attr('checked', true).change();
            });

            it("un-collapses the 'register an existing instance' fieldset", function() {
                expect(this.dialog.$("fieldset").not(".collapsed").length).toBe(1);
                expect(this.dialog.$("fieldset.register_existing_greenplum")).not.toHaveClass("collapsed");
            });

            it("enables the submit button", function() {
                expect(this.dialog.$("button.submit")).toBeEnabled();
            });

            it("uses 'postgres' as the default database name", function() {
                expect(this.dialog.$(".register_existing_greenplum input[name=maintenanceDb]").val()).toBe("postgres");
            });

            describe("filling out the form", function() {
                beforeEach(function() {
                    this.dialog.$(".register_existing_greenplum input[name=name]").val("Instance_Name");
                    this.dialog.$(".register_existing_greenplum textarea[name=description]").val("Instance Description");
                    this.dialog.$(".register_existing_greenplum input[name=host]").val("foo.bar");
                    this.dialog.$(".register_existing_greenplum input[name=port]").val("1234");
                    this.dialog.$(".register_existing_greenplum input[name=dbUserName]").val("user");
                    this.dialog.$(".register_existing_greenplum input[name=dbPassword]").val("my_password");
                    this.dialog.$(".register_existing_greenplum input[name=maintenanceDb]").val("foo");

                    this.dialog.$(".register_existing_greenplum input[name=name]").trigger("change");
                });

                it("should return the values in fieldValues", function() {
                    var values = this.dialog.fieldValues();
                    expect(values.name).toBe("Instance_Name");
                    expect(values.description).toBe("Instance Description");
                    expect(values.host).toBe("foo.bar");
                    expect(values.port).toBe("1234");
                    expect(values.dbUserName).toBe("user");
                    expect(values.dbPassword).toBe("my_password");
                    expect(values.maintenanceDb).toBe("foo");
                });
            });
        });

        describe("submitting the form", function() {
            context("using register existing greenplum database", function() {
                beforeEach(function() {
                    this.dialog.$(".register_existing_greenplum input[type=radio]").attr('checked', true).change();
                });

                context("after filling in the form", function() {
                    beforeEach(function() {
                        this.dialog.$(".register_existing_greenplum input[name=name]").val("Instance_Name");
                        this.dialog.$(".register_existing_greenplum textarea[name=description]").val("Instance Description");
                        this.dialog.$(".register_existing_greenplum input[name=host]").val("foo.bar");
                        this.dialog.$(".register_existing_greenplum input[name=port]").val("1234");
                        this.dialog.$(".register_existing_greenplum input[name=dbUserName]").val("user");
                        this.dialog.$(".register_existing_greenplum input[name=dbPassword]").val("my_password");
                        this.dialog.$(".register_existing_greenplum input[name=maintenanceDb]").val("foo");

                        this.dialog.$(".register_existing_greenplum input[name=name]").trigger("change");

                        spyOn(this.dialog.model, "save").andCallThrough();
                    });

                    it("calls save on the dialog's model", function() {
                        this.dialog.$("button.submit").click();
                        expect(this.dialog.model.save).toHaveBeenCalled();

                        var attrs = this.dialog.model.save.calls[0].args[0];

                        expect(attrs.dbPassword).toBe("my_password");
                        expect(attrs.name).toBe("Instance_Name");
                        expect(attrs.provisionType).toBe("register");
                        expect(attrs.description).toBe("Instance Description");
                        expect(attrs.maintenanceDb).toBe("foo");
                    });

                    testUpload();
                });
            });

            context("when the form is not valid", function() {
                beforeEach(function() {
                    this.dialog.$(".register_existing_greenplum input[type=radio]").attr('checked', true).change();
                    spyOn(Backbone.Model.prototype, 'save');
                    this.dialog.$("button.submit").click();
                });

                it("doesn't complete a save", function() {
                    expect(Backbone.Model.prototype.save).not.toHaveBeenCalled();
                });
            });

            function testUpload() {
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
                            spyOn(chorus.PageEvents, 'broadcast');
                            spyOn(this.dialog, "closeModal");

                            this.dialog.model.set({id: "123"});
                            this.dialog.model.trigger("saved");
                        });

                        it("closes the dialog", function() {
                            expect(this.dialog.closeModal).toHaveBeenCalled();
                        });

                        it("publishes the 'instance:added' page event", function() {
                            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("instance:added");
                        });
                    });

                    context("when the upload gives a server error", function() {
                        beforeEach(function() {
                            this.dialog.model.set({serverErrors: [
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
            }
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
            expect(this.qtipCall.args[0].content).toMatchTranslation("instances.new_dialog.register_existing_greenplum_help_text");
        });
    });
});
