describe("chorus.models.ChartTask", function() {
    beforeEach(function() {
        var chartSubclass = chorus.models.ChartTask.extend({});
        chartSubclass.prototype.chartType = "fantastic";
        this.model = new chartSubclass({ objectName: "dog_breeds" });
    });

    it("has the right taskType", function() {
        expect(this.model.get("taskType")).toBe("getChartData");
    });

    it("sets the 'chart[type]' attribute based on the prototype's 'chartType' property", function(){
       expect(this.model.get("chart[type]")).toBe("fantastic");
    });

    describe("creating the task", function() {
        beforeEach(function() {
            this.model.save();
        });

        it("generates the 'relation' field based on the object name", function() {
            var request = this.server.lastCreate();
            expect(request.params().relation).toBe("SELECT * FROM dog_breeds");
        });
    });
});
