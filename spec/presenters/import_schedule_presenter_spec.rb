require 'spec_helper'

describe ImportSchedulePresenter, :type => :view do
  before do
    @user = FactoryGirl.create :user
    @presenter = ImportSchedulePresenter.new(import_schedule, view)
  end
  let(:import_schedule) { import_schedules(:bob_schedule) }

  describe "#to_hash" do
    let(:hash) { @presenter.to_hash }
    context "when rendering an activity stream" do
      it "includes the right keys" do
        hash[:start_datetime].should == import_schedule.start_datetime
        hash[:end_date].should == import_schedule.end_date
        hash[:to_table].should == import_schedule.to_table
        hash[:frequency].should == import_schedule.frequency
        hash[:sample_count].should == import_schedule.sample_count
        hash[:truncate].should == import_schedule.truncate
        hash[:last_scheduled_at].should == import_schedule.last_scheduled_at
        hash[:next_import_at].should == import_schedule.next_import_at
        hash[:new_table].should == import_schedule.new_table
        hash[:destination_dataset_id].should == import_schedule.target_dataset_id
        hash[:is_active].should == import_schedule.is_active
      end
    end
  end
end