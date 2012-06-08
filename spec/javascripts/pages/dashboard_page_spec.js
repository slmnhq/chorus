describe("chorus.pages.DashboardPage", function() {
    beforeEach(function() {
        chorus.session = new chorus.models.Session({ id: "foo" })
        this.page = new chorus.pages.DashboardPage();
    });

    it("has a helpId", function() {
        expect(this.page.helpId).toBe("dashboard")
    })

    describe("#render", function() {
        beforeEach(function() {
            this.page.render();
        })

        it("creates a Header view", function() {
            expect(this.page.$("#header.header")).toExist();
        })

        context("the workspace list", function() {
            beforeEach(function() {
                this.workspaceList = this.page.mainContent.workspaceList;
            })

            it("has a title", function() {
                expect(this.workspaceList.$("h1").text()).toBe("My Workspaces");
            });

            it("creates a WorkspaceList view", function() {
                expect(this.page.$(".dashboard_workspace_list")).toExist();
            });
        });

        it("does not have a sidebar", function() {
            expect(this.page.$("#sidebar_wrapper")).not.toExist();
        });

        context("when the users fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(
                    new chorus.collections.UserSet([], {page:1, rows:1}),
                    [rspecFixtures.user()],
                    null,
                    {page:1, total: 1234, records: 1234}
                );
            });

            it("shows the number of users", function() {
                expect(this.page.$("#user_count a")).toContainTranslation("dashboard.user_count", {count: 1234});
                expect(this.page.$("#user_count")).not.toHaveClass("hidden");
            });
        });
    });

    context("#setup", function() {
        beforeEach(function() {
            this.server.completeFetchFor(new chorus.collections.InstanceSet([], { hasCredentials: true }), [
                                         newFixtures.greenplumInstance.greenplum(),
                                         newFixtures.greenplumInstance.greenplum()
            ], { accessible: true }, { accessible: true });

            this.server.completeFetchFor(new chorus.collections.HadoopInstanceSet(), [
                                         rspecFixtures.hadoopInstance(),
                                         rspecFixtures.hadoopInstance()
            ]);
        });

        it("sets chorus.session.user as the model", function() {
            expect(this.page.model).toBe(chorus.session.user())
        });

        it("gets the number of users", function() {
            expect(this.server.lastFetchFor(new chorus.collections.UserSet([], {page:1, rows:1}))).toBeTruthy();
        });

        it("passes the collection through to the workspaceSet view", function() {
            expect(this.page.mainContent.workspaceList.collection).toBe(this.page.workspaceSet);
        });

        it("fetches active workspaces for the current user, including recent comments", function() {
            expect(this.page.workspaceSet.attributes.showLatestComments).toBeTruthy();
        })

        it("should sort the workspaceSet by name ascending", function() {
            expect(this.page.workspaceSet.order).toBe("name");
        })

        it("passes the userId to workspaceSet", function() {
            expect(this.page.workspaceSet.attributes.userId).toBe("foo");
        })

        it("fetches only the chorus instances where the user has permissions", function() {
            expect(this.page.instanceSet).toBeA(chorus.collections.InstanceSet);
            expect(this.page.instanceSet.attributes.hasCredentials).toBe(true);
            expect(this.page.instanceSet).toHaveBeenFetched();
        });

        it("fetches the hadoop instances", function() {
            expect(this.page.hadoopInstanceSet).toBeA(chorus.collections.HadoopInstanceSet);
            expect(this.page.hadoopInstanceSet).toHaveBeenFetched();
        });

        it("passes the instance set through to the instance list view", function() {
            var packedUpGreenplumSet = _.map(this.page.instanceSet.models, function(instance) {
                return new chorus.models.Base({ theInstance: instance });
            });
            var packedUpHadoopSet = _.map(this.page.instanceSet.models, function(instance) {
                return new chorus.models.Base({ theInstance: instance });
            });
            var packedUpInstanceSet = new chorus.collections.Base();
            packedUpInstanceSet.add(packedUpGreenplumSet)
            packedUpInstanceSet.add(packedUpHadoopSet)

            _.each(this.page.mainContent.instanceList.collection, function(instance, i) {
                expect(instance.get("theInstance").get("name")).toBe(packedUpInstanceSet.models[i].get("name"));
            });
        });

        describe("when an instance is added", function() {
            beforeEach(function() {
                spyOn(this.page, "fetchInstances");
                chorus.PageEvents.broadcast("instance:added");
            });

            it("re-fetches the instances", function() {
                expect(this.page.fetchInstances).toHaveBeenCalled();
            });
        });
    })
});
