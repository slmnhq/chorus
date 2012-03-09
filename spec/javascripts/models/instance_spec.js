describe("chorus.models.Instance", function() {
    beforeEach(function() {
        this.instance = fixtures.instance({id: 1});
    });

    describe("showUrl", function() {
        it("links to the database index page", function() {
            expect(this.instance.showUrl()).toBe("#/instances/1/databases");
        });

        context("for a hadoop instance", function() {
            beforeEach(function() {
                this.instance = fixtures.hadoopInstance();
            });

            it("links to the root of the hadoop instance", function() {
                expect(this.instance.showUrl()).toBe("#/instances/" + this.instance.get('id') + "/browse/");
            })
        });
    });

    it("has a valid url", function() {
        expect(this.instance.url()).toBe("/edc/instance/" + this.instance.get('id'));
    });

    describe("#stateIconUrl", function() {
        it("returns the right url for 'fault' instances", function() {
            this.instance.set({ state: "fault" });
            expect(this.instance.stateIconUrl()).toBe("/images/instances/red.png");
        });

        it("returns the right url for online instances", function() {
            this.instance.set({ state: "online" });
            expect(this.instance.stateIconUrl()).toBe("/images/instances/green.png");
        });

        it("returns the right url for other instances", function() {
            this.instance.set({ state: null });
            expect(this.instance.stateIconUrl()).toBe("/images/instances/unknown.png");
        });
    });

    describe("#providerIconUrl", function() {
        it("returns the right url for greenplum instances", function() {
            this.instance.set({ instanceProvider: "Greenplum Database" });
            expect(this.instance.providerIconUrl()).toBe("/images/instances/greenplum_instance.png");
        });

        it("returns the right url for hadoop instances", function() {
            this.instance.set({ instanceProvider: "Hadoop" });
            expect(this.instance.providerIconUrl()).toBe("/images/instances/hadoop_instance.png");
        });

        it("returns the right url for other instances", function() {
            this.instance.set({ instanceProvider: "Something Else" });
            expect(this.instance.providerIconUrl()).toBe("/images/instances/other_instance.png");
        });
    });

    describe(".aurora", function() {
        beforeEach(function() {
            this.aurora = chorus.models.Instance.aurora();
        });

        it("returns a provisioning object", function() {
            expect(this.aurora).toBeA(chorus.models.Provisioning);
        });

        it("sets the 'provisionerPluginName' and 'type'", function() {
            expect(this.aurora.get("provisionerPluginName")).toBe("A4CProvisioner");
            expect(this.aurora.get("type")).toBe("install");
        });

        it("memoizes", function() {
            expect(this.aurora).toBe(chorus.models.Instance.aurora());
        });
    });

    describe("#owner", function() {
        it("returns a user", function() {
            var owner = this.instance.owner();
            expect(owner.get("id")).toBe(this.instance.get("ownerId"));
            expect(owner.get("userName")).toBe("edcadmin");
            expect(owner.get("fullName")).toBe("EDC Admin");
        })
    });

    describe("#isOwner", function() {
        it("returns true if object has same id", function() {
            var owner = this.instance.owner();
            var otherOwnerUser = fixtures.user({id: owner.get('id')});
            expect(this.instance.isOwner(otherOwnerUser)).toBeTruthy();
        })
        it("returns false if id is different", function() {
            var otherOwnerUser = fixtures.user({id: 'notanowner'});
            expect(this.instance.isOwner(otherOwnerUser)).toBeFalsy();
        })
        it("returns false if object is of different type", function() {
            var owner = this.instance.owner();
            var brokenParameter = fixtures.instance({id: owner.get('id')});
            expect(this.instance.isOwner(brokenParameter)).toBeFalsy();
        })
    });

    describe("#accountForUser", function() {
        beforeEach(function() {
            this.user = fixtures.user();
            this.account = this.instance.accountForUser(this.user);
        });

        it("returns an InstanceAccount", function() {
            expect(this.account).toBeA(chorus.models.InstanceAccount);
        });

        it("sets the instance id", function() {
            expect(this.account.get("instanceId")).toBe(this.instance.get("id"));
        });

        it("sets the user name based on the current user", function() {
            expect(this.account.get("userName")).toBe(this.user.get("userName"));
        });
    });

    describe("#accountForCurrentUser", function() {
        beforeEach(function() {
            this.currentUser = fixtures.user();
            setLoggedInUser(this.currentUser.attributes);
        });

        it("memoizes", function() {
            var account = this.instance.accountForCurrentUser();
            expect(account).toBe(this.instance.accountForCurrentUser());
        });

        context("when the account is destroyed", function() {
            it("un-memoizes the account", function() {
                var previousAccount = this.instance.accountForCurrentUser();
                previousAccount.trigger("destroy");

                var account = this.instance.accountForCurrentUser();
                expect(account).not.toBe(previousAccount);
            });

            it("triggers 'change' on the instance", function() {
                spyOnEvent(this.instance, 'change');
                this.instance.accountForCurrentUser().trigger("destroy");
                expect("change").toHaveBeenTriggeredOn(this.instance);
            });
        });
    });

    describe("#accountForOwner", function() {
        beforeEach(function() {
            this.owner = this.instance.owner();
            this.account1 = fixtures.instanceAccount();
            this.account2 = fixtures.instanceAccount({
                user: this.owner.attributes
            })
            this.accounts = fixtures.instanceAccountSet([this.account1, this.account2]);
            spyOn(this.instance, "accounts").andReturn(this.accounts);
        });

        it("returns the account for the owner", function() {
            expect(this.instance.accountForOwner()).toBeA(chorus.models.InstanceAccount);
            expect(this.instance.accountForOwner()).toBe(this.account2);
        });
    });

    describe("#accounts", function() {
        beforeEach(function() {
            this.instanceAccounts = this.instance.accounts();
        })

        it("returns an InstanceAccountSet", function() {
            expect(this.instanceAccounts).toBeA(chorus.collections.InstanceAccountSet)
        });

        it("sets the instance id", function() {
            expect(this.instanceAccounts.attributes.instanceId).toBe(this.instance.get('id'));
        });

        it("memoizes", function() {
            expect(this.instanceAccounts).toBe(this.instance.accounts());
        });
    });

    describe("#databases", function() {
        beforeEach(function() {
            this.databases = this.instance.databases();
        })

        it("returns an DatabaseSet", function() {
            expect(this.databases).toBeA(chorus.collections.DatabaseSet)
        });

        it("sets the instance id", function() {
            expect(this.databases.attributes.instanceId).toBe(this.instance.get('id'));
        });

        it("memoizes", function() {
            expect(this.databases).toBe(this.instance.databases());
        });
    });

    describe("#sharedAccount", function() {
        context("when the instance has a shared account", function() {
            beforeEach(function() {
                this.instance = fixtures.instanceWithSharedAccount();
            });

            it("returns a instanceAccount based on the dbUserName of the instance", function() {
                var sharedAccount = this.instance.sharedAccount();
                expect(sharedAccount).toBeA(chorus.models.InstanceAccount);
                expect(sharedAccount.get('dbUserName')).toBe(this.instance.get('sharedAccount').dbUserName);
                expect(sharedAccount.get('instanceId')).toBe(this.instance.get('id'));
            });

            it("is a model in the same instance's #accounts collection'", function() {
                var account = this.instance.sharedAccount();
                expect(account.collection).toBe(this.instance.accounts());
                expect(this.instance.accounts().first()).toBe(account);
            });

            it("memoizes", function() {
                var sharedAccount = this.instance.sharedAccount();
                expect(sharedAccount).toBe(this.instance.sharedAccount());
            });
        });

        context("when the instance does not have a shared account", function() {
            it("returns undefined", function() {
                expect(this.instance.sharedAccount()).toBeUndefined();
            })
        });
    });

    describe("#usage", function() {
        beforeEach(function() {
            this.instanceUsage = this.instance.usage();
        })

        it("returns an InstanceUsage object", function() {
            expect(this.instanceUsage).toBeA(chorus.models.InstanceUsage);
        });

        it("sets the instance id", function() {
            expect(this.instanceUsage.attributes.instanceId).toBe(this.instance.get('id'));
        });

        it("memoizes", function() {
            expect(this.instanceUsage).toBe(this.instance.usage());
        });
    })

    describe("#isGreenplum", function() {
        it("returns true for greenplum instances", function() {
            expect(fixtures.instance().isGreenplum()).toBeTruthy();
        })

        it("returns false otherwise", function() {
            expect(fixtures.instance({instanceProvider: 'somethingElse'}).isGreenplum()).toBeFalsy();
        })
    })

    describe("validations", function() {
        context("with a registered instance", function() {
            beforeEach(function() {
                this.attrs = {
                    name: "foo",
                    host: "gillette",
                    dbUserName: "dude",
                    dbPassword: "whatever",
                    port: "1234",
                    maintenanceDb: "postgres",
                    provisionType: "register"
                }
            });


            context("when the instance is new", function() {
                beforeEach(function() {
                    this.instance.unset("id", { silent: true });
                });

                it("returns true when the model is valid", function() {
                    expect(this.instance.performValidation(this.attrs)).toBeTruthy();
                })

                _.each(["name", "host", "dbUserName", "dbPassword", "port", "maintenanceDb"], function(attr) {
                    it("requires " + attr, function() {
                        this.attrs[attr] = "";
                        expect(this.instance.performValidation(this.attrs)).toBeFalsy();
                        expect(this.instance.errors[attr]).toBeTruthy();
                    })
                });

                it("requires valid name", function() {
                    this.attrs.name = "foo bar"
                    expect(this.instance.performValidation(this.attrs)).toBeFalsy();
                    expect(this.instance.errors.name).toMatchTranslation("instance.validation.name_pattern")
                })

                it("requires valid port", function() {
                    this.attrs.port = "z123"
                    expect(this.instance.performValidation(this.attrs)).toBeFalsy();
                    expect(this.instance.errors.port).toBeTruthy();
                });
            });

            context("when the instance has already been created", function() {
                it("does not require a dbUserName or dbPassword", function() {
                    delete this.attrs.dbPassword;
                    delete this.attrs.dbUserName;
                    expect(this.instance.performValidation(this.attrs)).toBeTruthy();
                });
            });
        });

        context("when creating a new instance", function() {
            beforeEach(function() {
                this.attrs = {
                    name: "foo",
                    size: "100000",
                    provisionType: "create"
                }
            })

            it("requires size", function() {
                this.attrs.size = "";
                expect(this.instance.performValidation(this.attrs)).toBeFalsy();
                expect(this.instance.errors.size).toBeTruthy();
            })

            it("requires valid size", function() {
                this.attrs.size = "1234z"
                expect(this.instance.performValidation(this.attrs)).toBeFalsy();
                expect(this.instance.errors.size).toBeTruthy();
            })
        });

        context("when registering an existing hadoop instance", function() {
            beforeEach(function() {
                this.attrs = {
                    name: "foo",
                    size: "100000",
                    provisionType: "registerHadoop"
                }
            });

            _.each(["name", "host", "userName", "userGroups", "port"], function(attr) {
                it("requires " + attr, function() {
                    this.attrs[attr] = "";
                    expect(this.instance.performValidation(this.attrs)).toBeFalsy();
                    expect(this.instance.errors[attr]).toBeTruthy();
                })
            });
        });
    })

    describe("#isHadoop", function() {
        context("when the instance is a hadoop instance", function() {
            {
                beforeEach(function() {
                    this.instance = fixtures.hadoopInstance();
                });

                it("returns true", function() {
                    expect(this.instance.isHadoop()).toBeTruthy();
                })
            }
        })

        context("when the instance is not a hadoop instance", function() {
            {
                it("returns false", function() {
                    expect(this.instance.isHadoop()).toBeFalsy();
                })
            }
        })
    })
});
