require 'spec_helper'

describe ImportScheduler do
  describe ".run" do
    let(:start_time) { Time.local(2012, 8, 22, 11, 0).to_datetime }
    let(:import_schedule) do
      ImportSchedule.create!(
          {:start_datetime => start_time,
           :end_date => Date.parse("2012-08-25"),
           :last_scheduled_at => nil,
           :frequency => 'daily',
           :user => users(:bob),
           :sample_count => 1,
           :truncate => true,
           :workspace => workspaces(:bob_public),
           :dataset_import_created_event_id => 'dataset-import-created-event-id',
           :source_dataset => datasets(:bobs_table),
           :to_table => 'destination-table'
          },
          :without_protection => true)
    end

    def expect_qc_enqueue
      mock(QC.default_queue).enqueue("Import.run", anything) do |method, import_id|
        Import.find(import_id).tap do |import|
          import.import_schedule.should == import_schedule
          import.workspace.should == import_schedule.workspace
          import.to_table.should == import_schedule.to_table
          import.source_dataset_id.should == import_schedule.source_dataset_id
          import.truncate.should == import_schedule.truncate
          import.user_id.should == import_schedule.user_id
          import.sample_count.should == import_schedule.sample_count
          import.dataset_import_created_event_id.should == import_schedule.dataset_import_created_event_id
        end
      end
    end

    context "when next import time is set" do
      before do
        ImportSchedule.delete_all # don't run import schedule on fixtures
        Timecop.freeze(start_time - 1.hour) do
          import_schedule.save!
        end
        expect_qc_enqueue
      end

      context "when run before the end date" do
        around do |example|
          Timecop.freeze(start_time + 1.hour) do
            example.call
          end
        end

        it "enqueues a job to execute an import" do
          ImportScheduler.run
        end

        it "sets the last scheduled time" do
          ImportScheduler.run
          import_schedule.reload
          import_schedule.last_scheduled_at.should == Time.now
        end

        it "sets the next scheduled import" do
          ImportScheduler.run
          import_schedule.reload
          import_schedule.next_import_at.should == start_time + 1.day
        end
      end

      context "when run after the end date" do
        around do |example|
          Timecop.freeze(start_time + 1.year) do
            example.call
          end
        end

        it "enqueues the job" do
          ImportScheduler.run
        end

        it "sets the last scheduled time" do
          ImportScheduler.run
          import_schedule.reload
          import_schedule.last_scheduled_at.should == start_time + 1.year
        end

        it "does not schedule another import" do
          ImportScheduler.run
          import_schedule.reload
          import_schedule.next_import_at.should be_nil
        end
      end
    end

    #context "when no next import has been scheduled" do
    #  pending
    #end
  end
end
