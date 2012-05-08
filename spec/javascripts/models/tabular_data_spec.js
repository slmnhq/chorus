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
            expect(this.tabularDataProperties.get("metaType")).toBe(this.tabularData.metaType())
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

    describe("#canBeImportSource", function() {
        it("returns true if the object is a Dataset (with a workspace id) but not a Sandbox Dataset", function() {
            var table = newFixtures.databaseObject();
            expect(table.canBeImportSource()).toBeFalsy();

            var dataset = newFixtures.dataset.sandboxTable();
            expect(dataset.canBeImportSource()).toBeFalsy();

            dataset = newFixtures.dataset.sandboxView();
            expect(dataset.canBeImportSource()).toBeFalsy();

            dataset = newFixtures.dataset.sourceTable();
            expect(dataset.canBeImportSource()).toBeTruthy();

            dataset = newFixtures.dataset.sourceView();
            expect(dataset.canBeImportSource()).toBeTruthy();

            dataset = newFixtures.dataset.chorusView();
            expect(dataset.canBeImportSource()).toBeTruthy();
        });
    });

    describe("#canBeImportDestination", function() {
        it("returns true if the object is a Dataset (with a workspace id)", function() {
            var table = newFixtures.databaseObject();
            expect(table.canBeImportDestination()).toBeFalsy();

            var dataset = newFixtures.dataset.sandboxTable();
            expect(dataset.canBeImportDestination()).toBeTruthy();

            dataset = newFixtures.dataset.sandboxView();
            expect(dataset.canBeImportDestination()).toBeTruthy();

            dataset = newFixtures.dataset.sourceTable();
            expect(dataset.canBeImportDestination()).toBeTruthy();

            dataset = newFixtures.dataset.sourceView();
            expect(dataset.canBeImportDestination()).toBeTruthy();

            dataset = newFixtures.dataset.chorusView();
            expect(dataset.canBeImportDestination()).toBeTruthy();
        });
    });

    describe("#database", function() {
        beforeEach(function() {
            this.database = this.tabularData.database();
        })

        it("returns a new database with the right attributes", function() {
            expect(this.database.get("instanceId")).toBe(this.tabularData.get("instance").id);
            expect(this.database.get("instanceName")).toBe(this.tabularData.get("instance").name);
            expect(this.database.get("name")).toBe(this.tabularData.get("databaseName"));
        });

        it("memoizes", function() {
            expect(this.database).toBe(this.tabularData.database());
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
            expect(creator.get("first_name")).toBe(this.lastCommentJson.author.first_name);
            expect(creator.get("last_name")).toBe(this.lastCommentJson.author.last_name);
        });

        it("is loaded", function() {
            expect(this.comment.loaded).toBeTruthy();
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
                expect(this.preview).toBeA(chorus.models.DataPreviewTask);
                expect(this.preview.get("instanceId")).toBe(this.tabularData.get("instance").id);
                expect(this.preview.get("databaseName")).toBe(this.tabularData.get("databaseName"));
                expect(this.preview.get("schemaName")).toBe(this.tabularData.get("schemaName"));
                expect(this.preview.get("objectName")).toBe(this.tabularData.get("objectName"));
                expect(this.preview.get("objectType")).toBe("BASE_TABLE");
            });
        });

        context("with a view", function() {
            beforeEach(function() {
                this.tabularData.set({objectType: "VIEW", objectName: "bar"});
                this.preview = this.tabularData.preview();
            });

            checkPreview();

            it("should return a database preview", function() {
                expect(this.preview).toBeA(chorus.models.DataPreviewTask);
                expect(this.preview.get("taskType")).toBe("previewTableOrView");
                expect(this.preview.get("instanceId")).toBe(this.tabularData.get("instance").id);
                expect(this.preview.get("databaseName")).toBe(this.tabularData.get("databaseName"));
                expect(this.preview.get("schemaName")).toBe(this.tabularData.get("schemaName"));
                expect(this.preview.get("objectName")).toBe(this.tabularData.get("objectName"));
                expect(this.preview.get("objectType")).toBe("VIEW");
            });
        });

        context("with a chorus view", function() {
            beforeEach(function() {
                this.tabularData = newFixtures.dataset.chorusView({
                    query: "select * from hello_world",
                    objectName: "my_chorusview",
                    workspace: {id: "234", name: "abc"}
                });
                this.preview = this.tabularData.preview();
            });

            checkPreview();

            it("should return a dataset preview", function() {
                expect(this.preview).toBeA(chorus.models.ChorusViewPreviewTask);
                expect(this.preview.get("workspaceId")).toBe("234");
                expect(this.preview.get("instanceId")).toBe(this.tabularData.get("instance").id);
                expect(this.preview.get("databaseName")).toBe(this.tabularData.get("databaseName"));
                expect(this.preview.get("schemaName")).toBe(this.tabularData.get("schemaName"));
                expect(this.preview.get("query")).toBe("select * from hello_world");
            });
        });

        context("with a chorus view (from search API)", function() {
            beforeEach(function() {
                this.tabularData = newFixtures.dataset.chorusViewSearchResult({
                    content: "select * from hello_world",
                    objectName: "my_chorusview",
                    workspace: {id: "234", name: "abc"}
                });
                this.preview = this.tabularData.preview();
            });

            checkPreview();

            it("should return a dataset preview", function() {
                expect(this.preview).toBeA(chorus.models.ChorusViewPreviewTask);
                expect(this.preview.get("workspaceId")).toBe("234");
                expect(this.preview.get("instanceId")).toBe(this.tabularData.get("instance").id);
                expect(this.preview.get("databaseName")).toBe(this.tabularData.get("databaseName"));
                expect(this.preview.get("schemaName")).toBe(this.tabularData.get("schemaName"));
                expect(this.preview.get("query")).toBe("select * from hello_world");
            });
        });

        function checkPreview() {
            it("should return a Task", function() {
                expect(this.preview).toBeA(chorus.models.Task);
                expect(this.preview.get("checkId")).not.toBeUndefined();
            });

            it("should not memoize the database preview", function() {
                expect(this.preview).not.toBe(this.tabularData.preview());
            });
        }
    });

    describe("#download", function() {
        beforeEach(function() {
            this.tabularData.set({ id: '"foo"|"bar"|"baz"' });
            spyOn(jQuery, "download");
        });

        context("when no number of rows is passed", function() {
            it("includes the number of rows", function() {
                this.tabularData.download();
                expect($.download).toHaveBeenCalledWith("/edc/data/csvDownload", {
                    datasetId: this.tabularData.id
                }, "get");
            });
        });

        context("when a number of rows is passed", function() {
            it("makes a request to the tabular data download api", function() {
                this.tabularData.download({ rows: "345" });
                expect($.download).toHaveBeenCalledWith("/edc/data/csvDownload", {
                    datasetId: this.tabularData.id,
                    numOfRow: "345"
                }, "get");
            });
        });
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

    describe("#toText", function() {
        context("with lowercase names", function() {
            beforeEach(function() {
                this.tabularData.set({objectName: "tabler", schemaName: "party_schema" })
            });

            it("formats the string to put into the sql editor", function() {
                expect(this.tabularData.toText()).toBe('party_schema.tabler');
            });
        });

        context("with uppercase names", function() {
            beforeEach(function() {
                this.tabularData.set({objectName: "Tabler", schemaName: "PartyMAN"});
            });

            it("puts quotes around the uppercase names", function() {
                expect(this.tabularData.toText()).toBe('"PartyMAN"."Tabler"');
            });
        });

        context("with chorus view", function() {
            beforeEach(function() {
                this.tabularData = fixtures.chorusView({objectName: "ChorusView", query: "SELECT a,b FROM xyz;"});
            });

            it("creates an appropriate string (trimmed, remove semicolon, and alias to pg-quoted CV name)", function() {
                expect(this.tabularData.toText()).toBe('(SELECT a,b FROM xyz) AS "ChorusView"');
            });
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
            it("returns the quoted schema name and table name", function() {
                expect(this.tabularData.fromClause()).toBe(this.tabularData.get("schemaName") + "." + this.tabularData.quotedName());
            });
        });

        context("when a datasetNumber is set", function() {
            beforeEach(function() {
                this.tabularData.setDatasetNumber(1);
            });

            it("returns the aliased from clause", function() {
                expect(this.tabularData.fromClause()).toBe(this.tabularData.get("schemaName") + "." + this.tabularData.quotedName() + " AS a");
            });
        });

        context("when the model has a 'query'", function() {
            beforeEach(function() {
                this.tabularData = newFixtures.dataset.chorusView();
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

    describe("#workspace", function() {
        it("is a chorus.models.Workspace", function() {
            expect(this.tabularData.workspace()).toBeA(chorus.models.Workspace);
        });
    });

    describe("#workspacesAssociated", function() {
        context("when there are workspaces associated", function() {
            beforeEach(function() {
                this.tabularData = fixtures.tabularData({workspaceUsed: {
                    count: 2,
                    workspaceList: [
                        {id: "43", name: "working_hard"},
                        {id: "54", name: "hardly_working"}
                    ]
                }});

            });
            it("returns a workspace set with the right data", function() {
                var workspaces = this.tabularData.workspacesAssociated();
                expect(workspaces).toBeA(chorus.collections.WorkspaceSet);
                expect(workspaces.length).toBe(2);
                expect(workspaces.at(0).get("id")).toBe("43");
                expect(workspaces.at(1).get("id")).toBe("54");
                expect(workspaces.at(0).get("name")).toBe("working_hard");
                expect(workspaces.at(1).get("name")).toBe("hardly_working");
            });
        });

        context("when there are NOT workspaces associated", function() {
            beforeEach(function() {
                this.tabularData.unset("workspaceUsed");
                delete this.tabularData._workspaceAssociated;
            });
            it("returns an empty workspaceSet", function() {
                var workspaces = this.tabularData.workspacesAssociated();
                expect(workspaces.length).toBe(0);
            });
        });

        describe("when the workspaceUsed attribute is changed", function() {
            beforeEach(function() {
                this.tabularData.unset("workspaceUsed");
                delete this.tabularData._workspaceAssociated;
                this.oldWorkspaces = this.tabularData.workspacesAssociated();
                expect(this.oldWorkspaces.length).toBe(0);

                this.tabularData.set({workspaceUsed: {
                    count: 2,
                    workspaceList: [
                        {id: "43", name: "working_hard"},
                        {id: "54", name: "hardly_working"}
                    ]
                }});
            });

            it("is invalidated", function() {
                expect(this.tabularData.workspacesAssociated()).not.toEqual(this.oldWorkspaces);
                expect(this.tabularData.workspacesAssociated().length).toBe(2);
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

    describe("#isDeleteable", function() {
        it("is true when the tabular data is a source table", function() {
            expect(newFixtures.dataset.sourceTable().isDeleteable()).toBeTruthy();
        });

        it("is true when the tabular data is a source view", function() {
            expect(newFixtures.dataset.sourceView().isDeleteable()).toBeTruthy();
        });

        it("is true when the tabular data is a chorus view", function() {
            expect(newFixtures.dataset.chorusView().isDeleteable()).toBeTruthy();
        });

        it("is false otherwise", function() {
            expect(newFixtures.dataset.sandboxTable().isDeleteable()).toBeFalsy();
        });
    });

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
        });
    });

    describe("#canAnalyze", function() {
        it("returns true for a sandbox table", function() {
            this.tabularData = newFixtures.dataset.sandboxTable();
            expect(this.tabularData.canAnalyze()).toBeTruthy();
        });

        it("returns true for a source table", function() {
            this.tabularData = fixtures.databaseTable();
            expect(this.tabularData.canAnalyze()).toBeTruthy();
        });

        it("returns false for views", function() {
            this.tabularData = newFixtures.dataset.sandboxView();
            expect(this.tabularData.canAnalyze()).toBeFalsy();
        });

        it("returns false for Chorus views", function() {
            this.tabularData = fixtures.chorusView();
            expect(this.tabularData.canAnalyze()).toBeFalsy();
        });

        it("returns false for external tables", function() {
            this.tabularData = newFixtures.dataset.externalTable();
            expect(this.tabularData.canAnalyze()).toBeFalsy();
        });
    });

    describe("Analyze", function() {
        beforeEach(function() {
            this.tabularData = fixtures.tabularData({
                instance: {id: "2"},
                databaseName: "db",
                schemaName: "myScheme",
                objectName: "MrTable",
                objectType: "BASE_TABLE"
            });
        });

        it("returns a TabularDataAnalyze model", function() {
            expect(this.tabularData.analyze()).toBeA(chorus.models.TabularDataAnalyze);
        });

        it("memoizes", function() {
            expect(this.tabularData.analyze()).toBe(this.tabularData.analyze());
        });

        it("returns an analyze model with the right url", function() {
            expect(this.tabularData.analyze().url()).toBe("/data/2/database/db/schema/myScheme/table/MrTable/analyze")
        });
    });
});
