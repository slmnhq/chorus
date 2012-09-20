require 'spec_helper'

describe Import do
  describe "associations" do
    it { should belong_to :workspace }
    it { should belong_to(:source_dataset).class_name('Dataset') }
    it { should belong_to :user }
    it { should belong_to :import_schedule }
  end

  describe ".run" do
    let(:user) { users(:owner) }
    let (:import) do
      Import.create!(
          {:user => user},
          :without_protection => true
      )
    end

    it "calls the run method of the instance with the given id" do
      any_instance_of(Import) do |instance|
        mock(instance).run
      end
      Import.run(import.id)
    end
  end

  describe "#run" do
    let(:user) { users(:owner) }
    let(:source_table) { datasets(:table) }
    let(:workspace) { workspaces(:public) }
    let(:import) do
      Import.create!(
          {
              :source_dataset => source_table,
              :user => user,
              :workspace => workspace
          }.merge(import_attributes),
          :without_protection => true
      )
    end
    let(:import_attributes) do
      {
          :to_table => "the_new_table",
          :new_table => true,
          :sample_count => 20,
          :truncate => false
      }
    end
    let(:expected_attributes) do
      import_attributes.merge(
          :workspace_id => workspace.id,
          :dataset_import_created_event_id => import.dataset_import_created_event_id
      )
    end

    let(:import_schedule) {
      ImportSchedule.create!({:start_datetime => '2012-09-04 23:00:00-07',
                              :end_date => '2012-12-04',
                              :frequency => 'weekly',
                              :workspace => workspace,
                              :to_table => "the_new_table",
                              :source_dataset => source_table,
                              :truncate => true,
                              :new_table => true,
                              :user => user},
                             :without_protection => true)
    }

    context "when copying between different databases" do
      before do
        workspace.sandbox = gpdb_schemas(:searchquery_schema)
        workspace.save!
        workspace.sandbox.database.id.should_not == source_table.schema.database.id
      end

      it "calls Gppipe.run_import" do
        mock(Gppipe).run_import(source_table.id, user.id, expected_attributes)
        Import.run(import.id)
      end
    end

    context "when importing within the same database" do
      it "calls GpTableCopier.run_import" do
        mock(GpTableCopier).run_import(source_table.id, user.id, expected_attributes)
        Import.run(import.id)
      end
    end

    context "update the schedule information " do
      before do
        import.import_schedule = import_schedule
        import.save!
      end
      context "when import into new_table" do
        before do
          stub(GpTableCopier).run_import(source_table.id, user.id, expected_attributes)
          Import.run(import.id)
        end

        it "updates new_table attributes to false if import is successful" do
          import.reload.import_schedule.new_table.should == false
        end
      end

      context "if the import fail" do
        before do
          stub(GpTableCopier).run_import(source_table.id, user.id, expected_attributes) {
            raise Exception
          }
          begin
            Import.run(import.id)
          rescue Exception
          end
        end

        it "does not update 'new_table' attribute" do
          import.reload.import_schedule.new_table.should == true
        end
      end
    end
  end
end