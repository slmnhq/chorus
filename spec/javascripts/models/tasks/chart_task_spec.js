describe("chorus.models.ChartTask", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetSandboxTable({objectName: 'dog_breeds'});
        var chartSubclass = chorus.models.ChartTask.extend({});
        chartSubclass.prototype.chartType = "fantastic";
        this.model = new chartSubclass({ tabularData: this.dataset });
    });

    it("has the right taskType", function() {
        expect(this.model.get("taskType")).toBe("getChartData");
    });

    it("sets the 'chart[type]' attribute based on the prototype's 'chartType' property", function() {
        expect(this.model.get("chart[type]")).toBe("fantastic");
    });

    it("sets workspaceId and datasetId", function() {
        expect(this.model.get("workspaceId")).toBe(this.dataset.get("workspace").id);
        expect(this.model.get("datasetId")).toBe(this.dataset.get("id"));
    })

    it("honors the filters in the SELECT statement", function() {
        this.model.set({"filters": "WHERE ABC"});
        this.model.save();
        expect(this.model.get("relation")).toEqual("SELECT * FROM dog_breeds WHERE ABC");
    });

    it("escapes unsafe object names", function() {
        this.dataset.set({objectName: "DOG_BREEDs"});
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

    describe("it handles queries from chorus views", function() {
        beforeEach(function() {
            this.dataset.attributes['query'] = "SELECT * FROM chorus_view WHERE 1 > 0";
            this.model.save();
        });

        it("constructs a correct API call", function() {
            var request = this.server.lastCreate();
            expect(request.params().relation).toBe("SELECT * FROM (SELECT * FROM chorus_view WHERE 1 > 0) AS dog_breeds")
        })
    })
});
