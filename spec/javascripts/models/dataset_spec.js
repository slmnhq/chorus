describe("chorus.models.Dataset", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetSourceView({
            workspace: {
                id: "44"
            },
            instance: {
                id: "45"
            },
            databaseName: "whirling_tops",
            schemaName: "diamonds",
            objectType: "foo",
            objectName: "japanese_teas"
        });
    })

    it("creates the correct showUrl", function() {
        expect(this.dataset.showUrl()).toBe("#/workspaces/44/datasets/45|whirling_tops|diamonds|foo|japanese_teas");
    });

    it("has the right url", function() {
        var url = encodeURI("/edc/workspace/44/dataset/45|whirling_tops|diamonds|foo|japanese_teas");
        expect(this.dataset.url()).toMatchUrl(url);
    });

    describe("when the 'invalidated' event is triggered", function() {
        describe("when the dataset belongs to a collection", function() {
            beforeEach(function() {
                this.collection = new chorus.collections.DatasetSet();
                this.collection.add(this.dataset);
            });

            it("re-fetches itself, because the last comment might have changed", function() {
                this.dataset.trigger("invalidated");
                expect(this.dataset).toHaveBeenFetched();
            });
        });

        describe("when the dataset has no collection", function() {
            it("does not fetch anything", function() {
                var dataset = this.dataset;
                dataset.trigger("invalidated");
                expect(dataset).not.toHaveBeenFetched();
            });
        });
    });

    describe("#makeBoxplotTask", function() {
        beforeEach(function() {

            // for now, the task api requires a sandboxId, which is
            // *not* included when we fetch a a dataset.
            // we need to set it ourselves.
            this.dataset.set({ sandboxId: "21" });

            this.task = this.dataset.makeBoxplotTask({
                xAxis: "dog_breed",
                yAxis: "blindness_rate"
            });
        });

        it("returns a BoxplotTask model", function() {
            expect(this.task).toBeA(chorus.models.BoxplotTask);
        });

        it("has the right workspaceId, dataset id and objectName", function() {
            expect(this.task.get("workspaceId")).toBe("44");
            expect(this.task.get("datasetId")).toBe(this.dataset.entityId);
            expect(this.task.get("objectName")).toBe("japanese_teas");
        });
    });

    describe("#makeHistogramTask", function() {
        beforeEach(function() {
            this.dataset.set({ sandboxId: "21" });

            this.task = this.dataset.makeHistogramTask({
                bins: 5,
                xAxis: "blindness_rate"
            });
        });

        it("returns a HistogramTask model", function() {
            expect(this.task).toBeA(chorus.models.HistogramTask);
        });

        it("has the given number of bins and y axis", function() {
            expect(this.task.get("bins")).toBe(5);
            expect(this.task.get("xAxis")).toBe("blindness_rate");
        });

        it("has the right workspaceId, dataset id and objectName", function() {
            expect(this.task.get("workspaceId")).toBe("44");
            expect(this.task.get("datasetId")).toBe(this.dataset.entityId);
            expect(this.task.get("objectName")).toBe("japanese_teas");
        });
    });

    describe("#makeHeatmapTask", function() {
        beforeEach(function() {
            this.dataset.set({ sandboxId: "21" });

            this.task = this.dataset.makeHeatmapTask({
                xBins: 5,
                yBins: 6,
                xAxis: "dog_breed",
                yAxis: "blindness_rate"
            });
        });

        it("returns a HeatmapTask model", function() {
            expect(this.task).toBeA(chorus.models.HeatmapTask);
        });

        it("has the given number of bins and y axis", function() {
            expect(this.task.get("xBins")).toBe(5);
            expect(this.task.get("yBins")).toBe(6);
            expect(this.task.get("xAxis")).toBe("dog_breed");
            expect(this.task.get("yAxis")).toBe("blindness_rate");
        });

        it("has the right workspaceId, dataset id and objectName", function() {
            expect(this.task.get("workspaceId")).toBe("44");
            expect(this.task.get("datasetId")).toBe(this.dataset.entityId);
            expect(this.task.get("objectName")).toBe("japanese_teas");
        });
    });

    describe("#makeFrequencyTask", function() {
        beforeEach(function() {
            this.dataset.set({sandboxId: "21"});

            this.task = this.dataset.makeFrequencyTask({
                yAxis: "blindness_rate",
                bins: "12"
            });
        })

        it("returns a FrequencyTask model", function() {
            expect(this.task).toBeA(chorus.models.FrequencyTask);
        });

        it("has the given y axis", function() {
            expect(this.task.get("yAxis")).toBe("blindness_rate");
        });

        it("has the right workspaceId, dataset id and objectName", function() {
            expect(this.task.get("workspaceId")).toBe("44");
            expect(this.task.get("datasetId")).toBe(this.dataset.entityId);
            expect(this.task.get("objectName")).toBe("japanese_teas");
            expect(this.task.get("bins")).toBe("12")
        });
    })

    describe("#makeTimeseriesTask", function() {
        beforeEach(function() {
            this.dataset.set({sandboxId: "21"});

            this.task = this.dataset.makeTimeseriesTask({
                xAxis: "years",
                yAxis: "height_in_inches",
                aggregation: "sum",
                timeInterval: "minute",
                timeType: "datetime"
            });
        });

        it("returns a TimeseriesTask model", function() {
            expect(this.task).toBeA(chorus.models.TimeseriesTask);
        });

        it("has the given x axis", function() {
            expect(this.task.get("xAxis")).toBe("years");
            expect(this.task.get("aggregation")).toBe("sum");
            expect(this.task.get("timeInterval")).toBe("minute");
        });

        it("has the given y axis", function() {
            expect(this.task.get("yAxis")).toBe("height_in_inches");
        });

        it("has the right workspaceId, dataset id and objectName", function() {
            expect(this.task.get("workspaceId")).toBe("44");
            expect(this.task.get("datasetId")).toBe(this.dataset.entityId);
            expect(this.task.get("objectName")).toBe("japanese_teas");
        });

        it("has the right timeType", function() {
            expect(this.task.get("timeType")).toBe('datetime')
        })
    });

    describe("#isChorusView", function() {
        context("when the dataset is a chorus view", function() {
            beforeEach(function() {
                this.dataset.set({type: "CHORUS_VIEW"});
            });

            it("should return true", function() {
                expect(this.dataset.isChorusView()).toBeTruthy();
            })
        });

        context("when the dataset is not a chorus view", function() {
            it("should return false", function() {
                expect(this.dataset.isChorusView()).toBeFalsy();
            })
        });
    });
})
