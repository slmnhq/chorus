describe("chorus.pages.InstanceIndexPage", function() {
    beforeEach(function() {
        this.page = new chorus.pages.InstanceIndexPage();
        this.instanceSet = new chorus.collections.InstanceSet();
        this.hadoopInstanceSet = new chorus.collections.HadoopInstanceSet();
    });

    describe("#initialize", function() {
        it("has a helpId", function() {
            expect(this.page.helpId).toBe("instances");
        });

        it("fetches all registered greenplum instances", function() {
            expect(this.instanceSet).toHaveBeenFetched();
        });

        it("fetches all registered hadoop instances", function() {
            expect(this.hadoopInstanceSet).toHaveBeenFetched();
        });

        it("passes the greenplumn and hadoop instances to the content details view", function() {
            var contentDetails = this.page.mainContent.contentDetails;
            expect(contentDetails.options.hadoopInstances).toBeA(chorus.collections.HadoopInstanceSet);
            expect(contentDetails.options.greenplumInstances).toBeA(chorus.collections.InstanceSet);
        });

        it("passes the greenplumn and hadoop instances to the list view", function() {
            var list = this.page.mainContent.content;
            expect(list.options.hadoopInstances).toBeA(chorus.collections.HadoopInstanceSet);
            expect(list.options.greenplumInstances).toBeA(chorus.collections.InstanceSet);
        });
    });

    describe("when the instances are fetched", function() {
        beforeEach(function() {
            this.server.completeFetchAllFor(this.instanceSet, [
                rspecFixtures.greenplumInstance(),
                rspecFixtures.greenplumInstance({id: 123456})
            ]);
        });

        describe("pre-selection", function() {
            it("pre-selects the first item by default", function() {
                this.page.render();
                expect(this.page.mainContent.content.$(".greenplum_instance li.instance:eq(0)")).toHaveClass("selected");
            });

            it("pre-selects the instance with ID specified in chorus.pageOptions, when available", function() {
                this.page.pageOptions = {selectId: 123456};
                this.page.render();
                expect(this.page.mainContent.content.$(".greenplum_instance li.instance[data-greenplum-instance-id='123456']")).toHaveClass("selected");
            });
        });

        describe("#render", function() {
            beforeEach(function() {
                chorus.bindModalLaunchingClicks(this.page);
                this.page.render();
            });

            it("launches a new instance dialog", function() {
                var modal = stubModals();
                this.page.mainContent.contentDetails.$("button").click();
                expect(modal.lastModal()).toBeA(chorus.dialogs.InstancesNew);
            });

            it("sets the page model when a 'instance:selected' event is broadcast", function() {
                var instance = rspecFixtures.greenplumInstance();
                expect(this.page.model).not.toBe(instance);
                chorus.PageEvents.broadcast('instance:selected', instance);
                expect(this.page.model).toBe(instance);
            });

            it("displays the loading text", function() {
                expect(this.page.mainContent.contentDetails.$(".loading")).toExist();
            });


            describe("when the hadoopInstances are fetched", function() {
                beforeEach(function() {
                    this.server.completeFetchAllFor(this.hadoopInstanceSet, [
                        rspecFixtures.hadoopInstance(),
                        rspecFixtures.hadoopInstance({id: 123456})
                    ]);
                });

                it("doesn't display the loading text and display the instances count", function() {
                    expect(this.page.mainContent.contentDetails.$(".loading")).not.toExist();
                    expect(this.page.mainContent.contentDetails.$(".number").text()).toBe("4");
                });
            });

        });
    });
});
