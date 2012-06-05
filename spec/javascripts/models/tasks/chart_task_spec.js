describe("chorus.models.ChartTask", function() {
    beforeEach(function() {
        this.dataset = newFixtures.dataset.sandboxTable({schemaName: 'animals', objectName: 'dog_breeds'});
        var chartSubclass = chorus.models.ChartTask.extend({});
        chartSubclass.prototype.chartType = "fantastic";
        this.model = new chartSubclass({ tabularData: this.dataset });
    });

    it("has the right name", function() {
        expect(this.model.name()).toMatchTranslation("dataset.visualization.data.filename");
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
        expect(this.model.get("relation")).toEqual("SELECT * FROM animals.dog_breeds WHERE ABC");
    });

    it("escapes unsafe schema and object names", function() {
        this.dataset.set({objectName: "DOG_BREEDs", schemaName: "ANIMALS"});
        this.model.save();
        expect(this.model.get("relation")).toEqual('SELECT * FROM "ANIMALS"."DOG_BREEDs"');
    })

    describe("#workspace", function() {
        context("when the task has a workspace id", function() {
            it("returns a workspace with the right id", function() {
                var workspace = this.model.workspace();
                expect(workspace).toBeA(chorus.models.Workspace);
                expect(workspace.get("id")).toBe(this.model.get("workspaceId"));
                expect(workspace.get("id")).toBeDefined();
            });

            it("memoizes", function() {
                expect(this.model.workspace()).toBe(this.model.workspace());
            });
        });

        context("when the task has no workspace id", function() {
            it("returns undefined", function() {
                this.model.unset("workspaceId");
                expect(this.model.workspace()).toBeUndefined();
            });
        });
    });

    describe("creating the task", function() {
        beforeEach(function() {
            this.model.save();
        });

        it("generates the 'relation' field based on the schema and object names", function() {
            var request = this.server.lastCreate();
            expect(request.params()['chart_task[relation]']).toBe("SELECT * FROM animals.dog_breeds");
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
            expect(request.params()['chart_task[relation]']).toBe("SELECT * FROM (SELECT * FROM chorus_view WHERE 1 > 0) AS dog_breeds")
        })
    })
});
