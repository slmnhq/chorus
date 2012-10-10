describe("chorus.presenters.InstanceList", function() {
    var greenplumInstances, hadoopInstances, gnipInstances, presenter;

    beforeEach(function() {
        greenplumInstances = new chorus.collections.InstanceSet([
            rspecFixtures.greenplumInstance({ name: "joe_instance", state: "online" }),
            rspecFixtures.greenplumInstance({ state: "offline" })
        ]);

        hadoopInstances = new chorus.collections.HadoopInstanceSet([
            rspecFixtures.hadoopInstance({ state: "offline" }),
            rspecFixtures.hadoopInstance({ description: "special instance", state: "online" }),
            rspecFixtures.hadoopInstance({ state: null })
        ]);

        gnipInstances = new chorus.collections.GnipInstanceSet([
            rspecFixtures.gnipInstance({ name: "Gnip1" }),
            rspecFixtures.gnipInstance({ name: "Gnip2" }),
            rspecFixtures.gnipInstance({ name: "Gnip3", description: "I am a turnip" })
        ]);
        
        presenter = new chorus.presenters.InstanceList({ 
            greenplum: greenplumInstances, 
            hadoop: hadoopInstances,
            gnip: gnipInstances
        });
        presenter.present();
    });

    it("returns an object with three arrays 'greenplum', 'hadoop', and 'gnip'", function() {
        expect(presenter.greenplum.length).toBe(2);
        expect(presenter.hadoop.length).toBe(3);
        expect(presenter.gnip.length).toBe(3);
    });

    it("has the keys 'hasGreenplum', 'hasHadoop' and 'hasGnip'", function() {
        expect(presenter.hasGreenplum).toBeTruthy();
        expect(presenter.hasHadoop).toBeTruthy();
        expect(presenter.hasGnip).toBeTruthy();

        presenter = new chorus.presenters.InstanceList({
            greenplum: new chorus.collections.InstanceSet(),
            hadoop: new chorus.collections.HadoopInstanceSet(),
            gnip: new chorus.collections.GnipInstanceSet()

        });

        expect(presenter.hasGreenplum).toBeFalsy();
        expect(presenter.hasHadoop).toBeFalsy();
        expect(presenter.hasGnip).toBeFalsy();
    });

    describe("#present", function() {
        it("returns the presenter", function() {
            expect(presenter.present()).toBe(presenter);
        });
    });

    itPresentsModelMethod("stateIconUrl", "stateUrl");
    itPresentsModelMethod("showUrl");
    itPresentsModelMethod("providerIconUrl", "providerUrl");
    itPresentsModelMethod("isProvisioning");
    itPresentsModelMethod("provisioningFailed");
    itPresentsModelMethod("stateText");

    itPresentsModelAttribute("id");
    itPresentsModelAttribute("name");
    itPresentsModelAttribute("description");

    function itPresentsModelAttribute(name) {
        it("presents each model's " + name + " attribute", function() {
            greenplumInstances.each(function(model, i) {
                expect(presenter.greenplum[i][name]).toBe(model.get(name));
            });

            hadoopInstances.each(function(model, i) {
                expect(presenter.hadoop[i][name]).toBe(model.get(name));
            });

            gnipInstances.each(function(model, i) {
                expect(presenter.gnip[i][name]).toBe(model.get(name));
            });
        });
    }

    function itPresentsModelMethod(methodName, presentedName) {
        presentedName || (presentedName = methodName);

        it("presents each model's " + methodName + " method as '" + presentedName + "''", function() {
            greenplumInstances.each(function(model, i) {
                expect(presenter.greenplum[i][presentedName]).toBe(model[methodName]());
            });

            hadoopInstances.each(function(model, i) {
                expect(presenter.hadoop[i][presentedName]).toBe(model[methodName]());
            });

            gnipInstances.each(function(model, i) {
                expect(presenter.gnip[i][presentedName]).toBe(model[methodName]());
            });
        });
    }
});
