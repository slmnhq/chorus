require 'active_support/core_ext'

class ImportTime
  attr_reader :start_datetime, :end_date, :frequency, :current_time

  def initialize(start_datetime, end_date, frequency, current_time)
    @start_datetime = start_datetime
    @end_date = end_date
    @frequency = frequency.to_s
    @current_time = current_time
  end

  def next_import_time
    time_since_start_of_period = start_datetime - start_of_period(start_datetime)

    next_time = start_of_period(current_time) + time_since_start_of_period

    # clamp days that are not in the current month to the last day of the month
    if frequency == 'monthly' and next_time > current_time.end_of_month
      time_of_day = (start_datetime - start_datetime.beginning_of_day)
      next_time = current_time.end_of_month.beginning_of_day + time_of_day
    end

    next_time += interval if next_time < current_time
    if next_time > end_date.end_of_day
      nil
    else
      next_time
    end
  end

  private

  def interval
    case frequency
      when 'daily' then 1.day
      when 'weekly' then 7.days
      when 'monthly' then 1.month
    end
  end

  def start_of_period(start)
    case frequency
      when 'daily' then start.beginning_of_day
      when 'weekly' then start.beginning_of_week
      when 'monthly' then start.beginning_of_month
    end
  end
end
