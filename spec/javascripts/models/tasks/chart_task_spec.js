describe("chorus.models.ChartTask", function() {
    beforeEach(function() {
        var chartSubclass = chorus.models.ChartTask.extend({});
        chartSubclass.prototype.chartType = "fantastic";
        this.model = new chartSubclass({ objectName: "dog_breeds" });
    });

    it("has the right taskType", function() {
        expect(this.model.get("taskType")).toBe("getChartData");
    });

    it("sets the 'chart[type]' attribute based on the prototype's 'chartType' property", function() {
        expect(this.model.get("chart[type]")).toBe("fantastic");
    });

    it("honors the filters in the SELECT statement", function() {
        this.model.set({"filters": "WHERE ABC"});
        this.model.save();
        expect(this.model.get("relation")).toEqual("SELECT * FROM dog_breeds WHERE ABC");
    });

    it("escapes unsafe object names", function() {
        this.model.set({objectName: "DOG_BREEDs"});
        this.model.save();
        expect(this.model.get("relation")).toEqual('SELECT * FROM "DOG_BREEDs"');
    })

    describe("creating the task", function() {
        beforeEach(function() {
            this.model.save();
        });

        it("generates the 'relation' field based on the object name", function() {
            var request = this.server.lastCreate();
            expect(request.params().relation).toBe("SELECT * FROM dog_breeds");
        });
    });

    it("mixes in SQLResults", function() {
        expect(this.model.columnOrientedData).toBeDefined();
    })
});
