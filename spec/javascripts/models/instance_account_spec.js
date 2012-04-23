describe("chorus.models.InstanceAccount", function() {
    beforeEach(function() {
        this.model = fixtures.instanceAccount({ id: '72', instanceId: '1045', userId: "1011" });
    });

    describe("#url", function() {
        context("when updating or deleting", function() {
            it("has the right url for accessing an account by its id", function() {
                expect(this.model.url({ method: 'update' })).toMatchUrl("/edc/instance/accountmap/72");
                expect(this.model.url({ method: 'delete' })).toMatchUrl("/edc/instance/accountmap/72");
            });
        });

        context("when creating", function() {
            it("has the base url for accounts (no id)", function() {
                expect(this.model.url({ method: 'create' })).toMatchUrl("/edc/instance/accountmap");
            });
        });

        context("when fetching", function() {
            it("has the right url for fetching an account by user id and instance id", function() {
                expect(this.model.url({ method: 'read' })).toMatchUrl("/edc/instance/accountmap?instanceId=1045&userId=1011");
            });
        });
    });

    describe("#user", function() {
        beforeEach(function() {
            this.model.set({"user": {
                firstName: "Ricardo",
                lastName: "Henderson",
                id: "45",
                userId: "45"
            }})
        });

        it("returns a user", function() {
            expect(this.model.user()).toBeA(chorus.models.User);
        });

        it("sets the name and id fields based on the account's information", function() {
            expect(this.model.user().get("firstName")).toBe("Ricardo");
            expect(this.model.user().get("lastName")).toBe("Henderson");
            expect(this.model.user().get("id")).toBe("45");
            expect(this.model.user().get("userId")).toBe("45");
        });

        context("when the account doesn't have a user", function() {
            beforeEach(function() {
                this.model.unset("user");
            });

            it("returns undefined", function() {
                expect(this.model.user()).toBeUndefined();
            });
        });
    });

    describe("#fetchByInstanceId", function() {
        it("hits the correct url", function() {
            chorus.models.InstanceAccount.findByInstanceId("4");
            expect(this.server.requests[0].url).toMatchUrl("/edc/instance/accountmap?instanceId=4")
        })

        it("returns an InstanceAccount", function() {
            var model = chorus.models.InstanceAccount.findByInstanceId("4");
            expect(model instanceof chorus.models.InstanceAccount).toBeTruthy()
        })
    })

    describe("validations", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
        });

        it("requires dbUserName", function() {
            this.model.unset("dbUserName");
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("dbUserName", undefined);
        });

        context("when the account already exists and the password is NOT being changed", function() {
            it("does not require a dbPassword", function() {
                this.model.unset("dbPassword");
                this.model.performValidation();
                expect(this.model.isValid()).toBeTruthy();
            });
        });

        context("when the account is being created", function() {
            it("requires a dbPassword", function() {
                this.model = new chorus.models.InstanceAccount({ dbUserName: "ilikecoffee" });
                this.model.performValidation();
                expect(this.model.isValid()).toBeFalsy();
            });
        });

        context("when the account already exists and the password is being changed", function() {
            it("requires a dbPassword", function() {
                this.model.performValidation({ dbPassword: "" });
                expect(this.model.isValid()).toBeFalsy();
            });
        });

        context("when the instance account is a shared account", function() {
            beforeEach(function() {
                this.model = fixtures.instanceAccount({ shared : "yes" })
            });

            describe("and it is changed to an individual account", function() {
                beforeEach(function() {
                    this.model.unset("dbUserName");
                })

                it("does not require dbUserName", function() {
                    this.model.performValidation({ shared : "no" })
                    expect(this.model.isValid()).toBeTruthy();
                })
            })
        })
    })
});
