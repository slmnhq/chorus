describe("chorus.models.TabularData", function() {
    beforeEach(function() {
        this.tabularData = fixtures.tabularData();
    })

    it("includes the InstanceCredentials mixin", function() {
        expect(this.tabularData.instanceRequiringCredentials).toBe(chorus.Mixins.InstanceCredentials.model.instanceRequiringCredentials);
    });

    describe("#initialize", function() {
        it("doesn't override type when type already exists", function() {
            var model = new chorus.models.TabularData({ type: "foo"})
            expect(model.get("type")).toBe("foo")
        })

        it("sets type to datasetType if datasetType exists", function() {
            var model = new chorus.models.TabularData({ datasetType: "foo"})
            expect(model.get("type")).toBe("foo")
        })

        it("sets type to SOURCE_TABLE if neither type nor datasetType exists", function() {
            var model = new chorus.models.TabularData({})
            expect(model.get("type")).toBe("SOURCE_TABLE")
        })
    });

    describe("#statistics", function() {
        beforeEach(function() {
            this.tabularDataProperties = this.tabularData.statistics()
        })

        it("returns an instance of DatabaseObjectStatistics", function() {
            expect(this.tabularDataProperties).toBeA(chorus.models.DatabaseObjectStatistics)
        })

        it("should memoize the result", function() {
            expect(this.tabularDataProperties).toBe(this.tabularData.statistics());
        })

        it("sets the properties correctly", function() {
            expect(this.tabularDataProperties.get('instanceId')).toBe(this.tabularData.get('instance').id)
            expect(this.tabularDataProperties.get('databaseName')).toBe(this.tabularData.get("databaseName"))
            expect(this.tabularDataProperties.get('schemaName')).toBe(this.tabularData.get("schemaName"))
            expect(this.tabularDataProperties.get('type')).toBe(this.tabularData.get("type"))
            expect(this.tabularDataProperties.get('objectType')).toBe(this.tabularData.get("objectType"))
            expect(this.tabularDataProperties.get('objectName')).toBe(this.tabularData.get("objectName"))
        })
    })

    describe("iconFor", function() {
        var largeIconMap = {
            "CHORUS_VIEW": {
                "QUERY": "chorus_view_large.png"
            },

            "SOURCE_TABLE": {
                "BASE_TABLE": "source_table_large.png",
                "EXTERNAL_TABLE": "source_table_large.png",
                "MASTER_TABLE": "source_table_large.png",
                "VIEW": "source_view_large.png"
            },

            "SANDBOX_TABLE": {
                "BASE_TABLE": "sandbox_table_large.png",
                "EXTERNAL_TABLE": "sandbox_table_large.png",
                "MASTER_TABLE": "sandbox_table_large.png",
                "VIEW": "sandbox_view_large.png",
                "HDFS_EXTERNAL_TABLE": "sandbox_table_large.png"
            }
        };

        var mediumIconMap = {
            "CHORUS_VIEW": {
                "QUERY": "chorus_view_medium.png"
            },

            "SOURCE_TABLE": {
                "BASE_TABLE": "source_table_medium.png",
                "EXTERNAL_TABLE": "source_table_medium.png",
                "MASTER_TABLE": "source_table_medium.png",
                "VIEW": "source_view_medium.png"
            },

            "SANDBOX_TABLE": {
                "BASE_TABLE": "sandbox_table_medium.png",
                "EXTERNAL_TABLE": "sandbox_table_medium.png",
                "MASTER_TABLE": "sandbox_table_medium.png",
                "VIEW": "sandbox_view_medium.png",
                "HDFS_EXTERNAL_TABLE": "sandbox_table_medium.png"
            }
        };

        describe("when the 'size' option is set to 'medium'", function() {
            it("returns the medium version of the icon of the appropriate type", function() {
                _.each(mediumIconMap, function(subMap, type) {
                    _.each(subMap, function(filename, objectType) {

                        var model = fixtures.tabularData({ type: type, objectType: objectType});
                        expect(model.iconUrl({ size: "medium" })).toBe("/images/" + filename);

                    });
                });
            });
        });

        describe("when the 'size' option is set to 'large'", function() {
            it("returns the large version of the icon of the appropriate type", function() {
                _.each(largeIconMap, function(subMap, type) {
                    _.each(subMap, function(filename, objectType) {

                        var model = fixtures.tabularData({ type: type, objectType: objectType});
                        expect(model.iconUrl({ size: "large" })).toBe("/images/" + filename);

                    });
                });
            });
        });

        describe("when no 'size' option is given", function() {
            it("returns the large version of the icon of the appropriate type", function() {
                _.each(largeIconMap, function(subMap, type) {
                    _.each(subMap, function(filename, objectType) {

                        var model = fixtures.tabularData({ type: type, objectType: objectType});
                        expect(model.iconUrl()).toBe("/images/" + filename);

                    });
                });
            });
        });
    })

    describe("#isImportable", function() {
        it("returns false unless the object is a Dataset (with a workspace id)", function() {
            var table = fixtures.databaseObject();
            expect(table.isImportable()).toBeFalsy();

            var dataset = fixtures.datasetSandboxTable();
            expect(dataset.isImportable()).toBeTruthy();

            dataset = fixtures.datasetSandboxView();
            expect(dataset.isImportable()).toBeTruthy();

            dataset = fixtures.datasetSourceTable();
            expect(dataset.isImportable()).toBeTruthy();

            dataset = fixtures.datasetSourceView();
            expect(dataset.isImportable()).toBeTruthy();

            dataset = fixtures.datasetChorusView();
            expect(dataset.isImportable()).toBeTruthy();
        });
    });

    describe("#schema", function() {
        beforeEach(function() {
            this.schema = this.tabularData.schema();
        })
        it("returns a new schema with the right attributes", function() {
            expect(this.schema.get("instanceId")).toBe(this.tabularData.get("instance").id);
            expect(this.schema.get("databaseName")).toBe(this.tabularData.get("databaseName"));
            expect(this.schema.get("name")).toBe(this.tabularData.get("schemaName"));
            expect(this.schema.get("instanceName")).toBe(this.tabularData.get("instance").name);
        });

        it("memoizes", function() {
            expect(this.schema).toBe(this.tabularData.schema());
        });
    });

    describe("#lastComment", function() {
        beforeEach(function() {
            this.model = fixtures.tabularData();
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

        context("when the data doesn't have any comments", function() {
            it("returns null", function() {
                expect(fixtures.tabularData({recentComment: null}).lastComment()).toBeFalsy();
            });
        });
    });

    describe("#metaType", function() {
        var expectedTypeMap = {
            "BASE_TABLE": "table",
            "VIEW": "view",
            "QUERY": "query",
            "EXTERNAL_TABLE": "table",
            "MASTER_TABLE": "table",
            "CHORUS_VIEW": "view"
        }

        _.each(expectedTypeMap, function(str, type) {
            it("works for " + type, function() {
                expect(fixtures.tabularData({ objectType: type }).metaType()).toBe(str)
            });
        })
    });

    describe("#getEntityType", function() {
        var expectedEntityTypeMap = [
            { entityType: "databaseObject", attrs: { type: "SOURCE_TABLE" } },
            { entityType: "databaseObject", attrs: { type: "SANDBOX_TABLE" } },
            { entityType: "chorusView", attrs: { type: "CHORUS_VIEW" } },
            { entityType: "databaseObject", attrs: {} },
            { entityType: "chorusView", attrs: { entityType: "chorusView" } }
        ]

        _.each(expectedEntityTypeMap, function(obj) {
            it("works for " + obj.entityType, function() {
                expect(fixtures.tabularData(obj.attrs).getEntityType()).toBe(obj.entityType);
            });
        })


    })

    describe("the entity_type object attribute", function() {
        it("is recalculated when the 'type' attribute is changed", function() {
            expect(this.tabularData.entityType).toBe("databaseObject");
            this.tabularData.set({ type: "CHORUS_VIEW" })
            expect(this.tabularData.entityType).toBe("chorusView");
        })
    })

    describe("#preview", function() {
        context("with a table", function() {
            beforeEach(function() {
                this.tabularData.set({objectType: "BASE_TABLE", objectName: "foo"});
                this.preview = this.tabularData.preview();
            });

            checkPreview();

            it("should return a database preview", function() {
                expect(this.preview.get("instanceId")).toBe(this.tabularData.get("instance").id);
                expect(this.preview.get("databaseName")).toBe(this.tabularData.get("databaseName"));
                expect(this.preview.get("schemaName")).toBe(this.tabularData.get("schemaName"));
                expect(this.preview.get("tableName")).toBe(this.tabularData.get("objectName"));
            });
        });

        context("with a view", function() {
            beforeEach(function() {
                this.tabularData.set({objectType: "VIEW", objectName: "bar"});
                this.preview = this.tabularData.preview();
            });

            checkPreview();

            it("should return a database preview", function() {
                expect(this.preview.get("instanceId")).toBe(this.tabularData.get("instance").id);
                expect(this.preview.get("databaseName")).toBe(this.tabularData.get("databaseName"));
                expect(this.preview.get("schemaName")).toBe(this.tabularData.get("schemaName"));
                expect(this.preview.get("viewName")).toBe(this.tabularData.get("objectName"));
            });
        });

        context("with a chorus view", function() {
            beforeEach(function() {
                this.tabularData.set({id: '"2"|"dca_demo"|"some_schema"|"BASE_TABLE"|"Dataset1"', objectType: "QUERY", objectName: "my_chorusview", workspace: {id:"234", name: "abc"}});
                this.preview = this.tabularData.preview();
            });

            checkPreview();

            it("should return a dataset preview", function() {
                expect(this.preview.get("workspaceId")).toBe(this.tabularData.get("workspace").id);
                expect(this.preview.get("datasetId")).toBe(this.tabularData.get("id"));
            })
        });

        context("with a chorus view query ( when editing a chorus view )", function() {
            beforeEach(function() {
                this.tabularData.set({workspace: {id: "111", name: "abc"} , query: "select * from hello_world"});
                this.preview = this.tabularData.preview(true);
            });

            checkPreview();

            it("should return a dataset query preview", function() {
                expect(this.preview.get("query")).toBe("select * from hello_world");
                expect(this.preview.get("workspaceId")).toBe("111");
            });
        })

        function checkPreview() {
            it("should return a TabularDataPreview", function() {
                expect(this.preview).toBeA(chorus.models.TabularDataPreview);
            });

            it("should memoize the database preview", function() {
                expect(this.preview).toBe(this.tabularData.preview());
            });
        }
    });

    describe("#instance", function() {
        beforeEach(function() {
            this.instance = this.tabularData.instance();
        });

        it("returns an instance with the right id and name", function() {
            expect(this.instance).toBeA(chorus.models.Instance);
            expect(this.instance.get("id")).toBe(this.tabularData.get("instance").id);
            expect(this.instance.get("name")).toBe(this.tabularData.get("instance").name);
        });

        it("memoizes", function() {
            expect(this.instance).toBe(this.tabularData.instance());
        });
    });

    describe("#columns", function() {
        it("should memoize the result", function() {
            expect(this.tabularData.columns()).toBe(this.tabularData.columns());
        });

        it("should return a DatabaseColumnSet", function() {
            expect(this.tabularData.columns()).toBeA(chorus.collections.DatabaseColumnSet);
        })

        it("should have a reference back to the tabularData", function() {
            expect(this.tabularData.columns().attributes.tabularData).toBe(this.tabularData);
        })

        it("should pass the correct parameters to the DatabaseColumnSet", function() {
            var columns = this.tabularData.columns();
            expect(columns.attributes.instanceId).toBe(this.tabularData.get("instance").id);
            expect(columns.attributes.databaseName).toBe(this.tabularData.get("databaseName"));
            expect(columns.attributes.schemaName).toBe(this.tabularData.get("schemaName"));
        });

        context("when the object has a metaType of 'query'", function() {
            beforeEach(function() {
                spyOn(this.tabularData, 'metaType').andReturn('query');
                this.tabularData.set({ id: "ID" });
            });

            it("has a queryName of the tabularData id", function() {
                var columns = this.tabularData.columns();
                expect(columns.attributes.queryName).toBe(this.tabularData.get('id'));
            });
        });

        context("when the object is a table", function() {
            beforeEach(function() {
                this.tabularData.set({ objectType: "SOURCE_TABLE" });
            });

            it("passes its name to the column set as 'tableName'", function() {
                var columns = this.tabularData.columns();
                expect(columns.attributes.tableName).toBe(this.tabularData.get("objectName"));
                expect(columns.attributes.viewName).toBeFalsy();
            });
        });

        context("when the object is a view", function() {
            beforeEach(function() {
                this.tabularData.set({ objectType: "VIEW" });
            });

            it("passes its name to the column set as 'viewName'", function() {
                var columns = this.tabularData.columns();
                expect(columns.attributes.viewName).toBe(this.tabularData.get("objectName"));
                expect(columns.attributes.tableName).toBeFalsy();
            });
        });
    });

    describe("#quotedName", function() {
        beforeEach(function() {
            this.tabularData.set({objectName: "My_Object"});
        });

        it("uses the safePGName helper", function() {
            expect(this.tabularData.quotedName()).toBe(chorus.Mixins.dbHelpers.safePGName(this.tabularData.get("objectName")));
        });
    });

    describe("#selectName", function() {
        context("when a datasetNumber is not set", function() {
            it("returns the quotedName", function() {
                expect(this.tabularData.selectName()).toBe(this.tabularData.quotedName());
            });
        });

        context("when a datasetNumber is set", function() {
            beforeEach(function() {
                this.tabularData.setDatasetNumber(1);
            });

            it("returns the alias", function() {
                expect(this.tabularData.selectName()).toBe("a");
            });
        });
    });

    describe("#fromClause", function() {
        context("when a datasetNumber is not set", function() {
            it("returns the quotedName", function() {
                expect(this.tabularData.fromClause()).toBe(this.tabularData.quotedName());
            });
        });

        context("when a datasetNumber is set", function() {
            beforeEach(function() {
                this.tabularData.setDatasetNumber(1);
            });

            it("returns the aliased from clause", function() {
                expect(this.tabularData.fromClause()).toBe(this.tabularData.quotedName() + " AS a");
            });
        });

        context("when the model has a 'query'", function() {
            beforeEach(function() {
                this.tabularData = fixtures.datasetChorusView();
            })

            context("when a datasetNumber is not set", function() {
                it("returns the query aliased as the objectName", function() {
                    var expectedFrom = "(" + this.tabularData.get('query') + ') AS ' + this.tabularData.quotedName();
                    expect(this.tabularData.fromClause()).toBe(expectedFrom);
                });
            });

            context("when a datasetNumber is set", function() {
                beforeEach(function() {
                    this.tabularData.setDatasetNumber(1);
                });

                it("returns the query aliased as the aliasedName", function() {
                    var expectedFrom = "(" + this.tabularData.get('query') + ') AS ' + this.tabularData.aliasedName;
                    expect(this.tabularData.fromClause()).toBe(expectedFrom);
                });
            });
        });
    });

    describe("#setDatasetNumber", function() {
        beforeEach(function() {
            this.tabularData.setDatasetNumber(4)
        })

        it("sets the datasetNumber", function() {
            expect(this.tabularData.datasetNumber).toBe(4);
        })

        it("sets the aliasedName", function() {
            expect(this.tabularData.aliasedName).toBe('d');
        })
    });

    describe("#clearDatasetNumber", function() {
        beforeEach(function() {
            this.tabularData.setDatasetNumber(4)
            this.tabularData.clearDatasetNumber()
        })

        it("unsets the datasetNumber", function() {
            expect(this.tabularData.datasetNumber).toBeUndefined();
        })

        it("unsets the aliasedName", function() {
            expect(this.tabularData.aliasedName).toBeUndefined();
        })
    })

    describe("#makeBoxplotTask", function() {
        beforeEach(function() {
            this.task = this.tabularData.makeBoxplotTask({
                xAxis: "dog_breed",
                yAxis: "blindness_rate"
            });
        });

        it("returns a BoxplotTask model", function() {
            expect(this.task).toBeA(chorus.models.BoxplotTask);
        });

        it("has the tabularData", function() {
            expect(this.task.tabularData).toBe(this.tabularData);
        });
    });

    describe("#makeHistogramTask", function() {
        beforeEach(function() {
            this.task = this.tabularData.makeHistogramTask({
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

        it("has the tabularData", function() {
            expect(this.task.tabularData).toBe(this.tabularData);
        });
    });

    describe("#makeHeatmapTask", function() {
        beforeEach(function() {
            this.task = this.tabularData.makeHeatmapTask({
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

        it("has the tabularData", function() {
            expect(this.task.tabularData).toBe(this.tabularData);
        });
    });

    describe("#makeFrequencyTask", function() {
        beforeEach(function() {
            this.task = this.tabularData.makeFrequencyTask({
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

        it("has the tabularData and bins", function() {
            expect(this.task.tabularData).toBe(this.tabularData);
            expect(this.task.get("bins")).toBe("12")
        });
    })

    describe("#makeTimeseriesTask", function() {
        beforeEach(function() {
            this.task = this.tabularData.makeTimeseriesTask({
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

        it("has the tabularData", function() {
            expect(this.task.tabularData).toBe(this.tabularData);
        });

        it("has the right timeType", function() {
            expect(this.task.get("timeType")).toBe('datetime')
        })
    });

    describe("#asDataset", function() {
        it("converts the object to a dataset", function() {
            var dataset = this.tabularData.asDataset();
            expect(dataset).toBeA(chorus.models.Dataset);
            expect(dataset.attributes).toEqual(this.tabularData.attributes);
        })
    })

});
