require 'spec_helper'

describe ImportPresenter, :type => :view do
  before do
    @presenter = ImportPresenter.new(import, view)
  end
  let(:import) { imports(:default) }

  describe "#to_hash" do
    let(:hash) { @presenter.to_hash }

    it "includes the right keys" do
      hash.should have_key(:source_id)
      hash.should have_key(:source_table)
      hash.should have_key(:execution_info)
      hash[:execution_info].should be_a(Hash)
      hash[:execution_info].should have_key(:to_table)
      hash[:execution_info].should have_key(:to_table_id)
      hash[:execution_info].should have_key(:started_stamp)
      hash[:execution_info].should have_key(:completed_stamp)
      hash[:execution_info].should have_key(:state)
      hash[:execution_info].should have_key(:source_id)
      hash[:execution_info].should have_key(:source_table)
    end
  end
end