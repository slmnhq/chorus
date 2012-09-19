require 'spec_helper'

describe Import do
  describe "associations" do
    it { should belong_to :workspace }
    it { should belong_to(:source_dataset).class_name('Dataset') }
    it { should belong_to :user }
    it { should belong_to :import_schedule }
  end

  describe ".run" do
    let(:user) { users(:bob) }
    let (:import) do
      Import.create!(
          {:user => user },
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
    let(:user) { users(:bob) }
    let(:source_table) { datasets(:bobs_table) }
    let(:workspace) { workspaces(:bob_public) }
    let(:import) do
      Import.create!(
          {
              :source_dataset_id => source_table.id,
              :user => user,
              :workspace => workspace,
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
  end
end