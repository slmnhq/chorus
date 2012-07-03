require 'spec_helper'

describe Visualization do
  let(:table) { FactoryGirl.create(:gpdb_table) }

  describe ".build" do
    context "frequency visualization" do
      let(:params) do
        {
            :type => 'frequency',
            :dataset_id => table.id
        }
      end

      it "builds a frequency visualization" do
        visualization = described_class.build(params)

        visualization.should be_a_kind_of(Visualization::Frequency)
      end
    end
  end
end