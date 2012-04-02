describe("chorus.models.User", function() {
    var models = chorus.models;
    beforeEach(function() {
        this.model = new models.User();
    });

    it("has the correct showUrlTemplate", function() {
        expect(this.model.showUrlTemplate).toBe("users/{{id}}");
    });

    it("has the correct urlTemplate", function() {
        expect(this.model.urlTemplate).toBe("user/{{id}}");
    });

    describe("#workspaces", function() {
        beforeEach(function() {
            this.user = new models.User({userName: "dr_charlzz", id: "457"});
            this.workspaces = this.user.workspaces();
        });

        it("returns an instance of WorkspaceSet", function() {
            expect(this.workspaces instanceof chorus.collections.WorkspaceSet).toBeTruthy();
        });

        it("returns the same instance every time", function() {
            expect(this.user.workspaces()).toBe(this.workspaces);
        });

        context("when the workspaces instance raises its reset event", function() {
            it("raises the changed event on the user instance", function() {
                spyOnEvent(this.user, "change");
                this.workspaces.trigger("reset");
                expect("change").toHaveBeenTriggeredOn(this.user);
            });

            it("only fires the change event once, even if the method was called multiple times", function() {
                this.user.workspaces();
                this.user.workspaces();
                var spy = jasmine.createSpy("changeHandler");
                this.user.bind("change", spy);
                this.workspaces.trigger("reset");
                expect(spy.calls.length).toBe(1);
            });
        });

        context("when fetched", function() {
            beforeEach(function() {
                this.workspaces.fetch();
            });

            it("hits the right url for that user", function() {
                var expectedUrl = "/edc/workspace/?user=457&page=1&rows=50";
                expect(this.server.requests[0].url).toBe(expectedUrl);
            });
        });
    });

    describe("#activeWorkspaces", function() {
        beforeEach(function() {
            this.user = new models.User({userName: "dr_charlzz", id: "457"});
            this.workspaces = this.user.activeWorkspaces();
        });

        it("returns an instance of WorkspaceSet", function() {
            expect(this.workspaces instanceof chorus.collections.WorkspaceSet).toBeTruthy();
        });

        it("returns the same instance every time", function() {
            expect(this.user.activeWorkspaces()).toBe(this.workspaces);
        });

        context("when fetched", function() {
            beforeEach(function() {
                this.workspaces.fetch();
            });

            it("hits the right url for that user", function() {
                var expectedUrl = "/edc/workspace/?user=457&page=1&rows=50&active=true";
                expect(this.server.requests[0].url).toMatchUrl(expectedUrl);
            });
        });
    });

    describe("#savePassword", function() {
        it("PUTs to the right URL", function() {
            this.model = fixtures.user({id: 42})
            this.model.savePassword({
                password: "w1zZz4rd",
                passwordConfirmation: "w1zZz4rd"
            });
            expect(_.last(this.server.requests).url).toBe("/edc/user/42/password");
        });
    });

    describe("#destroy", function() {
        it("should make a delete request", function() {
            //testing that the idAttribute is set properly
            this.model.set({ id: "27" });
            this.model.destroy();
            expect(this.server.requests[0].url).toBe(this.model.url());
        });
    });

    describe("validation", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
            spyOn(this.model, "requirePattern").andCallThrough();
            spyOn(this.model, "requireConfirmation").andCallThrough();
        });

        it("should return a truthy value for a valid user", function() {
            this.model.set(fixtures.userJson());
            this.model.set({ password: "foo", passwordConfirmation: "foo" });
            expect(this.model.performValidation()).toBeTruthy();
        });

        _.each(["firstName", "lastName", "userName", "password"], function(attr) {
            it("requires " + attr, function() {
                this.model.performValidation();
                expect(this.model.require).toHaveBeenCalledWith(attr, undefined);
            });
        });

        it("requires emailAddress", function() {
            this.model.performValidation();
            expect(this.model.requirePattern).toHaveBeenCalledWith("emailAddress", /[\w\.-]+(\+[\w-]*)?@([\w-]+\.)+[\w-]+/, undefined);
        });


        context("when the user is new", function() {
            beforeEach(function() {
                this.model = new chorus.models.User();
                this.model.set({
                    firstName: "bob",
                    lastName: "jenkins",
                    userName: "bobjenk",
                    emailAddress: "bobj@raisetheroof.us"
                });
            });

            context("when there is a password confirmation", function() {
                it("returns true", function() {
                    this.model.set({ password: "secret", passwordConfirmation: "secret" });
                    expect(this.model.performValidation()).toBeTruthy();
                });
            });

            context("when there is no password confirmation", function() {
                it("returns false", function() {
                    this.model.set({ password: "secret" });
                    expect(this.model.performValidation()).toBeFalsy();
                });
            });
        });

        context("when the user is in LDAP", function() {
            beforeEach(function() {
                this.model = new chorus.models.User();
                this.model.set({
                    firstName: "bob",
                    lastName: "jenkins",
                    userName: "bobjenk",
                    emailAddress: "bobj@raisetheroof.us"
                });
                this.model.ldap = true;
            });

            it("does not require the password", function() {
                expect(this.model.performValidation()).toBeTruthy();
            });

            it("does still require the other stuff", function() {
                this.model.set({
                    firstName: null,
                    lastName: "",
                    userName: "",
                    emailAddress: "bob@bob.com"
                });
                expect(this.model.performValidation()).toBeFalsy();
            })

        })

        context("when the user is already saved", function() {
            beforeEach(function() {
                this.model = new chorus.models.User();
                this.model.set({
                    id: 5,
                    firstName: "bob",
                    lastName: "jenkins",
                    userName: "bobjenk",
                    password: "original_password",
                    passwordConfirmation: "original_password",
                    emailAddress: "bobj@raisetheroof.us"
                });
                this.model.save();
                this.model.change();
            });

            context("when the password has not changed", function() {
                it("returns true", function() {
                    expect(this.model.performValidation({ emailAddress: "bobjanky@coolpalace.us" })).toBeTruthy();
                });
            });

            context("when the password has changed and no confirmation is specified", function() {
                it("returns false", function() {
                    expect(this.model.performValidation({password: "new_password", passwordConfirmation: ""})).toBeFalsy();
                });
            });
        });
    });

    describe("#imageUrl", function() {
        beforeEach(function() {
            spyOn(chorus, "cachebuster").andReturn(12345)
        });

        it("uses the right URL", function() {
            var user = new models.User({userName: 'foo', id: "bar"});
            expect(user.imageUrl()).toBe("/edc/userimage/bar?size=original&iebuster=12345");
        });

        it("accepts the size argument", function() {
            var user = new models.User({userName: 'foo', id: "bar"});
            expect(user.imageUrl({size: "icon"})).toBe("/edc/userimage/bar?size=icon&iebuster=12345");
        });
    });

    describe("#picklistImageUrl", function() {
        it("uses the right URL", function() {
            var user = new models.User({userName: 'foo', id: "bar"});
            expect(user.picklistImageUrl()).toBe(user.imageUrl({ size: "original" }));
        });
    })

    describe("#displayName", function() {
        beforeEach(function() {
            this.model.set({ firstName: "Danny", lastName: "Burkes" });
        })

        it("returns the full name", function() {
            expect(this.model.displayName()).toBe("Danny Burkes");
        })

        context("when firstName and lastName are blank, but fullName exists", function() {
            it("uses fullName", function() {
                var user = fixtures.user({
                    firstName: '',
                    lastName: '',
                    fullName: 'SomeGuy'
                });
                expect(user.displayName()).toBe('SomeGuy');
            });
        })
    })

    describe("displayShortName", function() {
        context("with a short user name", function() {
            beforeEach(function() {
                this.model.set({firstName: "Party", lastName: "Man"});
            })
            it("displays the normal display name", function() {
                expect(this.model.displayShortName(20)).toBe(this.model.displayName());
            });
        });

        context("where the full name is longer than the allowed length", function() {
            beforeEach(function() {
                this.model.set({firstName: "Party", lastName: "ManiManiManiManiManiManiMani"});
            })
            it("displays the normal display name", function() {
                expect(this.model.displayShortName(20)).toBe("Party M.");
            });
        });
    })
});
