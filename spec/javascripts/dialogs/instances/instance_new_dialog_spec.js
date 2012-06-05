describe("chorus.dialogs.InstancesNew", function() {
    beforeEach(function() {
        this.launchElement = $("<button/>");
        this.dialog = new chorus.dialogs.InstancesNew({launchElement: this.launchElement});
        $('#jasmine_content').append(this.dialog.el);
    });

    it("calls Config.instance to pre-fetch the config data", function() {
        expect(this.dialog.requiredResources.models).toContain(chorus.models.Config.instance());
    });

    it("fetches the aurora install status", function() {
        expect(chorus.models.GreenplumInstance.aurora()).toHaveBeenFetched();
    });

    context("when aurora is installed", function() {
        beforeEach(function() {
            chorus.models.GreenplumInstance.aurora().set({ installationStatus: "install_succeed" });
            this.dialog = new chorus.dialogs.InstancesNew();
            this.dialog.render();
        });

        it("shows the 'create a new Greenplum database instance' option", function() {
            expect(this.dialog.$(".create_new_greenplum input[type=radio]")).toExist();
        });

        context("when the aurora status fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(chorus.models.GreenplumInstance.aurora());
            });

            it("shows the correct text", function() {
                expect(this.dialog.$("label[for=create_new_greenplum]").text()).toMatchTranslation("instances.new_dialog.create_new_greenplum")
            });

            it("defaults the schema name to 'public'", function() {
                expect(this.dialog.$(".create_new_greenplum input[name='schemaName']").val()).toBe("public");
            });

            it("doesn't have class disabled", function() {
                expect(this.dialog.$("label[for=create_new_greenplum]")).not.toHaveClass("disabled");
            });

            it("displays the maximum allowable size", function() {
                expect(this.dialog.$(".create_new_greenplum ")).toContainTranslation("instances.new_dialog.max_size");
            });

            it("fetches the aurora templates", function() {
                expect(chorus.models.GreenplumInstance.auroraTemplates()).toHaveBeenFetched();
            });

            context("when the aurora template fetch completes", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(chorus.models.GreenplumInstance.auroraTemplates(), [
                        newFixtures.provisioningTemplate({name: "Small"}),
                        newFixtures.provisioningTemplate({name: "Medium"}),
                        newFixtures.provisioningTemplate({name: "Large"})
                    ]);
                });

                it("populates the template select box", function() {
                    expect(this.dialog.$("select option").length).toBe(3);
                });
            });
        });
    });

    context("when aurora is not installed", function() {
        beforeEach(function() {
            chorus.models.GreenplumInstance.aurora().set({ installationStatus: "not_installed" });
            this.dialog = new chorus.dialogs.InstancesNew();
            this.dialog.render();
        });

        it("does not show the 'create a new Greenplum database instance' option", function() {
            expect(this.dialog.$(".create_new_greenplum input[type=radio]")).not.toExist();
        });

        describe("when the fetches complete", function() {
            beforeEach(function() {
                this.server.completeFetchFor(chorus.models.GreenplumInstance.aurora());
                this.server.completeFetchFor(chorus.models.Config.instance());
            });

            it("has radio buttons for 'register an existing instance' and 'register hadoop file system'", function() {
                expect(this.dialog.$("input[type=radio]").length).toBe(2);
                expect(this.dialog.$("label[for=register_existing_greenplum]").text()).toMatchTranslation("instances.new_dialog.register_existing_greenplum");
                expect(this.dialog.$("label[for=register_existing_hadoop]").text()).toMatchTranslation("instances.new_dialog.register_existing_hadoop");
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
                        this.dialog.$(".register_existing_greenplum input[name=dbUsername]").val("user");
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
                        expect(values.dbUsername).toBe("user");
                        expect(values.dbPassword).toBe("my_password");
                        expect(values.maintenanceDb).toBe("foo");
                    });
                });
            });

            describe("selecting the 'register a hadoop file system' radio button", function() {
                beforeEach(function() {
                    this.dialog.$("input[type=radio]#register_existing_hadoop").attr('checked', true).change();
                });

                it("un-collapses the 'register a hadoop file system' fieldset", function() {
                    expect(this.dialog.$("fieldset").not(".collapsed").length).toBe(1);
                    expect(this.dialog.$("fieldset.register_existing_hadoop")).not.toHaveClass("collapsed");
                });

                it("enables the submit button", function() {
                    expect(this.dialog.$("button.submit")).toBeEnabled();
                });

                describe("filling out the form", function() {
                    beforeEach(function() {
                        var form = this.dialog.$(".register_existing_hadoop");
                        form.find("input[name=name]").val("Instance_Name");
                        form.find("textarea[name=description]").val("Instance Description");
                        form.find("input[name=host]").val("foo.bar");
                        form.find("input[name=port]").val("1234");
                        form.find("input.username").val("user");
                        form.find("input.group_list").val("hadoop");

                        form.find("input[name=name]").trigger("change");
                    });

                    it("#fieldValues returns the values", function() {
                        var values = this.dialog.fieldValues();
                        expect(values.name).toBe("Instance_Name");
                        expect(values.description).toBe("Instance Description");
                        expect(values.host).toBe("foo.bar");
                        expect(values.port).toBe("1234");
                        expect(values.username).toBe("user");
                        expect(values.groupList).toBe("hadoop");
                    });

                    it("#fieldValues should have the right values for 'provision_type' and 'shared'", function() {
                        var values = this.dialog.fieldValues();
                        expect(values.shared).toBe("true");
                    });
                });
            });
        });
    });

    describe("submitting the form", function() {
        beforeEach(function() {
            this.dialog.render();
            chorus.models.GreenplumInstance.aurora().set({ installationStatus: "install_succeed" });
            this.server.completeFetchFor(chorus.models.Config.instance());
            this.server.completeFetchFor(chorus.models.GreenplumInstance.aurora());
            this.server.completeFetchFor(chorus.models.GreenplumInstance.auroraTemplates(), [
                newFixtures.provisioningTemplate({name: "small"}),
                newFixtures.provisioningTemplate({name: "median"}),
                newFixtures.provisioningTemplate({name: "large"})
            ]);
        });

        context("when registering a hadoop instance", function() {
            beforeEach(function() {
                var hadoopSection = this.dialog.$("fieldset.register_existing_hadoop")
                hadoopSection.find("input[type=radio]").attr('checked', true).change();

                hadoopSection.find("input[name=name]").val("Instance_Name");
                hadoopSection.find("textarea[name=description]").val("Instance Description");
                hadoopSection.find("input[name=host]").val("foo.bar");
                hadoopSection.find("input[name=port]").val("1234");
                hadoopSection.find("input.username").val("user");
                hadoopSection.find("input.group_list").val("hadoop").change();

                spyOn(chorus.models.HadoopInstance.prototype, "save").andCallThrough();
                this.dialog.$("button.submit").click();
            });

            it("creates a hadoop instance model with the right data and saves it", function() {
                var instance = this.dialog.model;
                expect(instance.save).toHaveBeenCalled();

                expect(instance.get("name")).toBe("Instance_Name");
                expect(instance.get("description")).toBe("Instance Description");
                expect(instance.get("host")).toBe("foo.bar");
                expect(instance.get("port")).toBe("1234");
                expect(instance.get("username")).toBe("user");
                expect(instance.get("groupList")).toBe("hadoop");
            });
        });

        context("using register existing greenplum database", function() {
            beforeEach(function() {
                section = this.dialog.$(".register_existing_greenplum");
                section.find("input[type=radio]").attr('checked', true).change();
                section.find("input[name=name]").val("Instance_Name");
                section.find("textarea[name=description]").val("Instance Description");
                section.find("input[name=host]").val("foo.bar");
                section.find("input[name=port]").val("1234");
                section.find("input[name=dbUsername]").val("user");
                section.find("input[name=dbPassword]").val("my_password");
                section.find("input[name=maintenanceDb]").val("foo");
                section.find("input[name=name]").trigger("change");

                spyOn(chorus.models.GreenplumInstance.prototype, "save").andCallThrough();
            });


            it("calls save on the dialog's model", function() {
                this.dialog.$("button.submit").click();
                expect(this.dialog.model.save).toHaveBeenCalled();

                var attrs = this.dialog.model.save.calls[0].args[0];

                expect(attrs.dbPassword).toBe("my_password");
                expect(attrs.name).toBe("Instance_Name");
                expect(attrs.provision_type).toBe("register");
                expect(attrs.description).toBe("Instance Description");
                expect(attrs.maintenanceDb).toBe("foo");
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
                this.dialog.$(".create_new_greenplum input[name=dbUsername]").val("edcadmin");
                this.dialog.$(".create_new_greenplum input[name=dbPassword]").val("supersecret");
                this.dialog.$(".create_new_greenplum select").val("large");

                spyOn(chorus.models.GreenplumInstance.prototype, "save").andCallThrough();
                spyOn(chorus, "toast");
            });

            context("saving", function() {
                beforeEach(function() {
                    this.dialog.$("button.submit").click();
                });

                it("saves the dialog's model", function() {
                    expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
                    expect(this.dialog.model.save).toHaveBeenCalled();

                    var attrs = this.dialog.model.save.calls[0].args[0];

                    expect(attrs.size).toBe("1");
                    expect(attrs.name).toBe("new_greenplum_instance");
                    expect(attrs.provision_type).toBe("create");
                    expect(attrs.description).toBe("Instance Description");
                    expect(attrs.databaseName).toBe("dbTest");
                    expect(attrs.schemaName).toBe("schemaTest");
                    expect(attrs.dbUsername).toBe("edcadmin");
                    expect(attrs.dbPassword).toBe("supersecret");
                    expect(attrs.template).toBe("large");

                    expect(chorus.toast).not.toHaveBeenCalledWith("instances.new_dialog.provisioning")
                });

                describe("when the save completes successfully", function() {
                    beforeEach(function() {
                        spyOn(chorus.router, "navigate");
                        this.server.lastCreateFor(this.dialog.model).succeed({id: 123});
                    });

                    it("display the toast message", function() {
                        expect(chorus.toast).toHaveBeenCalledWith("instances.new_dialog.provisioning")
                    })

                    it("navigates to the instance list", function() {
                        expect(chorus.router.navigate).toHaveBeenCalledWith("/instances", {selectId: 123});
                    });
                });

                describe("when the save fails", function() {
                    beforeEach(function() {
                        this.server.lastCreateFor(this.dialog.model).failUnprocessableEntity({ fields: { a: { BLANK: {} } } });
                    });

                    it("displays the errors", function() {
                        expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                        expect(this.dialog.$(".errors")).toContainText("A can't be blank");
                    });
                });

                context("when other forms fields from registering an existing greenplum are filled", function() {
                    beforeEach(function() {
                        this.dialog.$("button.submit").click();

                        this.dialog.$(".create_new_greenplum input[name=name]").val("existing");
                        this.dialog.$(".create_new_greenplum textarea[name=description]").val("existing description");
                        this.dialog.$(".create_new_greenplum input[name=host]").val("foo.bar");
                    });

                    it("sets only the fields for create new greenplum instance and calls save", function() {
                        expect(this.dialog.model.save).toHaveBeenCalled();

                        var attrs = this.dialog.model.save.calls[0].args[0];

                        expect(attrs.size).toBe("1");
                        expect(attrs.name).toBe("new_greenplum_instance");
                        expect(attrs.provision_type).toBe("create");
                        expect(attrs.description).toBe("Instance Description");
                        expect(attrs.host).toBeUndefined();
                    });
                });
            });

            testUpload();
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

                it("does not disable the cancel button", function() {
                    expect(this.dialog.$("button.cancel")).not.toBeDisabled();
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

                    it("publishes the 'instance:added' page event with the new instance's id", function() {
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("instance:added", this.dialog.model);
                    });
                });

                context("when the upload gives a server error", function() {
                    beforeEach(function() {
                        this.dialog.model.set({serverErrors: { fields: { a: { BLANK: {} } } }});
                        this.dialog.model.trigger("saveFailed");
                    });

                    it("display the correct error", function() {
                        expect(this.dialog.$(".errors").text()).toContain("A can't be blank");
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
