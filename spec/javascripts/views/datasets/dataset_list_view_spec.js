describe("chorus.views.DatasetList", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatasetSet([fixtures.datasetChorusView(), fixtures.datasetSandboxTable(), fixtures.datasetSourceTable({recentComment: null })]);
        this.collection.loaded = true;
        this.view = new chorus.views.DatasetList({collection: this.collection});
    })

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
            this.instance = this.collection.models[0].get('instance')
        });

        it("renders an item for each dataset", function() {
            expect(this.view.$("> li").length).toBe(this.collection.length);
        });

        it("links the datasets to their show page", function() {
            _.each(this.collection.models, function(dataset, index) {
                expect(this.view.$("li:eq(" + index + ") a.name")).toHaveAttr("href", this.collection.at(index).showUrl())
            }, this);
        })

        it("displays the datasets' names", function() {
            for (var i = 0; i < this.collection.length; i++) {
                expect(this.view.$("a.name").eq(i).text().trim()).toBe(this.collection.models[i].get("objectName"));
            }
        })

        it("links the small instance breadcrumb to the BrowseDatasetDialog, set to instance", function() {
            expect(this.view.$(".location a:eq(0)")).toHaveClass("dialog")
            expect(this.view.$(".location a:eq(0)").attr("data-dialog")).toBe("BrowseDatasets")
            expect(this.view.$(".location a:eq(0)").data("instance")).toEqual(this.instance);
        })

        it("links the small database breadcrumb to the BrowseDatasetDialog, set to database", function() {
            expect(this.view.$(".location a:eq(1)")).toHaveClass("dialog")
            expect(this.view.$(".location a:eq(1)").attr("data-dialog")).toBe("BrowseDatasets")
            expect(this.view.$(".location a:eq(1)").data("instance")).toEqual(this.instance);
            expect(this.view.$(".location a:eq(1)").data("databaseName")).toEqual(
                this.collection.models[0].get('databaseName'));
        })

        it("links the small schema breadcrumb to the show URL of the schema", function() {
            expect(this.view.$(".location a:eq(2)").attr('href')).toBe(this.collection.models[0].schema().showUrl())
        })

        it("displays an icon for each dataset", function() {
            expect(this.view.$("li img").length).toBe(3);
            for (var i = 0; i < this.collection.length; i++) {
                var model = this.collection.models[i];
                expect(this.view.$("li img").eq(i).attr("src")).toBe(model.iconUrl());
            }
        });

        it("does not create comment markup when there's no comment exist", function() {
            expect(this.view.$("li:eq(2) .comment")).not.toExist();
        });

        it("creates comment markup when there's no comment exist", function() {
            expect(this.view.$("li:eq(0) .comment")).toExist();
        });

        it("does not render the disabled names", function() {
            expect(this.view.$(".name_disabled")).not.toExist();
        });

        context("when browsingSchema is true", function() {
            beforeEach(function() {
                this.view.options.browsingSchema = true;
                this.view.render();
            });

            it("does not link the datasets' names", function() {
                expect(this.view.$("a.name")).not.toExist();
            });

            it("does not link the datasets' image", function() {
                expect(this.view.$("a img")).not.toExist();
            });

            it("does include the datasets' image", function() {
                expect(this.view.$("div.image img")).toExist();
            });

            it("does renders the disabled names", function() {
                expect(this.view.$(".name_disabled")).toExist();
            });

            context("when there is exactly 1 'found in' workspace", function() {
                itIncludesTheFoundInWorkspaceInformation();

                it("should not indicate there are any other workspaces", function() {
                    expect(this.view.$(".found_in .other")).not.toExist();
                })
            })

            context("when there are exactly 2 'found in' workspaces", function() {
                beforeEach(function() {
                    this.collection.each(function(model) {
                        var hash = model.get("workspaceUsed");
                        hash.workspaceList = [fixtures.workspaceJson(), fixtures.workspaceJson()];
                        hash.workspaceCount = 2;
                    });
                    this.view.render();
                });

                itIncludesTheFoundInWorkspaceInformation();

                it("should indicate there is 1 other workspace", function() {
                    _.each(this.collection.models, function(model, index) {
                        expect(this.view.$(".found_in .other").eq(index).text()).toContainTranslation("dataset.and_others.one");
                    }, this)
                })
            })

            context("when there are exactly 3 'found in' workspaces", function() {
                beforeEach(function() {
                    this.collection.each(function(model) {
                        var hash = model.get("workspaceUsed");
                        hash.workspaceList = [fixtures.workspaceJson(), fixtures.workspaceJson(), fixtures.workspaceJson()];
                        hash.workspaceCount = 3;
                    });
                    this.view.render();
                });

                itIncludesTheFoundInWorkspaceInformation();

                it("should indicate there is 2 other workspaces", function() {
                    _.each(this.collection.models, function(model, index) {
                        expect(this.view.$(".found_in .other").eq(index).text()).toContainTranslation("dataset.and_others.other",
                            {count: 2});
                    }, this)
                })
            })

            context("when there aren't any 'found in' workspaces", function() {
                beforeEach(function() {
                    this.collection.each(function(model) {
                        var hash = model.get("workspaceUsed");
                        hash.workspaceList = [];
                        hash.workspaceCount = 0;
                    });
                    this.view.render();
                });

                it("does not render .found_in", function() {
                    expect(this.view.$(".found_in")).not.toExist();
                });
            });

            function itIncludesTheFoundInWorkspaceInformation() {
                it("includes the 'found in workspace' information", function() {
                    _.each(this.collection.models, function(model, index) {
                        var workspace = new chorus.models.Workspace(model.get("workspaceUsed").workspaceList[0]);
                        var workspaceLink = chorus.helpers.linkTo(workspace.showUrl(), workspace.get('name'));
                        expect(this.view.$(".found_in").eq(index).html()).toContainTranslation("dataset.found_in",
                            { workspaceLink: workspaceLink });
                        expect(this.view.$(".found_in a").eq(index).attr("href")).toMatchUrl(workspace.showUrl());
                    }, this)
                });
            }
        });


        it("displays the location of the dataset", function() {
            for (var i = 0; i < this.collection.length; i++) {
                var model = this.collection.models[i];
                expect(this.view.$("li .location").eq(i).find("a").eq(0).text()).toBe(model.get("instance").name);
                expect(this.view.$("li .location").eq(i).find("a").eq(1).text()).toBe(model.get("databaseName"));
                expect(this.view.$("li .location").eq(i).find("a").eq(2).text()).toBe(model.get("schemaName"));
            }
        })

        context("when no item was previously selected", function() {
            it("pre-selects the first item", function() {
                expect(this.view.$("li").eq(0)).toHaveClass("selected");
            });
        });

        context("when an item was previously selected", function() {
            beforeEach(function() {
                this.view.$("li:eq(1)").click();
                this.view.render();
            })

            it("restores that item selection", function() {
                expect(this.view.$("li").eq(0)).not.toHaveClass("selected");
                expect(this.view.$("li").eq(1)).toHaveClass("selected");
            })
        })

        describe("clicking an li", function() {
            beforeEach(function() {
                spyOn(chorus.PageEvents, "broadcast").andCallThrough();
                this.view.$("li").eq(1).click();
            });

            it("selects only that item", function() {
                expect(this.view.$("li.selected").length).toBe(1);
                expect(this.view.$("li").eq(1)).toHaveClass("selected");
            });

            it("broadcasts dataset:selected with an argument of the selected dataset", function() {
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("dataset:selected", this.collection.models[1]);
            });
        });
    });
});
