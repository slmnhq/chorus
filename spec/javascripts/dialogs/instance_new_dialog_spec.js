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

        context("when aurora is installed", function() {
            beforeEach(function() {
                this.dialog.model.aurora().set({ installationStatus : "install_succeed"});
                this.dialog.render();
            });

            it("enables create a new Greenplum database instance", function() {
                expect(this.dialog.$(".create_new_greenplum input[type=radio]")).not.toBeDisabled();
            });

            it("shows the correct text", function() {
                expect(this.dialog.$("label[for=create_new_greenplum]").text()).toMatchTranslation("instances.new_dialog.create_new_greenplum")
            });

            it("doesn't have class disabled", function() {
                expect(this.dialog.$("label[for=create_new_greenplum]")).not.toHaveClass("disabled");
            });
        });

        context("when aurora is not installed", function() {
            beforeEach(function() {
                this.dialog.model.aurora().set({ installationStatus : "not_installed"});
                this.dialog.render();
            });

            it("enables create a new Greenplum database instance", function() {
                expect(this.dialog.$(".create_new_greenplum input[type=radio]")).toBeDisabled();
            });

            it("shows the correct text", function() {
                expect(this.dialog.$("label[for=create_new_greenplum]").text()).toMatchTranslation("instances.new_dialog.create_new_greenplum_disabled");
            });

            it("have class disabled", function() {
                expect(this.dialog.$("label[for=create_new_greenplum]")).toHaveClass("disabled");
            });
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
                    this.dialog.$("input[type=radio]").eq(2).attr('checked', true).change();

                    expect(this.dialog.$("fieldset").not(".collapsed").length).toBe(1);
                    expect(this.dialog.$("input[type=radio]:checked").closest("fieldset")).not.toHaveClass("collapsed");
                });
            });
        });

        describe("submitting the form", function() {
            beforeEach(function() {
                this.dialog.model.aurora().set({ installationStatus : "install_succeed"});
                this.dialog.render();
            });
            context("using register existing greenplum", function() {
                beforeEach(function() {
                    this.dialog.$(".register_existing_greenplum input[type=radio]").attr('checked', true).change();

                    this.dialog.$(".register_existing_greenplum input[name=name]").val("Instance_Name");
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
                    expect(attrs.name).toBe("Instance_Name");
                    expect(attrs.provisionType).toBe("register");
                    expect(attrs.description).toBe("Instance Description");
                });

                testUpload();
            });

            context("using a new Greenplum database instance", function() {
                beforeEach(function() {
                    this.dialog.$(".create_new_greenplum input[type=radio]").attr('checked', true).change();
                    this.dialog.$(".create_new_greenplum input[name=name]").val("new_greenplum_instance");
                    this.dialog.$(".create_new_greenplum textarea[name=description]").val("Instance Description");
                    this.dialog.$(".create_new_greenplum input[name=size]").val("1");
                    this.dialog.$(".create_new_greenplum input[name=databaseName]").val("dbTest");
                    this.dialog.$(".create_new_greenplum input[name=schemaName]").val("schemaTest");
                });


                context("saving", function() {
                    beforeEach(function() {
                        spyOn(this.dialog.model, "save").andCallThrough();
                    });

                    it("calls save on the dialog's model", function() {
                        this.dialog.$("button.submit").click();
                        expect(this.dialog.model.save).toHaveBeenCalled();

                        var attrs = this.dialog.model.save.calls[0].args[0];

                        expect(attrs.size).toBe("1");
                        expect(attrs.name).toBe("new_greenplum_instance");
                        expect(attrs.provisionType).toBe("create");
                        expect(attrs.description).toBe("Instance Description");
                        expect(attrs.databaseName).toBe("dbTest");
                        expect(attrs.schemaName).toBe("schemaTest");
                    });

                    context("when other forms fields from registering an existing greenplum are filled", function() {
                        beforeEach(function() {
                            this.dialog.$("button.submit").click();

                            this.dialog.$(".register_existing_greenplum input[name=name]").val("existing");
                            this.dialog.$(".register_existing_greenplum textarea[name=description]").val("existing description");
                            this.dialog.$(".register_existing_greenplum input[name=host]").val("foo.bar");
                        });
                        it("sets only the fields for create new greenplum instance and calls save", function() {
                            expect(this.dialog.model.save).toHaveBeenCalled();

                            var attrs = this.dialog.model.save.calls[0].args[0];

                            expect(attrs.size).toBe("1");
                            expect(attrs.name).toBe("new_greenplum_instance");
                            expect(attrs.provisionType).toBe("create");
                            expect(attrs.description).toBe("Instance Description");
                            expect(attrs.host).toBeUndefined();
                        });
                    });
                });

                testUpload();
            });

            context("when the form is not valid", function() {
                    beforeEach(function() {
                        spyOn(Backbone.Model.prototype, 'save');
                        this.dialog.$(".create_new_greenplum input[name=name]").val("");
                        this.dialog.$(".create_new_greenplum input[name=size]").val("a");
                        this.dialog.$("button.submit").click();
                    });

                    it("doesn't complete a save", function() {
                        expect(Backbone.Model.prototype.save).not.toHaveBeenCalled();
                    });
                    it("clears the error when clicking on another radio", function() {
                        this.dialog.$(".register_existing_greenplum input[type=radio]").attr('checked', true).change();

                        expect(this.dialog.$(".has_error").length).toBe(0);

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