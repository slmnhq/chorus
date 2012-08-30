require 'spec_helper'

describe Import do
  describe "associations" do
    it { should belong_to :workspace }
    it { should belong_to(:source_dataset).class_name('Dataset') }
    it { should belong_to :user }
    it { should belong_to :import_schedule }
  end

  describe ".run" do
    let (:import) do
      Import.create!(
          {:id => 'my-id'},
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
    let(:user) { users(:carly) }
    let(:import) do
      Import.create!(
          {
              :source_dataset_id => source_table.id,
              :user_id => user.id,
              :workspace_id => workspace.id
          },
          :without_protection => true
      )
    end
    let(:expected_attributes) do
      {
      }
    end

    context "when copying between different databases" do
      let(:workspace) { workspaces(:bob_public) }
      let(:source_table) { datasets(:bobsearch_table) }

      it "calls Gppipe.run_import" do
        mock(Gppipe).run_import(source_table.id, user.id, expected_attributes)
        Import.run(import.id)
      end
    end

    context "when importing within the same database" do
      let(:workspace) { workspaces(:bob_public) }
      let(:source_table) { datasets(:bobs_table) }

      it "calls GpTableCopier.run_import" do
        mock(GpTableCopier).run_import(source_table.id, user.id, expected_attributes)
        Import.run(import.id)
      end
    end
  end
end