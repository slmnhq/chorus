describe("chorus.presenters.InstanceList", function() {
    var greenplumInstances, hadoopInstances, presenter;

    beforeEach(function() {
        greenplumInstances = new chorus.collections.InstanceSet([
            newFixtures.instance.greenplum({ name: "joe_instance", state: "online" }),
            newFixtures.instance.greenplum({ state: "offline" })
        ]);

        hadoopInstances = new chorus.collections.HadoopInstanceSet([
            newFixtures.instance.hadoop({ state: "offline" }),
            newFixtures.instance.hadoop({ description: "special instance", state: "online" }),
            newFixtures.instance.hadoop({ state: null })
        ]);

        presenter = new chorus.presenters.InstanceList({ greenplum: greenplumInstances, hadoop: hadoopInstances });
        presenter.present();
    });

    it("returns an object with three arrays 'greenplum', 'hadoop', and 'other'", function() {
        expect(presenter.greenplum.length).toBe(2);
        expect(presenter.hadoop.length).toBe(3);
        expect(presenter.other.length).toBe(0);
    });

    it("has the keys 'hasGreenplum', 'hasHadoop' and 'hasOther'", function() {
        expect(presenter.hasGreenplum).toBeTruthy();
        expect(presenter.hasHadoop).toBeTruthy();
        expect(presenter.hasOther).toBeFalsy();

        presenter = new chorus.presenters.InstanceList({
            greenplum: new chorus.collections.InstanceSet(),
            hadoop: new chorus.collections.HadoopInstanceSet()
        });

        expect(presenter.hasGreenplum).toBeFalsy();
        expect(presenter.hasHadoop).toBeFalsy();
        expect(presenter.hasOther).toBeFalsy();
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
    itPresentsModelMethod("isFault");
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
        });
    }
});
