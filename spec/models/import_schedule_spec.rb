require 'spec_helper'

describe ImportSchedule do
  let(:pending_import_schedule) { import_schedules(:pending_import_schedule) }  # TODO: orphaned?
  let(:future_import_schedule) { import_schedules(:future_import_schedule) }
  let(:bob_schedule) { import_schedules(:bob_schedule) }

  describe "associations" do
    it { should belong_to :workspace }
    it { should belong_to(:source_dataset).class_name('Dataset') }
    it { should belong_to :user }
  end

  describe "#target_dataset_id" do
    let(:workspace) { workspaces(:bob_public) }
    let(:user) { users(:bob) }
    let(:dest_dataset) { datasets(:bobs_table) }
    let(:dest_dataset_name) { dest_dataset.name }
    let(:my_event) { Events::DatasetImportCreated.by(user).add(
        :workspace => workspace,
        :dataset => dest_dataset,
        :destination_table => dest_dataset_name
    )}

    context "when the destination table exists" do
      it "should return the ID" do
        bob_schedule.dataset_import_created_event_id = my_event.id
        bob_schedule.target_dataset_id.should == dest_dataset.id
      end
    end

    context "when the destination table doesn't exist" do
      let(:dest_dataset) { nil }
      let(:dest_dataset_name) { nil }

      it "should return nil" do
        bob_schedule.dataset_import_created_event_id = my_event.id
        bob_schedule.target_dataset_id.should == nil
      end
    end
  end
end