describe("chorus.dialogs.ComposeKaggleMessage", function () {
    beforeEach(function () {
        this.qtip = stubQtip(".more-info");
        setLoggedInUser(rspecFixtures.user({email: 'user@chorus.com'}));
        this.kaggleUser = new chorus.models.KaggleUser({fullName: "Batman"});
        this.workspace = rspecFixtures.workspace();
        this.dialog = new chorus.dialogs.ComposeKaggleMessage({
            recipients: new chorus.collections.KaggleUserSet(this.kaggleUser),
            workspace: this.workspace
        });
        this.dialog.render();
    });

    describe('#render', function() {
        it("sets the workspace for the model", function() {
           expect(this.dialog.model.get('workspace')).toBe(this.workspace);
        });

        it("sets the default value of the from field to the users email", function() {
            expect(this.dialog.$('input[name=from]').val()).toBe('user@chorus.com');
        });

        it("displays the name of the kaggle recipient", function() {
            expect(this.dialog.$('.kaggle_recipient')).toContainText("Batman");
        });

        context("when more than one recipient", function() {
            beforeEach(function() {
                this.kaggleUsers = new chorus.collections.KaggleUserSet
                (  [new chorus.models.KaggleUser({fullName: "Batman"}),
                   new chorus.models.KaggleUser({fullName: "Catwoman"})]
                );
                this.dialog = new chorus.dialogs.ComposeKaggleMessage({
                    recipients: this.kaggleUsers,
                    workspace: this.workspace
                });
                this.dialog.render();
            });

            it("displays the name of the kaggle recipient", function() {
                expect(this.dialog.$('.kaggle_recipient')).toContainText("Batman, Catwoman");
            });

            context("when the recipient names run over the limit", function() {
                beforeEach(function() {
                    this.dialog = new chorus.dialogs.ComposeKaggleMessage({
                        recipients: this.kaggleUsers,
                        workspace: this.workspace,
                        maxRecipientCharacters: 10
                    });
                    this.dialog.render();
                });

                it("displays the name of some kaggle recipients, and a more link", function() {
                    expect(this.dialog.$('.kaggle_recipient.full')).toHaveClass("hidden");
                    expect(this.dialog.$('.kaggle_recipient.short')).not.toHaveClass("hidden");
                    expect(this.dialog.$('.kaggle_recipient.full')).toContainText("Batman, Catwoman show less");
                    expect(this.dialog.$('.kaggle_recipient.short')).toContainText("Batman and 1 more");
                });

                it("shows the remaining names when you click on more", function() {
                    this.dialog.$(".showMore").click();
                    expect(this.dialog.$('.kaggle_recipient.full')).not.toHaveClass("hidden");
                    expect(this.dialog.$('.kaggle_recipient.short')).toHaveClass("hidden");
                });

                describe("#combineNames", function() {
                    it("Returns the abbreviated list of recipients with a more link", function() {
                        expect(this.dialog.combineNames(this.kaggleUsers.models)).toEqual(
                            {
                                short: "Batman",
                                full: "Batman, Catwoman",
                                moreCount: 1
                            }
                        );
                    });
                });
            });
        });

        it("should have a link to 'insert dataset schema'", function() {
            expect(this.dialog.$("a.insert_dataset_schema")).toContainTranslation("kaggle.compose.insert_schema");
        });

        context("when clicking 'insert dataset schema' link", function() {
            var modalSpy;
            beforeEach(function() {
                modalSpy = stubModals();
                spyOn(chorus.Modal.prototype, 'launchSubModal').andCallThrough();
                spyOn(this.dialog, "datasetsChosen").andCallThrough();
                this.dialog.$("a.insert_dataset_schema").click();
            });

            it("should launch the dataset picker dialog", function() {
                expect(chorus.Modal.prototype.launchSubModal).toHaveBeenCalled();
                expect(modalSpy).toHaveModal(chorus.dialogs.KaggleInsertDatasetSchema);
            });

            it("should not set the pre-selected dataset", function() {
                expect(chorus.modal.options.defaultSelection).toBeUndefined();
            });

            describe("when a dataset is selected", function() {
                var datasets;
                beforeEach(function() {
                    datasets = [
                        rspecFixtures.workspaceDataset.datasetTable({ objectName: "i_bought_a_zoo" }),
                        rspecFixtures.workspaceDataset.datasetTable({ objectName: "bourne_identity" })
                    ];
                    chorus.modal.trigger("datasets:selected", datasets);
                });

                it("should re-enable the submit button", function() {
                    expect(this.dialog.$("button.submit")).toBeEnabled();
                });

                it("fetches the columns for each of the selected datasets", function() {
                    _.each(datasets, function (dataset) {
                        expect(dataset.columns()).toHaveBeenFetched();
                    });
                });

                describe("when the fetches complete successfully", function () {
                    beforeEach(function () {
                        _.each(datasets, function(dataset, i) {
                            this.server.completeFetchAllFor(dataset.columns(), [
                                fixtures.databaseColumn({name:"Rhino_" + i, recentComment:"awesome", typeCategory: "STRING" }),
                                fixtures.databaseColumn({name:"Sloth_" + i, recentComment:"lazy", typeCategory: "WHOLE_NUMBER" })
                            ]);
                            this.server.completeFetchFor(dataset.statistics(), fixtures.datasetStatisticsView({ id: dataset.id, rows: 11 * (i + 1) }));
                        }, this);
                    });

                    it("inserts the chosen schemas into the text field", function () {
                        message = this.dialog.$('textarea[name=message]').val();
                        expect(message).toMatch("i_bought_a_zoo");
                        expect(message).toMatch("bourne_identity");
                        expect(message).toMatch(/Rhino_0\s*string/);
                        expect(message).toMatch(/Rhino_1\s*string/);
                        expect(message).toMatch(/Sloth_0\s*numeric/);
                        expect(message).toMatch(/Sloth_1\s*numeric/);
                    });

                    it("displays the number of columns and the number of rows next to each table", function () {
                        message = this.dialog.$('textarea[name=message]').val();
                        expect(message).toMatch(/i_bought_a_zoo\s+# of columns: 2, # of rows: 11/);
                        expect(message).toMatch(/bourne_identity\s+# of columns: 2, # of rows: 22/);
                    });

                    describe("when you fetch MORE datasets", function() {
                        it("doesn't add the old ones again", function() {
                            chorus.modal.trigger("datasets:selected", datasets);
                            expect(this.dialog.requiredDatasets.size()).toBe(datasets.length * 2); // 1 for statistics, 1 for columns
                        });
                    });
                });

                describe("when some of the fetches don't complete", function () {
                    beforeEach(function () {
                        this.server.completeFetchAllFor(datasets[0].columns(), [
                            fixtures.databaseColumn({name:"Rhino_0", recentComment:"awesome", typeCategory: "STRING" }),
                            fixtures.databaseColumn({name:"Sloth_0", recentComment:"lazy", typeCategory: "WHOLE_NUMBER" })
                        ]);
                    });

                    it("doesn't update the message", function () {
                        message = this.dialog.$('textarea[name=message]').val();
                        expect(message).not.toContain("Rhino_0");
                    });
                });
            });
        });

        it('shows a tooltip with Kaggle tips', function () {
            this.dialog.$(".more-info").mouseenter();
            expect(this.qtip.find('div')).toContainText("Call to Action");
        });
    });

    describe("saving", function () {
        beforeEach(function () {
            this.dialog.$('input[name=from]').val('me@somewhere.com');
            this.dialog.$('input[name=subject]').val('Something cool');
            this.dialog.$('textarea[name=message]').val('Some stuff');

            spyOn(chorus.models.KaggleMessage.prototype, "save").andCallThrough();
            spyOn(this.dialog, "closeModal");
            spyOn(chorus, "toast");
            this.dialog.$('button.submit').click();
        });

        it("adds a spinner to the submit button", function () {
            expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
        });

        it("saves the message with the new values", function () {
            var model = this.dialog.model;
            expect(model.save).toHaveBeenCalled();

            expect(model.get('from')).toEqual('me@somewhere.com');
            expect(model.get('subject')).toEqual('Something cool');
            expect(model.get('message')).toEqual('Some stuff');
        });

        it("closes the dialog box if saved successfully", function () {
            this.dialog.model.trigger("saved");
            expect(this.dialog.closeModal).toHaveBeenCalled();
        });

        it("shows a toast message if saved successfully", function() {
            this.dialog.model.trigger("saved");
            expect(chorus.toast).toHaveBeenCalledWith('kaggle.compose.success');
        });
    });
});