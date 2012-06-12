describe("chorus.Mixins.InstanceCredentials", function() {
    describe("model", function() {
        beforeEach(function() {
            this.collection = new chorus.collections.Base();
            _.extend(this.collection, chorus.Mixins.InstanceCredentials.model);
        });

        describe("#instanceRequiringCredentials", function() {
            context("when a fetch failed because of missing instance credentials", function() {
                it("returns an instance model with the right id", function() {
                    this.collection.errorData = {
                        id: "101",
                        name: "Ron Instance"
                    };

                    var instance = this.collection.instanceRequiringCredentials();
                    expect(instance).toBeA(chorus.models.GreenplumInstance);
                    expect(instance.get("id")).toBe("101");
                });
            });
        });
    });

    describe("page", function() {
        beforeEach(function() {
            this.page = new chorus.pages.Base()
            this.model = new chorus.models.Base();
            this.otherModel = new chorus.models.Base();

            _.extend(this.page, chorus.Mixins.InstanceCredentials.page);
            _.extend(this.model, chorus.Mixins.InstanceCredentials.model);

            this.model.urlTemplate = "foo";
            this.otherModel.urlTemplate = "bar";

            this.page.dependOn(this.model);
            this.page.dependOn(this.otherModel);

            this.modalSpy = stubModals();
            spyOn(Backbone.history, 'loadUrl');

            this.model.fetch();
            this.otherModel.fetch();
        })

        describe("when a fetch fails for one of the page's required resources", function() {
            context("when credentials are missing", function() {
                beforeEach(function() {
                    this.instance = rspecFixtures.greenplumInstance();
                    spyOn(this.model, 'instanceRequiringCredentials').andReturn(this.instance);
                    this.server.lastFetchFor(this.model).failForbidden();
                })

                it("does not go to the 403 page", function() {
                    expect(Backbone.history.loadUrl).not.toHaveBeenCalled()
                });

                it("launches the 'add credentials' dialog, and reloads after the credentials have been added", function() {
                    var dialog = this.modalSpy.lastModal();
                    expect(dialog).toBeA(chorus.dialogs.InstanceAccount);
                    expect(dialog.options.instance).toBe(this.instance);
                    expect(dialog.options.title).toMatchTranslation("instances.account.add.title");
                });

                it("configure the dialog to reload after credentials are added and navigate back on dismissal", function() {
                    var dialog = this.modalSpy.lastModal();
                    expect(dialog.options.reload).toBeTruthy();
                    expect(dialog.options.goBack).toBeTruthy();
                });
            })

            context("fetch failed for some other reason", function() {
                beforeEach(function() {
                    spyOn(this.model, 'instanceRequiringCredentials').andReturn(undefined);
                    this.server.lastFetchFor(this.model).failNotFound();
                })

                itGoesToThe404Page();
            });

            context("when the resource does not respond to #instanceRequiringCredentials", function() {
                beforeEach(function() {
                    this.server.lastFetchFor(this.otherModel).failNotFound([{
                        message: "Not found"
                    }]);
                });

                itGoesToThe404Page();
            });

            function itGoesToThe404Page() {
                it("does go to the 404 page", function() {
                    expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/invalidRoute")
                });

                it("does not launch any dialog", function() {
                    expect(this.modalSpy.lastModal()).not.toBeDefined();
                });
            }
        });
    });
});
