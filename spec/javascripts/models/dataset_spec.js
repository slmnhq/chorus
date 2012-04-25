describe("chorus.models.Dataset", function() {
    beforeEach(function() {
        this.dataset = newFixtures.dataset.sourceView({
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
        expect(this.dataset.showUrl()).toMatchUrl('#/workspaces/44/datasets/'+(encodeURIComponent(this.dataset.id)));
    });

    it("creates the correct showUrl with an ugly ID", function() {
        this.dataset.set({id: "foo#bar"});
        expect(this.dataset.showUrl()).toBe('#/workspaces/44/datasets/foo%23bar');
    });

    context("when the object has an id", function() {
        it("has the right url", function() {
            var url = encodeURI('/workspace/44/dataset/"45"|"whirling_tops"|"diamonds"|"foo"|"japanese_teas"');
            expect(this.dataset.url()).toMatchUrl(url);
        });

        it("has the right url with an ugly ID", function() {
            this.dataset.set({id: "foo#bar"});
            expect(this.dataset.url()).toBe("/workspace/44/dataset/foo%23bar");
        });
    });

    context("when the object does not have an id", function() {
        beforeEach(function() {
            this.dataset.unset("id");
        });

        it("has the right url", function() {
            expect(this.dataset.url()).toMatchUrl("/workspace/44/dataset");
        });
    })

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

    describe("#isChorusView", function() {
        context("when the dataset is a chorus view", function() {
            beforeEach(function() {
                this.dataset.set({type: "CHORUS_VIEW", query: "SELECT * FROM whatever"});
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

    describe("#createDuplicateChorusView", function() {
        beforeEach(function() {
            this.model = newFixtures.dataset.chorusView();
            this.copy = this.model.createDuplicateChorusView();
        });

        it("returns a chorus view with the right data", function() {
            expect(this.copy).toBeA(chorus.models.ChorusView);
            expect(this.copy.get("objectName")).toMatchTranslation("dataset.chorusview.copy_name", { name: this.model.get("objectName") });

            _.each(["workspace", "databaseName", "schemaName"], function(attrName) {
                expect(this.copy.get(attrName)).toBe(this.model.get(attrName));
                expect(this.copy.get(attrName)).toBeDefined();
            }, this);

            expect(this.copy.get("instanceId")).toBe(this.model.get("instance").id);
            expect(this.copy.get("sourceObjectId")).toBe(this.model.id);
        });

        it("does not give the chorus view an id", function() {
            expect(this.copy.get("id")).toBeUndefined();
        });
    });

    describe("#statistics", function() {
        context("for a chorus view", function() {
            beforeEach(function() {
                this.dataset.set({ type: "CHORUS_VIEW" })
            });

            it("sets the workspace info into the statistics object", function() {
                expect(this.dataset.statistics().get("workspace")).toEqual(this.dataset.get("workspace"))
            })

            it("sets the dataset id onto the statistics object as 'datasetId'", function() {
                expect(this.dataset.statistics().datasetId).toBe(this.dataset.get("id"))
            })
        })
    })

    describe("#activities", function() {
        context("for a chorus view", function() {
            beforeEach(function() {
                this.dataset.set({ type: "CHORUS_VIEW" })
            });

            it("sets the workspace info into the ActivitySet object", function() {
                expect(this.dataset.activities().attributes.workspace).toEqual(this.dataset.get("workspace"))
            })
        })

        context("for a non-chorus view", function() {
            beforeEach(function() {
                this.dataset.set({ type: "SANDBOX_TABLE" })
            });

            it("does not set the workspace info into the ActivitySet object", function() {
                expect(this.dataset.activities().attributes.workspace).toBeUndefined();
            })
        })
    })

    describe("#iconUrl", function() {
        context("when the user does not have credentials", function() {
            beforeEach(function() {
                this.dataset = newFixtures.dataset.sourceView()
                this.unlockedIconUrl = this.dataset.iconUrl();
                this.dataset.set({hasCredentials: false});
            });

            it("has the locked version of the icon", function() {
                var lockedIconUrl = this.dataset.iconUrl();
                expect(lockedIconUrl).toBe(this.unlockedIconUrl.replace(".png", "_locked.png"));
            });
        })
    })

    describe("#columns", function() {
        it("returns a DatabaseColumnSet with a workspaceId", function() {
            expect((this.dataset).columns().attributes.workspaceId).toBe(this.dataset.get('workspace').id);
        });
    });

    describe("getImport", function() {
        it("returns a DatasetImport object with the right ids", function() {
            expect(this.dataset.getImport().get("datasetId")).toBe(this.dataset.id);
            expect(this.dataset.getImport().get("workspaceId")).toBe(this.dataset.get("workspace").id);
        });

        it("memoizes", function() {
            expect(this.dataset.getImport()).toBe(this.dataset.getImport());
        })
    });

    describe("#deriveChorusView", function() {
        beforeEach(function() {
            this.chorusView = this.dataset.deriveChorusView();
        });

        it("returns a chorus view", function() {
            expect(this.chorusView).toBeA(chorus.models.ChorusView);
        });

        it("has the right 'sourceObject'", function() {
            expect(this.chorusView.sourceObject).toBe(this.dataset);
        });

        it('sets the sourceObjectId', function() {
            expect(this.chorusView.get('sourceObjectId')).toBe(this.dataset.get('id'));
        });

        it("gives the chorus view a default name", function() {
            expect(this.chorusView.get('objectName')).toBe(this.dataset.get("objectName"));
        });

        it("has the right data from the dataset", function() {
            expect(this.chorusView).toHaveAttrs({
                instanceId: this.dataset.get("instance").id,
                databaseName: this.dataset.get("databaseName"),
                schemaName: this.dataset.get("schemaName"),
                workspace: this.dataset.get("workspace"),
                instance: this.dataset.get("instance")
            });
        });
    });

    describe("#hasOwnPage", function() {
        it("returns true", function() {
            expect(this.dataset.hasOwnPage()).toBeTruthy();
        })
    })

    describe("#lastImportSource", function() {
        context("when the dataset has been imported into (and has a 'importInfo' key)", function() {
            beforeEach(function() {
                this.dataset.set({ importInfo: {
                    completedStamp: "2012-02-29 14:35:38.165",
                    sourceId: '"10032"|"dca_demo"|"ddemo"|"BASE_TABLE"|"a2"',
                    sourceTable: "some_source_table"
                }})
                this.source = this.dataset.lastImportSource();
            });

            it("returns a dataset", function() {
                expect(this.source).toBeA(chorus.models.Dataset);
            });

            it("has the right name, id and workspace id", function() {
                expect(this.source.get("id")).toBe('"10032"|"dca_demo"|"ddemo"|"BASE_TABLE"|"a2"');
                expect(this.source.get("workspaceId")).toBe(this.dataset.get("workspace").id);
                expect(this.source.get("objectName")).toBe("some_source_table");
            });
        });

        context("when the dataset has NOT been imported into", function() {
            it("returns undefined", function() {
                this.dataset.unset("importInfo");
                expect(this.dataset.lastImportSource()).toBeUndefined();
            });
        });
    });

    describe("#importFrequency", function() {
        beforeEach(function() {
            this.dataset.set({importFrequency: 'WEEKLY'});
        })

        context("when the dataset's import is not loaded", function() {
            it("returns the importFrequency", function() {
                this.dataset.setImport(undefined);
                expect(this.dataset.importFrequency()).toBe('WEEKLY');
            })
        });

        context("when dataset's import is loaded", function() {
            beforeEach(function() {
                this.dataset.getImport().fetch();
                this.server.completeFetchFor(this.dataset.getImport(), { scheduleInfo: { frequency: "DAILY" }});
            });

            context("and its schedule is active", function(){
                it("returns the frequency of the import", function() {
                    spyOn(this.dataset.getImport(), "hasActiveSchedule").andReturn(true);
                    expect(this.dataset.importFrequency()).toBe("DAILY");
                });
            });

            context("and its schedule is inactive", function(){
                 it("returns undefined for the frequency", function(){
                     spyOn(this.dataset.getImport(), "hasActiveSchedule").andReturn(false);
                     expect(this.dataset.importFrequency()).toBeUndefined();
                 });
            });
        });
    });

    describe("#setWorkspace", function() {
        beforeEach(function() {
            this.newWorkspace = newFixtures.workspace();
            this.dataset.setWorkspace(this.newWorkspace);
        });

        it("should set the workspace object properly", function() {
            expect(this.dataset.get("workspace").id).toBe(this.newWorkspace.get("id"))
        })
    })
})
