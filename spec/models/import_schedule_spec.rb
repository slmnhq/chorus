require 'spec_helper'

describe ImportSchedule do
  let(:pending_import_schedule) { import_schedules(:pending_import_schedule) }

  describe "associations" do
    it { should belong_to :workspace }
    it { should belong_to(:source_dataset).class_name('Dataset') }
    it { should belong_to :user }
  end

  describe ".run_pending_imports" do
    let(:start_time) {Time.local(2012, 8, 22, 11, 0).to_datetime}
    let(:dataset_id) { pending_import_schedule.source_dataset_id }
    let(:user_id) { pending_import_schedule.user_id }

    let(:attributes) {
      HashWithIndifferentAccess.new(
          "workspace_id" => pending_import_schedule.workspace_id,
          "dataset_id" => pending_import_schedule.source_dataset_id,
          "to_table" => pending_import_schedule.to_table,
          "new_table" => pending_import_schedule.new_table,
          "remote_copy" => false,
          "schedule_start_time" => pending_import_schedule.start_datetime,
          "schedule_end_time" => pending_import_schedule.end_date,
          "schedule_frequency"=> pending_import_schedule.frequency,
          "row_limit" => pending_import_schedule.row_limit,
          "import_type"=>"schedule"
      )}

    around do |example|
      Timecop.freeze(start_time + 1.hour) do
        example.call
      end
    end

    context "when import is pending" do
      it "adds pending import to the queue" do
        mock(QC.default_queue).enqueue('Import.run', dataset_id, user_id, attributes)
        ImportSchedule.run_pending_imports
      end
    end

    context "when import date has not arrived yet" do
      context "when the start time is in the future" do
        xit "does not add import to the queue" do

        end
      end

      context "when the start time is in the past but the next import is in the future" do
        xit "does not add import to the queue" do

        end
      end
    end

    context "when import schedule has expired" do
      xit "does not add import to the queue" do

      end
    end
  end
end