describe("chorus.views.Instance", function() {
    beforeEach(function() {
        this.model = fixtures.instance();
        this.view = new chorus.views.Instance({model : this.model});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("renders the instance name", function() {
            expect(this.view.$(".name").text().trim()).toBe(this.model.get("name"));
        });

        it("renders the description of the instance", function() {
            expect(this.view.$(".description").text().trim()).toBe(this.model.get("description"));
        })

        describe("the status dot", function() {
            itUsesPngForState("green", "online");
            itUsesPngForState("unknown", "unknown");
            itUsesPngForState("red", "fault");

            function itUsesPngForState(png, state) {
                it("uses " + png + ".png for state: " + state, function() {
                    this.model.set({state: state});
                    this.view.render();
                    expect(this.view.$("img.state").attr("src")).toBe("/images/instances/" + png + ".png");
                });
            }
        });

        describe("instance provider icon", function() {
            itUsesPngForInstanceProvider("greenplum_instance", "Greenplum Database");
            itUsesPngForInstanceProvider("hadoop_instance", "Hadoop");
            itUsesPngForInstanceProvider("other_instance", "Postgres");

            function itUsesPngForInstanceProvider(png, provider) {
                it("uses " + png + ".png for provider: " + provider, function() {
                    this.model.set({instanceProvider: provider});
                    this.view.render();
                    expect(this.view.$("img.provider").attr("src")).toBe("/images/instances/" + png + ".png");
                });
            }
        })
    });
});