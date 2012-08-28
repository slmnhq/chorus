require 'legacy_migration_spec_helper'

describe ImportScheduleMigrator do
  def dt(s)
    DateTime.parse(s)
  end

  def d(s)
    Date.parse(s)
  end

  def int_to_frequency(i)
    case i
      when 4
        'daily'
      when 5
        'weekly'
      when 6
        'monthly'
    end
  end

  describe ".migrate" do
    before :all do
      ImportScheduleMigrator.migrate
    end

    describe "copying the data" do
      it "creates new instances for legacy hadoop instances and is idempotent" do
        count = Legacy.connection.select_all("Select count(*) from legacy_migrate.edc_import_schedule").first["count"]
        ImportSchedule.count.should == count
        ImportScheduleMigrator.migrate
        ImportSchedule.count.should == count
      end

      it "copies the correct data fields from the legacy import schedule" do
        Legacy.connection.select_all("Select eis.* , ei.sample_count, ei.truncate, ei.workspace_id, ei.to_table,
          ei.owner_id,ei.source_id from legacy_migrate.edc_import_schedule eis INNER JOIN
          legacy_migrate.edc_import ei ON ei.schedule_id = eis.id").each do |row|
          import_schedule = ImportSchedule.unscoped.find_by_legacy_id(row['id'])
          import_schedule.start_datetime.should == dt(row["start_time"])
          import_schedule.end_date.should == dt(row["end_time"])
          import_schedule.frequency.should == int_to_frequency(row['frequency'])
          import_schedule.deleted_at.should be_nil
          import_schedule.updated_at.should == dt(row['last_updated_tx_stamp'])
          import_schedule.created_at.should == dt(row['created_tx_stamp'])
          import_schedule.workspace.should == Workspace.unscoped.find_by_legacy_id(row['workspace_id'])
          import_schedule.to_table.should == row['to_table']
          row['source_id'].should include(import_schedule.source_dataset.name)
          import_schedule.truncate.should == (row["truncate"] =="t")
          import_schedule.user.legacy_id.should == row["owner_id"]
          import_schedule.sample_count.should == row["sample_count"].try(:to_i)
          import_schedule.deleted_at.should !=nil if import_schedule.workspace.deleted_at
        end
      end

      it "copies a undeleted import schedule from a deleted workspace (and marks it as deleted)" do
        pending "someone should really fix this"
        import_schedule = ImportSchedule.find_by_legacy_id('10000')
        workspace = Workspace.unscoped.find(import_schedule.workspace_id)
        import_schedule.deleted_at.should == workspace.deleted_at
        workspace.name.should == 'another workspace_del_1331570259423'
      end


    end
  end
end
