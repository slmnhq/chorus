require 'spec_helper'

describe ImportSchedule do
  let(:pending_import_schedule) { import_schedules(:pending_import_schedule) }  # TODO: orphaned?
  let(:future_import_schedule) { import_schedules(:future_import_schedule) }
  let(:bob_schedule) { import_schedules(:bob_schedule) }

  describe "callbacks:" do
    describe "before saving, automatically updating the next_import_at attribute" do
      context "when the start date is changed to be sooner in the future" do
        let(:start_day) { Time.now + 2.days }
        let(:next_year) { Time.now + 1.year }
        let(:import_schedule) do
          FactoryGirl.create(:import_schedule, start_datetime: next_year, end_date: next_year + 1.year)
        end

        it "updates the next_import_at attribute" do
          import_schedule.next_import_at.should == next_year
          import_schedule.update_attributes(start_datetime: start_day, end_date: next_year, frequency: 'daily')
          import_schedule.next_import_at.should == start_day
        end
      end
    end
  end

  describe "associations" do
    it { should belong_to :workspace }
    it { should belong_to(:source_dataset).class_name('Dataset') }
    it { should belong_to :user }
  end

  describe "default scope" do
    it "excludes deleted import schedules" do
      new_import_schedule = FactoryGirl.create(:import_schedule, deleted_at: nil)
      deleted_import_schedule = FactoryGirl.create(:import_schedule, deleted_at: Time.now)
      ImportSchedule.all.should include(new_import_schedule)
      ImportSchedule.all.should_not include(deleted_import_schedule)
    end
  end

  describe "#is_active" do
    it "returns true for new schedules" do
      new_import_schedule = FactoryGirl.create(:import_schedule, deleted_at: nil)
      new_import_schedule.is_active.should be_true
    end

    it "returns false for deleted schedules" do
      deleted_import_schedule = FactoryGirl.create(:import_schedule, deleted_at: Time.now)
      deleted_import_schedule.is_active.should be_false
    end
  end

  describe "#is_active=" do
    it "sets the deleted_at attribute" do
      import_schedule = FactoryGirl.create(:import_schedule)
      import_schedule.is_active = false
      import_schedule.deleted_at.should_not be_nil
    end

    it "clears the deleted at attribute" do
      import_schedule = FactoryGirl.create(:import_schedule, deleted_at: Time.now)
      import_schedule.is_active = true
      import_schedule.deleted_at.should be_nil
    end
  end

  describe "#target_dataset_id" do
    let(:workspace) { workspaces(:bob_public) }
    let(:user) { users(:owner) }
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

  describe "default scope" do
    it "does not show deleted schedules" do
      active_schedule = ImportSchedule.create!({start_datetime: Time.now, end_date: Time.now + 1.year, frequency: 'monthly'}, :without_protection => true)
      deleted_schedule = ImportSchedule.create!({deleted_at: Time.now, start_datetime: Time.now, end_date: Time.now + 1.year, frequency: 'monthly'}, :without_protection => true)
      ImportSchedule.all.should include(active_schedule)
      ImportSchedule.all.should_not include(deleted_schedule)
    end
  end

  describe ".ready_to_run scope" do
    it "shows import schedules that should be run" do
      ready_schedule = ImportSchedule.create!({start_datetime: Time.now + 1.minute, end_date: Time.now + 1.year, frequency: 'monthly'}, :without_protection => true)
      deleted_schedule = ImportSchedule.create!({deleted_at: Time.now, start_datetime: Time.now + 1.minute, end_date: Time.now + 1.year, frequency: 'monthly'}, :without_protection => true)
      not_ready_schedule = ImportSchedule.create!({start_datetime: Time.now + 1.year, end_date: Time.now + 1.year, frequency: 'monthly'}, :without_protection => true)

      Timecop.freeze(Time.now + 1.day) do
        ImportSchedule.ready_to_run.should include(ready_schedule)
        ImportSchedule.ready_to_run.should_not include(deleted_schedule, not_ready_schedule)
      end
    end
  end
end