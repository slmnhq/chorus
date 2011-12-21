describe("WorkfileListView", function() {
    describe("#render", function() {
        context("with no workfiles in the collection", function() {
            beforeEach(function() {
                this.collection = new chorus.models.WorkfileSet([], {workspaceId : 1234});
                this.view = new chorus.views.WorkfileList({collection: this.collection});
                this.view.render();
            });

            it("doesn't render any items", function() {
                expect(this.view.$("li").length).toBe(0);
            });
        });

        context("with some workfiles in the collection", function() {
            beforeEach(function() {
                this.model1 = new chorus.models.Workfile({
                    id: 12,
                    fileType: "sql",
                    fileName: "some_file.sql",
                    description: "describe 1",
                    workspaceId: 1,
                    mimeType: "text/x-sql",
                    recentComments : [
                        {
                            text: "Comment 1",
                            author : {
                                id: "21",
                                firstName: "Wayne",
                                lastName: "Wayneson"
                            },
                            timestamp: "2011-12-08 17:16:47.308-08"
                        }
                    ],
                    commentCount: "1"
                });
                this.model2 = new chorus.models.Workfile({
                    id: 34,
                    fileType: "txt",
                    fileName: "other_file.txt",
                    description: "describe 2",
                    workspaceId: 1,
                    mimeType: "text/plain",
                    recentComments : [
                        {
                            text: "Comment 2",
                            author : {
                                id: "22",
                                firstName: "Garth",
                                lastName: "Garthson"
                            },
                            timestamp: "2011-12-08 17:16:47.308-08"
                        }
                    ],
                    commentCount: "2"
                });
                this.model3 = new chorus.models.Workfile({
                    id: 56,
                    fileType: "N/A",
                    fileName: "zipfile.zip",
                    description: "describe 3",
                    workspaceId: 1,
                    mimeType: "application/zip"
                });
                this.collection = new chorus.models.WorkfileSet([this.model1, this.model2, this.model3], {workspaceId: 1234});
                this.view = new chorus.views.WorkfileList({collection: this.collection});
                this.view.render();
                this.li2 = this.view.$("li")[1];
            });

            it("renders an li for each item in the collection", function() {
                expect(this.view.$("li").length).toBe(3);
            });

            it("links each workfile to its show page for text or image files", function() {
                expect($(this.view.$("a.name")[0]).attr("href")).toBe(this.model1.showUrl());
                expect($(this.view.$("a.name")[1]).attr("href")).toBe(this.model2.showUrl());
            });

            it("links to file download for other file types", function() {
                expect($(this.view.$("a.name")[2]).attr("href")).toBe(this.model3.downloadUrl());
            });

            it("includes data-id for each item", function() {
                expect($(this.view.$("li")[0]).data("id")).toBe(this.model1.get("id"));
                expect($(this.view.$("li")[1]).data("id")).toBe(this.model2.get("id"));
                expect($(this.view.$("li")[2]).data("id")).toBe(this.model3.get("id"));
            });

            it("includes the filename as a link", function() {
                expect($(this.view.$("li a.name")[0]).text().trim()).toBe(this.model1.get("fileName"));
                expect($(this.view.$("li a.name")[1]).text().trim()).toBe(this.model2.get("fileName"));
                expect($(this.view.$("li a.name")[2]).text().trim()).toBe(this.model3.get("fileName"));
            });

            it("includes the correct workspace file icon", function() {
                expect($(this.view.$("li img")[0]).attr("src")).toBe("/images/workfiles/large/sql.png");
                expect($(this.view.$("li img")[1]).attr("src")).toBe("/images/workfiles/large/txt.png");
                expect($(this.view.$("li img")[2]).attr("src")).toBe("/images/workfiles/large/plain.png");
            });

            it("includes the most recent comment body", function() {
                expect($(this.view.$("li .comment .body")[0]).text().trim()).toBe(this.model1.lastComment().get("body"));
                expect($(this.view.$("li .comment .body")[1]).text().trim()).toBe(this.model2.lastComment().get("body"));
            });

            it("includes the full name of the most recent commenter", function() {
                expect($(this.view.$("li .comment .user")[0]).text().trim()).toBe(this.model1.lastComment().creator().displayName());
                expect($(this.view.$("li .comment .user")[1]).text().trim()).toBe(this.model2.lastComment().creator().displayName());
            });

            it("does not display 'other comments' on the workfile with only 1 comment", function() {
                expect(this.view.$("li .comment").eq(0).text()).not.toContain(t("workfiles.other_comments", 0));
                expect(this.view.$("li .comment").eq(0).text()).not.toContain(t("workfiles.other_comments", 1));
            });

            it("displays 'other comments' on the workfile with more than 1 comment", function() {
                expect(this.view.$("li .comment").eq(1).text()).toContain(t("workfiles.other_comments", 1))
            });

            it("displays the abbreviated date of the most recent comment", function() {
                expect(this.view.$("li:first-child .comment_info .on").text().trim()).toBe("Dec 8");
            })

            it("pre-selects the first item in the list", function() {
                expect(this.view.$("li:first-child")).toHaveClass("selected");
            });

            context("clicking on another item", function() {
                beforeEach(function() {
                    this.eventSpy = jasmine.createSpy();
                    this.view.bind("workfile:selected", this.eventSpy);
                    $(this.li2).click();
                });

                it("adds the selected class to that item", function() {
                    expect($(this.li2)).toHaveClass("selected");
                });

                it("triggers the workfile:selected event", function() {
                    expect(this.eventSpy).toHaveBeenCalledWith(this.model2);
                });

                context("clicking on the same item again", function() {
                    beforeEach(function() {
                        this.eventCount = this.eventSpy.calls.length;
                        this.view.$("li").eq(1).click();
                    });

                    it("does not raise the event again", function() {
                        // raising the event again causes unnecessary fetches
                        expect(this.eventSpy.calls.length).toBe(this.eventCount);
                    });
                });

                context("and then clicking on yet another item", function() {
                    beforeEach(function() {
                        this.li3 = this.view.$("li")[2];
                        $(this.li3).click();
                    });
                    it("removes the selected class from the first li", function() {
                        expect($(this.li2)).not.toHaveClass("selected");
                    });

                    it("adds the selected class to the second li", function() {
                        expect($(this.li3)).toHaveClass("selected");
                    });

                    it("triggers the workfile:selected event", function() {
                        expect(this.eventSpy).toHaveBeenCalledWith(this.model3);
                    });
                });
            });
        });
    });

    describe("#filter", function() {
        beforeEach(function() {
            this.collection = new chorus.models.WorkfileSet([], {workspaceId : 1234});
            this.view = new chorus.views.WorkfileList({collection: this.collection});
            spyOn(this.view.collection, "fetch");
            this.view.filter("sql");
        })
        it("should set the filter attribute", function() {
            expect(this.view.collection.attributes.type).toBe("sql")
        })
        it("should call fetch", function() {
            expect(this.view.collection.fetch).toHaveBeenCalled();
        })
    })
});
