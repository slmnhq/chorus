describe("chorus.dialogs.InstanceEdit", function() {
    beforeEach(function() {
        this.launchElement = $("<button/>");
        this.instance = newFixtures.instance.greenplum({
            name: "pasta",
            host: "greenplum",
            port: "8555",
            description: "it is a food name",
            maintenanceDb: "postgres"
        });
        this.launchElement.data("instance", this.instance);
        this.dialog = new chorus.dialogs.InstanceEdit({launchElement: this.launchElement});
    });

    it("should make a copy of the source model", function() {
        expect(this.dialog.model).not.toBe(this.instance);
        expect(this.dialog.model.attributes).toEqual(this.instance.attributes);
    });

    describe("#render", function() {
        describe("when editing a registered instance", function() {
            beforeEach(function() {
                this.dialog.model.set({ provisionType: "register"})
                this.dialog.render();
            });

            it("Field called 'name' should be editable and pre populated", function() {
                expect(this.dialog.$("input[name=name]").val()).toBe("pasta");
                expect(this.dialog.$("input[name=name]").prop("disabled")).toBeFalsy();
            })

            it("Field called 'description' should be editable and pre populated", function() {
                expect(this.dialog.$("textarea[name=description]").val()).toBe("it is a food name");
                expect(this.dialog.$("textarea[name=description]").prop("disabled")).toBeFalsy();
            })

            it("Field called 'host' should be editable and pre populated", function() {
                expect(this.dialog.$("input[name=host]").val()).toBe("greenplum");
                expect(this.dialog.$("input[name=host]").prop("disabled")).toBeFalsy();
            })

            it("Field called 'port' should be editable and pre populated", function() {
                expect(this.dialog.$("input[name=port]").val()).toBe("8555");
                expect(this.dialog.$("input[name=port]").prop("disabled")).toBeFalsy();
            });

            it("has a 'database' field that is pre-populated", function() {
                expect(this.dialog.$("input[name='maintenanceDb']").val()).toBe("postgres");
                expect(this.dialog.$("label[name='maintenanceDb']").text()).toMatchTranslation("instances.dialog.database_name");
                expect(this.dialog.$("input[name='maintenanceDb']").prop("disabled")).toBeFalsy();
            });
        });

        describe("when editing a provisioned instance", function() {
            beforeEach(function() {
                this.dialog.model.set({ provisionType: "create", size: "10"})
                this.dialog.render();
            });

            it("Field called 'Names' should be editable and pre populated", function() {
                expect(this.dialog.$("input[name=name]").val()).toBe("pasta");
                expect(this.dialog.$("input[name=name]").prop("disabled")).toBeFalsy();
            })

            it("Field called 'description' should be editable and pre populated", function() {
                expect(this.dialog.$("textarea[name=description]").val()).toBe("it is a food name");
                expect(this.dialog.$("textarea[name=description]").prop("disabled")).toBeFalsy();
            })

            it("Field called 'host' should not be editable and pre populated", function() {
                expect(this.dialog.$("input[name=host]").val()).toBe("greenplum");
                expect(this.dialog.$("input[name=host]").prop("disabled")).toBeTruthy();
            })

            it("Field called 'port' should not be editable and pre populated", function() {
                expect(this.dialog.$("input[name=port]").val()).toBe("8555");
                expect(this.dialog.$("input[name=port]").prop("disabled")).toBeTruthy();
            })

            it("Field called 'size' should not be editable and pre populated", function() {
                expect(this.dialog.$("input[name=size]").val()).toBe("10");
                expect(this.dialog.$("input[name=size]").prop("disabled")).toBeTruthy();
            })
        });

        describe("when editing a hadoop instance", function() {
            beforeEach(function() {
                this.dialog.model.set({ username: "user", groupList: "hadoop"})
                this.dialog.model = new chorus.models.HadoopInstance(this.dialog.model.attributes);
                this.dialog.render();
            });

            it("has a pre-populated and enabled 'name' field", function() {
                expect(this.dialog.$("input[name=name]").val()).toBe("pasta");
                expect(this.dialog.$("input[name=name]").prop("disabled")).toBeFalsy();
            })

            it("has a pre-populated and enabled 'description' field", function() {
                expect(this.dialog.$("textarea[name=description]").val()).toBe("it is a food name");
                expect(this.dialog.$("textarea[name=description]").prop("disabled")).toBeFalsy();
            })

            it("has a pre-populated and enabled 'host' field", function() {
                expect(this.dialog.$("input[name=host]").val()).toBe("greenplum");
                expect(this.dialog.$("input[name=host]").prop("disabled")).toBeFalsy();
            })

            it("has a pre-populated and enabled 'port' field", function() {
                expect(this.dialog.$("input[name=port]").val()).toBe("8555");
                expect(this.dialog.$("input[name=port]").prop("disabled")).toBeFalsy();
            });

            it("has a pre-populated and enabled 'HDFS account' field", function() {
                expect(this.dialog.$("input[name=username]").val()).toBe("user");
                expect(this.dialog.$("input[name=username]").prop("disabled")).toBeFalsy();
            });

            it("has a pre-populated and enabled 'group list' field", function() {
                expect(this.dialog.$("input[name=groupList]").val()).toBe("hadoop");
                expect(this.dialog.$("input[name=groupList]").prop("disabled")).toBeFalsy();
            });
        });
    });

    describe("saving", function() {
        beforeEach(function() {
            this.dialog.model.set({ provisionType: "register"});
            this.dialog.render();

            spyOn(this.dialog, "closeModal");
            spyOn(chorus, "toast");

            this.dialog.$("input[name=name]").val("test1");
            this.dialog.$("input[name=port]").val("8555");
            this.dialog.$("input[name=host]").val("testhost");
            this.dialog.$("input[name=maintenanceDb]").val("not_postgres");
        });

        it("puts the button in 'loading' mode", function() {
            spyOn(this.dialog.model, "save");
            this.dialog.$("button[type=submit]").submit();
            expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
        });

        it("should call the save method", function() {
            spyOn(this.dialog.model, "save");
            this.dialog.$("button[type=submit]").submit();
            expect(this.dialog.model.save).toHaveBeenCalled();
        });

        it("should call save with the right parameters ( to make sure that we pass in the provisionType for validation )", function() {
            spyOn(this.dialog.model, "save").andCallThrough();
            this.dialog.$("button[type=submit]").submit();

            expect(this.dialog.model.save.argsForCall[0][0].name).toBe("test1");
            expect(this.dialog.model.save.argsForCall[0][0].port).toBe("8555");
            expect(this.dialog.model.save.argsForCall[0][0].host).toBe("testhost");
            expect(this.dialog.model.save.argsForCall[0][0].maintenanceDb).toBe("not_postgres");
            expect(this.dialog.model.save.argsForCall[0][0].provisionType).toBe("register");
        });

        it("saves silently (to prevent re-rendering in aurora instances)", function() {
            this.dialog.model.set({ provisionType: "create"});
            this.dialog.render();
            spyOn(this.dialog.model, "save");
            this.dialog.$("button.submit").submit();
            expect(this.dialog.model.save.calls[0].args[1]).toEqual({silent: true});
        });

        it("changes the text on the upload button to 'saving'", function() {
            spyOn(this.dialog.model, "save");
            this.dialog.$("button[type=submit]").submit();
            expect(this.dialog.$("button.submit").text()).toMatchTranslation("instances.new_dialog.saving");
        });

        it("disables the cancel button", function() {
            spyOn(this.dialog.model, "save");
            this.dialog.$("button[type=submit]").submit();
            expect(this.dialog.$("button.cancel")).toBeDisabled();
        });

        context("with a provisioned instance", function() {
            beforeEach(function() {
                this.dialog.model.set({ provisionType: "create"});
                this.dialog.render();
                this.dialog.$("input[name=name]").val("test2");
                this.dialog.$("input[name=port]").val("8556");
                this.dialog.$("input[name=host]").val("testhost2");
                this.dialog.$("input[name=size]").val("123");
                this.dialog.$("button[type=submit]").submit();
            });

            it("updates the model", function() {
                expect(this.server.lastUpdate().params()["instance[name]"]).toBe("test2");
                expect(this.server.lastUpdate().params()["instance[port]"]).toBe("8556");
                expect(this.server.lastUpdate().params()["instance[host]"]).toBe("testhost2");
                expect(this.server.lastUpdate().params()["instance[size]"]).toBe("123");
                expect(this.server.lastUpdate().params()["instance[maintenanceDb]"]).toBeUndefined();
            });
        });

        context("with a hadoop instance", function() {
            beforeEach(function() {
                this.dialog.model = new chorus.models.HadoopInstance();
                this.dialog.render();
                this.dialog.$("input[name=name]").val("test3");
                this.dialog.$("input[name=port]").val("8557");
                this.dialog.$("input[name=host]").val("testhost3");
                this.dialog.$("input[name=username]").val("username");
                this.dialog.$("input[name=groupList]").val("groupList");
                this.dialog.$("button[type=submit]").submit();
            });

            it("updates the model", function() {
                expect(this.dialog.model.get("name")).toBe("test3");
                expect(this.dialog.model.get("port")).toBe("8557");
                expect(this.dialog.model.get("host")).toBe("testhost3");
                expect(this.dialog.model.get("username")).toBe("username");
                expect(this.dialog.model.get("groupList")).toBe("groupList");
                expect(this.dialog.model.has("maintenanceDb")).toBeFalsy();
            });
        });

        context("when save completes", function() {
            beforeEach(function() {
                this.dialog.$("button.submit").submit()
                spyOnEvent(this.instance, "change")
                this.dialog.model.trigger("saved");
            });

            it("displays toast message", function() {
                expect(chorus.toast).toHaveBeenCalled();
            });

            it("closes the dialog", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });

            it("triggers change on the source model", function() {
                expect("change").toHaveBeenTriggeredOn(this.instance);
            })
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
                expect(this.dialog.$("button.submit").text()).toMatchTranslation("instances.edit_dialog.save");
            });
        }
    });
});
