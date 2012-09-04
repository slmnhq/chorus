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
        hash[:schedule_info][:start_datetime].should == import_schedule.start_datetime
        hash[:schedule_info][:end_date].should == import_schedule.end_date
        hash[:schedule_info][:to_table].should == import_schedule.to_table
        hash[:schedule_info][:frequency].should == import_schedule.frequency
        hash[:schedule_info][:sample_count].should == import_schedule.sample_count
        hash[:schedule_info][:truncate].should == import_schedule.truncate
        hash[:schedule_info][:last_scheduled_at].should == import_schedule.last_scheduled_at
        hash[:schedule_info][:next_import_at].should == import_schedule.next_import_at
      end
    end
  end
end