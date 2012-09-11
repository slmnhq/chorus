describe("chorus.models.SqlExecutionAndDownloadTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.SqlExecutionAndDownloadTask({
            entityId: '1',
            sql: 'select 2',
            instanceId: '3',
            databaseId: '4',
            schemaId: '5',
            numOfRows: '6'
        });
    });

    describe("save", function() {
        var fileDownloadArgs;
        beforeEach(function() {
            jasmine.Clock.useMock();
            spyOn($, 'fileDownload');
            this.model.save();
            fileDownloadArgs = $.fileDownload.mostRecentCall.args;
            spyOnEvent(this.model, 'saved');
            spyOnEvent(this.model, 'saveFailed');
        });

        it("starts a file download to the correct url and params", function() {
            expect(fileDownloadArgs[0]).toBe('/edc/task/sync/downloadResult');
            expect(fileDownloadArgs[1].data).toEqual({
                entityId: '1',
                sql: 'select 2',
                instanceId: '3',
                databaseId: '4',
                schemaId: '5',
                numOfRows: '6',
                checkId: this.model.get('checkId')
            });
            expect(fileDownloadArgs[1].httpMethod).toBe("post");
            expect(fileDownloadArgs[1].cookieName).toBe("fileDownload_" + this.model.get('checkId'));
        });

        it("sets the executionInfo to the executed schema", function() {
            expect(this.model.get('executionInfo')).toEqual({
                instanceId: '3',
                databaseId: '4',
                schemaId: '5'
            });
        });

        //Disabled in 2.1 due to blowing up phantom
        xdescribe("on success", function() {
            beforeEach(function() {
                $.cookie('fileDownload_' + this.model.get("checkId"), "true");
                jasmine.Clock.tick(101);
            });
            afterEach(function() {
                $.cookie('fileDownload_' + this.model.get("checkId"), undefined);
            });

            it("triggers the saved callback", function() {
                expect('saved').toHaveBeenTriggeredOn(this.model, [this.model]);
                expect('saveFailed').not.toHaveBeenTriggeredOn(this.model, this.model);
            });
        });

        xdescribe("on failure", function() {
            beforeEach(function() {
                $($("iframe")[0].contentDocument.body).html(JSON.stringify({status: "error", message: 'failed!'}));
                $.cookie('fileDownload_' + this.model.get("checkId"), "true");
                jasmine.Clock.tick(101);
            });
            afterEach(function() {
                $.cookie('fileDownload_' + this.model.get("checkId"), undefined);
            });

            it("triggers the saveFailed callback", function() {
                expect('saved').not.toHaveBeenTriggeredOn(this.model);
                expect('saveFailed').toHaveBeenTriggeredOn(this.model, [this.model]);
                expect(this.model.serverErrors).toBe("failed!");
            });
        });

        describe("when cancelled", function() {
            beforeEach(function() {
                spyOn(chorus.PageEvents, "broadcast").andCallThrough();
                this.model.cancel();
            });

            it("triggers a file:executionCancelled page event", function() {
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:executionCancelled");
            });
        });
    });
});
