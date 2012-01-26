describe("chorus.models.Dataset", function() {
    describe("#showUrl", function() {
        context("when the dataset is a table", function() {
            beforeEach(function() {
                this.dataset = fixtures.datasetSandboxTable({
                    workspace : {
                        id : "33"
                    },
                    objectName : "partyTable"
                });
            })

            it("returns the right url", function() {
                expect(this.dataset.showUrl()).toBe("#/workspaces/33/table/partyTable");
            })
        })

        context("when the dataset is a view", function() {
            beforeEach(function() {
                this.dataset = fixtures.datasetChorusView({
                    workspace : {
                        id : "33"
                    },
                    objectName : "partyView"
                });
            })

            it("returns the right url", function() {
                expect(this.dataset.showUrl()).toBe("#/workspaces/33/view/partyView");
            })
        })

        it("compares the type case-insensitively", function() {
            this.dataset = fixtures.datasetSandboxTable({
                workspace : {
                    id : "33"
                },
                objectName : "partyTable",
                objectType : "table"
            });

            expect(this.dataset.showUrl()).toBe("#/workspaces/33/table/partyTable");
        })
    })

    describe("#statistics", function() {
        beforeEach(function() {
            this.dataset = fixtures.datasetChorusView()
            this.datasetProperties = this.dataset.statistics()
        })

        it("returns an instance of DatasetStatistics", function() {
            expect(this.datasetProperties).toBeA(chorus.models.DatasetStatistics)
        })

        it("sets the properties correctly", function() {
            expect(this.datasetProperties.get('instanceId')).toBe(this.dataset.get('instance').id)
            expect(this.datasetProperties.get('databaseName')).toBe(this.dataset.get("databaseName"))
            expect(this.datasetProperties.get('schemaName')).toBe(this.dataset.get("schemaName"))
            expect(this.datasetProperties.get('type')).toBe(this.dataset.get("type"))
            expect(this.datasetProperties.get('objectType')).toBe(this.dataset.get("objectType"))
            expect(this.datasetProperties.get('objectName')).toBe(this.dataset.get("objectName"))
        })
    })
})