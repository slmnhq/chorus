describe("chorus.models.Dataset", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetChorusView({
            workspace : {
                id : "44"
            },
            instance : {
                id : "45"
            },
            databaseName: "whirling_tops",
            schemaName: "diamonds",
            objectType : "foo",
            objectName : "mama"
        });
    })

    it("creates the correct showUrl", function() {
        expect(this.dataset.showUrl()).toBe("#/workspaces/44/chorus_view/foo/mama");
    })

    it("initializes its 'entityId' correctly", function() {
        expect(this.dataset.entityId).toBe("45|whirling_tops|diamonds|mama");
    });

    it("initializes its 'entityId' correctly", function() {
        expect(this.dataset.entityId).toBe("45|whirling_tops|diamonds|mama");
    });

    it("has the right url", function() {
        var url = encodeURI("/edc/workspace/44/dataset/45|whirling_tops|diamonds|mama");
        expect(this.dataset.url()).toMatchUrl(url);
    });

    describe("when the 'invalidated' event is triggered", function() {
        describe("when the dataset belongs to a collection", function() {
            beforeEach(function() {
                this.collection = new chorus.collections.DatasetSet();
                this.collection.add(this.dataset);
            });

            it("re-fetches its collection, because the last comment might have changed", function() {
                this.dataset.trigger("invalidated");
                expect(this.collection).toHaveBeenFetched();
            });
        });

        describe("when the dataset has no collection", function() {
            it("does not fetch anything", function() {
                var dataset = this.dataset;
                expect(function() {
                    dataset.trigger("invalidated");
                }).not.toThrow();
            });
        });
    });

    describe("#statistics", function() {
        beforeEach(function() {
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

    describe("#meta_type", function() {
        var expectedTypeMap = {
            "BASE_TABLE" : "table",
            "VIEW" : "view",
            "EXTERNAL_TABLE" : "table",
            "MASTER_TABLE" : "table"
        }

        _.each(expectedTypeMap, function(str, type) {
            it("works for " + type, function() {
                expect(fixtures.datasetSandboxTable({ objectType : type }).metaType()).toBe(str)
            });
        })
    })

    describe("iconFor", function() {
        var expectedMap = {
            "CHORUS_VIEW" : {
                "" : "view_large.png"
            },

            "SOURCE_TABLE" : {
                "BASE_TABLE" : "source_table_large.png",
                "EXTERNAL_TABLE" : "source_table_large.png",
                "MASTER_TABLE" : "source_table_large.png",
                "VIEW" : "source_view_large.png"
            },

            "SANDBOX_TABLE" : {
                "BASE_TABLE" : "table_large.png",
                "EXTERNAL_TABLE" : "table_large.png",
                "MASTER_TABLE" : "table_large.png",
                "VIEW" : "view_large.png"
            }
        }

        _.each(expectedMap, function(subMap, type) {
            _.each(subMap, function(filename, objectType) {
                it("works for type " + type + " and objectType " + objectType, function() {
                    expect(fixtures.datasetSandboxTable({ type : type, objectType : objectType}).iconUrl()).toBe("/images/" + expectedMap[type][objectType]);
                })
            })
        })
    })

    describe("#lastComment", function() {
        beforeEach(function() {
            this.model = fixtures.datasetSandboxTable();
            this.comment = this.model.lastComment();
            this.lastCommentJson = this.model.get('recentComment');
        });

        it("has the right body", function() {
            expect(this.comment.get("body")).toBe(this.lastCommentJson.text);
        });

        it("has the right creator", function() {
            var creator = this.comment.author()
            expect(creator.get("id")).toBe(this.lastCommentJson.author.id);
            expect(creator.get("firstName")).toBe(this.lastCommentJson.author.firstName);
            expect(creator.get("lastName")).toBe(this.lastCommentJson.author.lastName);
        });

        context("when the dataset doesn't have any comments", function() {
            it("returns null", function() {
                expect(fixtures.datasetSandboxTable({recentComment : null}).lastComment()).toBeFalsy();
            });
        });
    });

    describe("#preview", function() {
        context("with a table", function() {
            beforeEach(function() {
                this.dataset.set({objectType: "BASE_TABLE", objectName: "foo"});
                this.preview = this.dataset.preview();
            });

            it("should return a DatasetPreview", function() {
                expect(this.preview).toBeA(chorus.models.DatasetPreview);
            });

            it("should memoize the database preview", function() {
                expect(this.preview).toBe(this.dataset.preview());
            });

            it("should return a database preview", function() {
                expect(this.preview.get("instanceId")).toBe(this.dataset.get("instance").id);
                expect(this.preview.get("databaseName")).toBe(this.dataset.get("databaseName"));
                expect(this.preview.get("schemaName")).toBe(this.dataset.get("schemaName"));
                expect(this.preview.get("tableName")).toBe(this.dataset.get("objectName"));
            });
        });

        context("with a view", function() {
            beforeEach(function() {
                this.dataset.set({objectType: "VIEW", objectName: "bar"});
                this.preview = this.dataset.preview();
            });

            it("should return a DatasetPreview", function() {
                expect(this.preview).toBeA(chorus.models.DatasetPreview);
            });

            it("should memoize the database preview", function() {
                expect(this.preview).toBe(this.dataset.preview());
            });

            it("should return a database preview", function() {
                expect(this.preview.get("instanceId")).toBe(this.dataset.get("instance").id);
                expect(this.preview.get("databaseName")).toBe(this.dataset.get("databaseName"));
                expect(this.preview.get("schemaName")).toBe(this.dataset.get("schemaName"));
                expect(this.preview.get("viewName")).toBe(this.dataset.get("objectName"));
            });
        });
    });
})
