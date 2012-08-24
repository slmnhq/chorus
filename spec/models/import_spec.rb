require 'spec_helper'

describe Import do
  describe "associations" do
    it { should belong_to :workspace }
    it { should belong_to(:source_dataset).class_name('Dataset') }
    it { should belong_to :user }
    #it { should belong_to :import_schedule }
  end

end