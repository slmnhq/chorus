require 'spec_helper'

describe ImportSchedule do
  let(:pending_import_schedule) { import_schedules(:pending_import_schedule) }
  let(:future_import_schedule) { import_schedules(:future_import_schedule) }

  describe "associations" do
    it { should belong_to :workspace }
    it { should belong_to(:source_dataset).class_name('Dataset') }
    it { should belong_to :user }
  end
end