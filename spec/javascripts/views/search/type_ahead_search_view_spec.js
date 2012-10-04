describe("chorus.views.TypeAheadSearch", function() {
    beforeEach(function() {
        this.result = rspecFixtures.typeAheadSearchResult();
        this.result.set({query: "test"});
        this.view = new chorus.views.TypeAheadSearch();
        this.view.searchFor("test");
    });

    it("should fetch the search result", function() {
        expect(this.result).toHaveBeenFetched();
    });

    describe("when the fetch completes with results", function() {
        beforeEach(function() {
            this.view.resultLimit = 100;
            this.server.completeFetchFor(this.result);
            this.results = this.result.results()
        });

        it("should have one entry for each item in the result", function() {
            expect(this.view.$("li.result").length).toBe(this.result.results().length);
        });

        it("should show the link to show all search result", function() {
            expect(this.view.$("li:eq(0)").text().trim()).toMatchTranslation("type_ahead.show_all_results", {query: "test"});
            expect(this.view.$("li:eq(0) a").attr("href")).toBe("#/search/test");
        });

        it("should display the correct name and type for hdfs", function() {
            var hdfs = resultForEntityType(this.results, 'hdfs_file');
            var resultIndex = this.results.indexOf(hdfs);
            var result = this.view.$("li.result:eq("+ resultIndex +")");
            expect(result.find(".name").html()).toBe(hdfs.get("highlightedAttributes").name[0]);
            expect(result.find(".name").attr("href")).toBe(hdfs.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.hdfs_file");
        });

        it("should display nothing for hdfs binary file", function(){
            _.each(this.result.get("typeAhead").results, function(entry) { if(entry.entityType == "hdfs_file") {entry.isBinary = true; } });
            this.view.model = this.result;
            this.view.render();
            expect(this.view.$("span.type")).not.toContainTranslation("type_ahead.entity.hdfs_file");
        });

        it("should display the correct name and type for workspace", function() {
            var workspace = resultForEntityType(this.results, 'workspace');
            var resultIndex = this.results.indexOf(workspace);
            var result = this.view.$("li.result:eq("+ resultIndex +")");
            expect(result.find(".name").html()).toBe(workspace.get("highlightedAttributes").name[0]);
            expect(result.find(".name").attr("href")).toBe(workspace.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.workspace");
        });

        it("should display the correct name and type for greenplum_instance", function() {
            var instance = resultForEntityType(this.results, 'greenplum_instance');
            var resultIndex = this.results.indexOf(instance);
            var result = this.view.$("li.result:eq("+ resultIndex +")");
            expect(result.find(".name").html()).toBe(instance.get("highlightedAttributes").name[0]);
            expect(result.find(".name").attr("href")).toBe(instance.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.greenplum_instance");
        });

        it("should display the correct name and type for hadoop_instance", function() {
            var instance = resultForEntityType(this.results, 'hadoop_instance');
            var resultIndex = this.results.indexOf(instance);
            var result = this.view.$("li.result:eq("+ resultIndex +")");
            expect(result.find(".name").html()).toBe(instance.get("highlightedAttributes").name[0]);
            expect(result.find(".name").attr("href")).toBe(instance.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.hadoop_instance");
        });

        it("should display the correct name and type for user", function() {
            var user = resultForEntityType(this.results, 'user');
            var resultIndex = this.results.indexOf(user);
            var result = this.view.$("li.result:eq("+ resultIndex +")");
            expect(result.find(".name").html()).toBe((user.get("highlightedAttributes").firstName[0] + ' ' + user.get("lastName")));
            expect(result.find(".name").attr("href")).toBe(user.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.user");
        });

        it("should display the correct name and type for workfile", function() {
            var workfile = resultForEntityType(this.results, 'workfile');
            var resultIndex = this.results.indexOf(workfile);
            var result = this.view.$("li.result:eq("+ resultIndex +")");
            expect(result.find(".name").html()).toBe(workfile.get("highlightedAttributes").fileName[0]);
            expect(result.find(".name").attr("href")).toBe(workfile.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.workfile");
        });

        it("should display the correct name and type for dataset", function() {
            var dataset = resultForEntityType(this.results, 'dataset');
            var resultIndex = this.results.indexOf(dataset);
            var result = this.view.$("li.result:eq("+ resultIndex +")");
            expect(result.find(".name").html()).toBe(dataset.get("highlightedAttributes").objectName[0]);
            expect(result.find(".name").attr("href")).toBe(dataset.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.dataset");
        });

        it("should display the correct name and type for chorusView", function() {
            var chorusView = _.find(this.results, function(result) {
                return result.get("entityType") == 'dataset' && result.get("type") == 'CHORUS_VIEW';
            });
            var resultIndex = this.results.indexOf(chorusView);
            var result = this.view.$("li.result:eq("+ resultIndex +")");
            expect(result.find(".name").html()).toBe(chorusView.get("highlightedAttributes").objectName[0]);
            expect(result.find(".name").attr("href")).toBe(chorusView.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.chorusView");
        });
        function resultForEntityType(results, type) {
            return _.find(results, function(result) {
                return result.get("entityType") == type;
            });
        }

        describe("keyboard navigation", function() {
            var view;

            beforeEach(function() {
                view = this.view;
                view.resultLimit = 7;
                view.render();
            });

            it("selects no item by default", function() {
                expectNothingSelected();
            });

            describe("#downArrow", function() {
                context("when no item is selected", function() {
                    it("selects the first item", function() {
                        this.view.downArrow();
                        expectSelectedIndex(0);
                    });
                });

                context("when the last item is selected", function() {
                    beforeEach(function() {
                        this.view.downArrow();
                        this.view.downArrow();
                        this.view.downArrow();
                        this.view.downArrow();
                        this.view.downArrow();
                        expectSelectedIndex(4);
                        this.view.downArrow();
                        expectSelectedIndex(5);
                        this.view.downArrow();
                        this.view.downArrow();
                        expectSelectedIndex(7);
                    });

                    it("does nothing", function() {
                        this.view.downArrow();
                        expectSelectedIndex(7);
                    });
                })
            });

            describe("#upArrow", function() {
                context("when no item is selected", function() {
                    beforeEach(function() {
                        this.view.upArrow();
                    });

                    it("does nothing", function() {
                        expectNothingSelected();
                    });
                });

                context("when the first item is selected", function() {
                    beforeEach(function() {
                        this.view.downArrow();
                        expectSelectedIndex(0);
                    });

                    it("removes the selection", function() {
                        this.view.upArrow();
                        expectNothingSelected();
                    });
                });

                context("when some intermediate item is selected", function() {
                    beforeEach(function() {
                        this.view.downArrow();
                        this.view.downArrow();
                        this.view.downArrow();
                        expectSelectedIndex(2);
                    });

                    it("selects the previous item", function() {
                        this.view.upArrow();
                        expectSelectedIndex(1);
                    });
                });
            });

            describe("#enter", function() {
                beforeEach(function() {
                    spyOn(chorus.router, 'navigate');
                    this.view.downArrow();
                });

                it("navigates to the page for the selected search result", function() {
                    this.view.enterKey();
                    var href = this.view.$("li.selected a").attr("href");
                    expect(chorus.router.navigate).toHaveBeenCalledWith(href);
                });
            });

            function expectSelectedIndex(index) {
                expect(view.$("li").eq(index)).toHaveClass("selected");
                expect(view.$("li.selected").length).toBe(1);
            }

            function expectNothingSelected() {
                expect(view.$("li.selected").length).toBe(0);
            }
        });

        describe("#handleKeyEvent", function() {
            describe("when down arrow key is pressed", function() {
                beforeEach(function() {
                    spyOn(this.view, "downArrow")
                    var event = jQuery.Event("keydown", { keyCode: 40 });
                    this.view.handleKeyEvent(event);
                });

                it("calls #downArrow", function() {
                    expect(this.view.downArrow).toHaveBeenCalled();
                });
            });

            describe("when up arrow key is pressed", function() {
                beforeEach(function() {
                    spyOn(this.view, "upArrow")
                    var event = jQuery.Event("keydown", { keyCode: 38 });
                    this.view.handleKeyEvent(event);
                });

                it("calls #upArrow on the type-ahead view", function() {
                    expect(this.view.upArrow).toHaveBeenCalled();
                });
            });

            describe("when the enter key is pressed", function() {
                beforeEach(function() {
                    spyOn(this.view, "enterKey")
                    this.event = jQuery.Event("keydown", { keyCode: 13 });
                });

                it("calls #enterKey on the type-ahead view", function() {
                    this.view.handleKeyEvent(this.event);
                    expect(this.view.enterKey).toHaveBeenCalled();
                });

                context("when nothing is selected", function() {
                    it("does NOT prevent the event's default (to allow the search to submit)", function() {
                        this.view.handleKeyEvent(this.event);
                        expect(this.event.isDefaultPrevented()).toBeFalsy();
                    });
                });

                context("when an item is selected", function() {
                    beforeEach(function() {
                        this.view.downArrow();
                        this.view.handleKeyEvent(this.event);
                    });

                    it("prevents the event's default (to prevent the search from submitting)", function() {
                        expect(this.event.isDefaultPrevented()).toBeTruthy();
                    });
                });
            });
        });

        context("when search results return more than 5 rows", function() {
            beforeEach(function() {
                this.view.resultLimit = 5;
                this.view.render();
            });

            it("should only display maximum 5 rows", function() {
                expect(this.view.$('li.result').length).toBe(5);
            })
        });

        context("when a second search happens", function() {
            beforeEach(function() {
                this.view.searchFor('test');
                var newResults = fixtures.typeAheadSearchResult({
                    query: "test",
                    typeAhead: {
                        results: [],
                        numFound: 0
                    }
                });
                this.server.completeFetchFor(newResults);
            });

            it("should be empty", function() {
                expect(this.view.$("li.result").length).toBe(0);
            })
        });
    });

    describe("when the fetch completes and there are no results", function() {
        beforeEach(function() {
            this.result.get("typeAhead").results = [];
            this.result.get("typeAhead").numFound = 0;

            this.server.completeFetchFor(this.result);
        });

        it("should have no result entries", function() {
            expect(this.view.$("li.result").length).toBe(0);
        });

        it("should show the link to show all search result", function() {
            expect(this.view.$("li:eq(0)").text().trim()).toMatchTranslation("type_ahead.show_all_results", {query: "test"});
            expect(this.view.$("li:eq(0) a").attr("href")).toBe("#/search/test");
        });
    });
})
