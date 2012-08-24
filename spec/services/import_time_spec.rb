require 'spec_helper'

describe ImportTime do
  def dt(s)
    DateTime.parse(s)
  end

  def d(s)
    Date.parse(s)
  end

  let(:current_time) { dt("2012-08-20 12:00:00") }

  it "should be the start_datetime if last_scheduled_at is nil" do
    start_datetime = dt("2012-08-21 11:00:00")
    end_date       =  d("2012-08-22")
    last_scheduled_at    = nil
    t = ImportTime.new(start_datetime, end_date, :daily, current_time)
    t.next_import_time.should == start_datetime
  end

  context "daily schedule" do
    it "should find the next import time on a daily schedule" do
      start_datetime = dt("2012-08-19 11:00:00")
      end_date       =  d("2012-08-28")
      t = ImportTime.new(start_datetime, end_date, :daily, current_time)
      t.next_import_time.should == dt("2012-08-21 11:00:00")
    end

    it "should be on the last day if the previous run is the day before the last day" do
      start_datetime = dt("2012-08-20 11:00:00")
      end_date       =  d("2012-08-21")
      t = ImportTime.new(start_datetime, end_date, :daily, current_time)
      t.next_import_time.should == dt("2012-08-21 11:00:00")
    end

    it "should not catch up for skipped days (only schedule in the future)" do
      start_datetime = dt("2012-08-18 11:00:00")
      end_date       =  d("2012-08-28")
      t = ImportTime.new(start_datetime, end_date, :daily, current_time)
      t.next_import_time.should == dt("2012-08-21 11:00:00")
    end

    it "should be nil if the next time is after the end date" do
      start_datetime = dt("2012-08-20 11:00:00")
      end_date       =  d("2012-08-20")
      t = ImportTime.new(start_datetime, end_date, :daily, current_time)
      t.next_import_time.should == nil
    end
  end

  context "weekly schedule" do
    it "should find the next import time on a weekly schedule" do
      start_datetime = dt("2012-08-20 11:00:00")
      end_date       =  d("2012-08-28")
      t = ImportTime.new(start_datetime, end_date, :weekly, current_time)
      t.next_import_time.should == dt("2012-08-27 11:00:00")
    end

    it "should be nil if the next time is after the end date" do
      start_datetime = dt("2012-08-10 11:00:00")
      end_date       =  d("2012-08-21")
      t = ImportTime.new(start_datetime, end_date, :weekly, current_time)
      t.next_import_time.should == nil
    end

    it "should not catch up for skipped weeks (only schedule in the future)" do
      start_datetime = dt("2012-08-01 11:00:00")
      end_date       =  d("2012-08-28")
      t = ImportTime.new(start_datetime, end_date, :daily, current_time)
      t.next_import_time.should == dt("2012-08-21 11:00:00")
    end
  end

  context "monthly schedule" do
    it "should find the next import time on a monthly schedule" do
      start_datetime = dt("2012-08-18 11:00:00")
      end_date       =  d("2012-09-28")
      t = ImportTime.new(start_datetime, end_date, :monthly, current_time)
      t.next_import_time.should == dt("2012-09-18 11:00:00")
    end

    context "with other current time" do
      let(:current_time) { dt("2012-02-01 12:00:00") }
      it "should be on the last day on the next month if the scheduled day of the month is after the last day of the next month" do
        start_datetime = dt("2012-01-31 11:00:00")
        end_date       =  d("2012-03-28")
        t = ImportTime.new(start_datetime, end_date, :monthly, current_time)
        t.next_import_time.should == dt("2012-02-29 11:00:00")
      end
    end

    it "should not catch up for skipped months (only schedule in the future)" do
      start_datetime = dt("2012-05-01 11:00:00")
      end_date       =  d("2012-08-28")
      t = ImportTime.new(start_datetime, end_date, :daily, current_time)
      t.next_import_time.should == dt("2012-08-21 11:00:00")
    end
  end
end