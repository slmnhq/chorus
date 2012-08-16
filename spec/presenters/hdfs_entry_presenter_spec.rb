require 'spec_helper'

describe HdfsEntryPresenter, :type => :view do
  let(:hadoop_instance) { hadoop_instances(:hadoop) }
  let(:entry) do
    hadoop_instance.hdfs_entries.create!({
      :path => "/data",
      :modified_at => "2010-10-20 10:11:12",
      :size => '10',
      :is_directory => 'true',
      :content_count => 1,
      :hadoop_instance => hadoop_instance
    }, :without_protection => true)
  end
  let(:presenter) { HdfsEntryPresenter.new(entry, view) }

  describe "#to_hash" do
    let(:hash) { presenter.to_hash }

    it "includes the fields" do
      hash[:name].should == "data"
      hash[:path].should == "/"
      hash[:last_updated_stamp].should == "2010-10-20T10:11:12Z"
      hash[:size].should == 10
      hash[:is_dir].should be_true
      hash[:count].should be(1)
      hash[:hadoop_instance].should == {:id => hadoop_instance.id, :name => hadoop_instance.name }
    end
  end
end

