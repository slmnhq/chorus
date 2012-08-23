require 'legacy_migration_spec_helper'

describe ImportScheduleMigrator do
  def dt(s)
    DateTime.parse(s)
  end

  def d(s)
    Date.parse(s)
  end

  describe ".migrate" do
    before :all do
      ImportScheduleMigrator.migrate
    end

    describe "copying the data" do
      it "creates new instances for legacy hadoop instances and is idempotent" do
        ImportSchedule.count.should == 9
        ImportScheduleMigrator.migrate
        ImportSchedule.count.should == 9
      end

      it "copies the correct data fields from the legacy import schedule" do
        import_schedule = ImportSchedule.find_by_legacy_id('10010')
        import_schedule.start_datetime.should == dt('2012-03-03 12:58:00-08')
        import_schedule.end_date.should == dt('2013-06-14')
        import_schedule.frequency.should == 'weekly'
        import_schedule.deleted_at.should be_nil
        import_schedule.updated_at.should == dt('2012-03-19 18:00:43.552-07')
        import_schedule.created_at.should == dt('2012-03-14 14:45:55.914-07')
        import_schedule.workspace.name.should == 'Workspace'
        import_schedule.to_table.should == 'import_far_Future'
        import_schedule.source_dataset.name.should == '123'
        import_schedule.truncate.should == false
        import_schedule.user.username.should == 'edcadmin'
        import_schedule.row_limit.should == 500
      end

      it "copies a undeleted import schedule from a deleted workspace (and marks it as deleted)" do
        import_schedule = ImportSchedule.find_by_legacy_id('10000')
        workspace = Workspace.unscoped.find(import_schedule.workspace_id)
        import_schedule.deleted_at.should == workspace.deleted_at
        workspace.name.should == 'another workspace_del_1331570259423'
      end


    end
  end
end
