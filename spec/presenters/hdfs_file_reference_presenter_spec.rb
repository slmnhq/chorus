require 'spec_helper'

describe HdfsFileReferencePresenter, :type => :view do
  before do
    @hdfsFileReference = HdfsFileReference.create({:path => "/data/test.txt", :hadoop_instance_id => "1"})
    @presenter = HdfsFileReferencePresenter.new(@hdfsFileReference, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys" do
      @hash.should have_key(:hadoop_instance_id)
      @hash.should have_key(:path)
    end
  end
end