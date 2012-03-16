describe("chorus.Mixins.InstanceCredentials", function() {
    describe("model", function() {
        beforeEach(function() {
            this.collection = new chorus.collections.Base();
            _.extend(this.collection, chorus.Mixins.InstanceCredentials.model);
        });

        describe("#needsInstanceCredentials", function() {
            it("returns true when a fetch failed because of missing instance credentials", function() {
                this.collection.serverErrors = [{
                    description: null,
                    message: "Account map is needed.",
                    msgcode: "E_4_0109",
                    msgkey: "ACCOUNTMAP.NO_ACTIVE_ACCOUNT",
                    severity: "error"
                }];

                expect(this.collection.needsInstanceCredentials()).toBeTruthy();

                this.collection.serverErrors = [{
                    description: null,
                    message: "com.emc.edc.common.AccountMapException: Account map is needed.",
                    msgcode: null,
                    msgkey: null,
                    severity: "error"
                }];

                expect(this.collection.needsInstanceCredentials()).toBeTruthy();
            });

            it("returns false when a fetch failed for some other reason", function() {
                this.collection.serverErrors = { message: "sql error - no table named 'dudes'" };
                expect(this.collection.needsInstanceCredentials()).toBeFalsy();
            });

            it("returns false when the model has no server errors", function() {
                delete this.collection.serverErrors;
                expect(this.collection.needsInstanceCredentials()).toBeFalsy();
            });
        });
    });

    describe("page", function() {
        beforeEach(function() {
            this.page = new chorus.pages.Base()
            this.page.instance = fixtures.instance();
            this.model = new chorus.models.Base();
            this.otherModel = new chorus.models.Base();

            _.extend(this.page, chorus.Mixins.InstanceCredentials.page);
            _.extend(this.model, chorus.Mixins.InstanceCredentials.model);

            this.model.urlTemplate = "foo";
            this.otherModel.urlTemplate = "bar";

            this.page.requiredResources.push(this.model);
            this.page.requiredResources.push(this.otherModel);

            spyOn(Backbone.history, 'loadUrl');
            spyOn(chorus.Modal.prototype, 'launchModal');
        })

        describe("when a fetch fails for one of the page's required resources", function() {
            beforeEach(function() {
                this.model.fetch();
                this.otherModel.fetch();
            });

            context("when the resource does not respond to #needsInstanceCredentials", function() {
                beforeEach(function() {
                    this.server.lastFetchFor(this.otherModel).fail([{
                        message: "Not found"
                    }]);
                });

                itGoesToThe404Page();
            });

            context("credentials are missing", function() {
                beforeEach(function() {
                    this.server.lastFetchFor(this.model).fail([{
                        description: null,
                        message: "Account map is needed.",
                        msgcode: "E_4_0109",
                        msgkey: "ACCOUNTMAP.NO_ACTIVE_ACCOUNT",
                        severity: "error"
                    }]);
                })

                it("does not go to the 404 page", function() {
                    expect(Backbone.history.loadUrl).not.toHaveBeenCalled()
                });

                it("launches the 'add credentials' dialog, and reloads after the credentials have been added", function() {
                    expect(chorus.Modal.prototype.launchModal).toHaveBeenCalled()
                    var dialog = chorus.Modal.prototype.launchModal.mostRecentCall.object;
                    expect(dialog).toBeA(chorus.dialogs.InstanceAccount);
                    expect(dialog.options.reload).toBeTruthy();
                    expect(dialog.options.title).toMatchTranslation("instances.account.add.title");
                });
            })

            context("fetch failed for some other reason", function() {
                beforeEach(function() {
                    this.server.lastFetchFor(this.model).fail([{
                        description: null,
                        message: "Some other failure.",
                        msgcode: "E_4_0109",
                        msgkey: "null",
                        severity: "error"
                    }]);
                })

                itGoesToThe404Page();
            })

            function itGoesToThe404Page() {
                it("does go to the 404 page", function() {
                    expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/invalidRoute")
                });

                it("does not launch any dialog", function() {
                    expect(chorus.Modal.prototype.launchModal).not.toHaveBeenCalled()
                });
            }
        });
    });
});
