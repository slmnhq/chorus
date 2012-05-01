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
                this.dialog.model.set({ provisionType: "registerHadoop", userName: "user", userGroups: "hadoop"})
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
                expect(this.dialog.$("input[name=userName]").val()).toBe("user");
                expect(this.dialog.$("input[name=userName]").prop("disabled")).toBeFalsy();
            });

            it("has a pre-populated and enabled 'group list' field", function() {
                expect(this.dialog.$("input[name=userGroups]").val()).toBe("hadoop");
                expect(this.dialog.$("input[name=userGroups]").prop("disabled")).toBeFalsy();
            });
        });
    });

    describe("#fetchUserSet", function() {
        beforeEach(function() {
            this.dialog.users = new chorus.collections.UserSet();
        })
        context("when the instance has shared account", function() {
            beforeEach(function() {
                spyOn(this.dialog.model, "isShared").andReturn(true);
                spyOn(this.dialog.users, "fetchAll")
                this.dialog.fetchUserSet();
            });
            it("users to be fetched", function() {
                expect(this.dialog.users.fetchAll).toHaveBeenCalled();
            });
        });

        context("when the instance has individual account", function() {
            beforeEach(function() {
                spyOn(this.dialog.model, "isShared").andReturn(false);
                spyOn(this.dialog.users, "fetchAll")
                spyOn(this.dialog.accounts, "fetchAll")
                this.dialog.fetchUserSet();
            });

            it("fetches the accounts", function() {
                expect(this.dialog.users.fetchAll).not.toHaveBeenCalled();
                expect(this.dialog.accounts.fetchAll).toHaveBeenCalled();
            });

            it("fills in the users on a successful accounts fetch", function() {
                spyOn(this.dialog.users, "add").andCallThrough();

                var user1 = { id: '1', first_name: 'barnie', last_name: 'rubble' }
                var user2 = { id: '2', first_name: 'fred', last_name: 'flinstone' }

                var instanceAccounts = [
                    fixtures.instanceAccount({user: user1}),
                    fixtures.instanceAccount({user: user2})
                ];
                this.dialog.accounts.reset(instanceAccounts);
                this.dialog.accounts.trigger("reset");
                expect(this.dialog.users.add).toHaveBeenCalled();

                expect(this.dialog.users.models[0]).toBeA(chorus.models.User);
                expect(this.dialog.users.models[0].get("id")).toBe("2");
                expect(this.dialog.users.models[0].get("first_name")).toBe("fred");
                expect(this.dialog.users.models[0].get("last_name")).toBe("flinstone");

                expect(this.dialog.users.models[1]).toBeA(chorus.models.User);
                expect(this.dialog.users.models[1].get("id")).toBe("1");
                expect(this.dialog.users.models[1].get("first_name")).toBe("barnie");
                expect(this.dialog.users.models[1].get("last_name")).toBe("rubble");
            });
        });
    });

    describe("saving", function() {
        beforeEach(function() {
            this.dialog.model.set({ provisionType: "register"});
            this.user1 = new chorus.models.User({ id: '1', username: "niels", first_name: "ni", last_name: "slew"});
            this.user2 = new chorus.models.User({ id: '2', username: "ludwig", first_name: "lu", last_name: "wig" });
            this.user3 = new chorus.models.User({ id: '3', username: "isaac", first_name: "is", last_name: "ac" });
            this.dialog.users.add([ this.user1, this.user2, this.user3 ]);
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
                expect(this.server.lastUpdate().params().name).toBe("test2");
                expect(this.server.lastUpdate().params().port).toBe("8556");
                expect(this.server.lastUpdate().params().host).toBe("testhost2");
                expect(this.server.lastUpdate().params().size).toBe("123");
                expect(this.server.lastUpdate().params().maintenanceDb).toBeUndefined();
            });
        });

        context("with a hadoop instance", function() {
            beforeEach(function() {
                this.dialog.model.set({ provisionType: "registerHadoop"});
                this.dialog.render();
                this.dialog.$("input[name=name]").val("test3");
                this.dialog.$("input[name=port]").val("8557");
                this.dialog.$("input[name=host]").val("testhost3");
                this.dialog.$("input[name=userName]").val("userName");
                this.dialog.$("input[name=userGroups]").val("userGroups");
                this.dialog.$("button[type=submit]").submit();
            });

            it("updates the model", function() {
                expect(this.dialog.model.get("name")).toBe("test3");
                expect(this.dialog.model.get("port")).toBe("8557");
                expect(this.dialog.model.get("host")).toBe("testhost3");
                expect(this.dialog.model.get("userName")).toBe("userName");
                expect(this.dialog.model.get("userGroups")).toBe("userGroups");
                expect(this.dialog.model.has("maintenanceDb")).toBeFalsy();
            });
        });

        context("when save completes", function() {
            beforeEach(function() {
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
                expect(this.dialog.$("button.submit").text()).toMatchTranslation("instances.edit_dialog.save");
            });
        }
    });
});
