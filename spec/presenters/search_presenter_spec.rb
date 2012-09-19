require 'spec_helper'

describe SearchPresenter, :type => :view do

  let(:user) { users(:owner) }

  before(:each) do
    reindex_solr_fixtures
    stub(ActiveRecord::Base).current_user { user }
    search = Search.new(user, :query => 'searchquery')

    VCR.use_cassette('search_solr_query_all_types_bob_as_bob') do
      search.search
    end
    @presenter = SearchPresenter.new(search, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right user keys" do
      @hash.should have_key(:users)
      user_hash = @hash[:users]
      user_hash.should have_key(:numFound)
      user_hash.should have_key(:results)
      user_hash[:results][0].should have_key(:highlighted_attributes)
    end

    it "includes the right instance keys" do
      @hash.should have_key(:instances)
      gpdb_instance_hash = @hash[:instances]
      gpdb_instance_hash.should have_key(:numFound)
      gpdb_instance_hash.should have_key(:results)
      gpdb_instance_hash[:results][0].should have_key(:highlighted_attributes)
    end

    it "includes the right hadoop instance keys" do
      @hash.should have_key(:hadoop_instances)
      hadoop_instance_hash = @hash[:hadoop_instances]
      hadoop_instance_hash.should have_key(:numFound)
      hadoop_instance_hash.should have_key(:results)
      hadoop_instance_hash[:results][0].should have_key(:highlighted_attributes)
    end

    it "includes the right workspace keys" do
      @hash.should have_key(:workspaces)
      workspaces_hash = @hash[:workspaces]
      workspaces_hash.should have_key(:numFound)
      workspaces_hash.should have_key(:results)
      workspaces_hash[:results][0].should have_key(:highlighted_attributes)
    end

    it "includes the right workfile keys" do
      @hash.should have_key(:workfiles)
      workfile_hash = @hash[:workfiles]
      workfile_hash.should have_key(:numFound)
      workfile_hash.should have_key(:results)
      workfile_hash[:results][0].should have_key(:highlighted_attributes)
      workfile_hash[:results][0].should have_key(:version_info)
    end

    it "includes the comments" do
      gpdb_instance_hash = @hash[:instances]
      gpdb_instance_result = gpdb_instance_hash[:results][0]
      gpdb_instance_result.should have_key(:comments)
      gpdb_instance_result[:comments].length.should == 1
      gpdb_instance_result[:comments][0][:highlighted_attributes][:body][0].should == "i love <em>searchquery</em>"
    end

    it "includes the right dataset keys" do
      @hash.should have_key(:datasets)
      datasets_hash = @hash[:datasets]
      datasets_hash.should have_key(:numFound)
      datasets_hash.should have_key(:results)
      datasets_hash[:results][0].should have_key(:highlighted_attributes)
      datasets_hash[:results][0][:highlighted_attributes].should have_key(:object_name)
      datasets_hash[:results][0][:schema].should have_key(:highlighted_attributes)
      datasets_hash[:results][0][:schema][:highlighted_attributes].should have_key(:name)
      datasets_hash[:results][0][:columns][0].should have_key(:highlighted_attributes)
      datasets_hash[:results][0][:columns][0][:highlighted_attributes].should have_key(:body)
      datasets_hash[:results][0][:schema][:database].should have_key(:highlighted_attributes)
      datasets_hash[:results][0][:schema][:database][:highlighted_attributes].should have_key(:name)

      datasets_hash[:results][0][:highlighted_attributes].should_not have_key(:name)
      datasets_hash[:results][0][:highlighted_attributes].should_not have_key(:database_name)
      datasets_hash[:results][0][:highlighted_attributes].should_not have_key(:schema_name)
      datasets_hash[:results][0][:highlighted_attributes].should_not have_key(:column_name)
    end

    it "includes the hdfs entries" do
      @hash.should have_key(:hdfs)
      hdfs_hash = @hash[:hdfs]
      hdfs_hash.should have_key(:numFound)
      hdfs_hash.should have_key(:results)
      first_result = hdfs_hash[:results][0]
      first_result.should have_key(:path)
      first_result.should have_key(:name)
      first_result.should have_key(:ancestors)
      first_result.should have_key(:highlighted_attributes)
    end
  end
end
