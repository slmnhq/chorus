require 'spec_helper'

describe SearchPresenter, :type => :view do

  let(:user) { users(:owner) }

  before do
    reindex_solr_fixtures
    stub(ActiveRecord::Base).current_user { user }
  end

  describe "#to_hash" do

    context "searching without workspace" do
      before do
        search = Search.new(user, :query => 'searchquery')

        VCR.use_cassette('search_solr_query_all_types_as_owner') do
          search.search
        end
        @presenter = SearchPresenter.new(search, view)
        @hash = @presenter.to_hash
      end

      it "includes the right user keys" do
        @hash.should have_key(:users)
        user_hash = @hash[:users]
        user_hash.should have_key(:numFound)
        user_hash.should have_key(:results)
        user_hash[:results][0].should have_key(:highlighted_attributes)
        user_hash[:results][0][:entity_type].should == 'user'
      end

      it "includes the right instance keys" do
        @hash.should have_key(:instances)
        gpdb_instance_hash = @hash[:instances]
        gpdb_instance_hash.should have_key(:numFound)
        gpdb_instance_hash.should have_key(:results)
        gpdb_instance_hash[:results][0].should have_key(:highlighted_attributes)
        gpdb_instance_hash[:results][0][:entity_type].should == 'greenplum_instance'
      end

      it "includes the right hadoop instance keys" do
        @hash.should have_key(:hadoop_instances)
        hadoop_instance_hash = @hash[:hadoop_instances]
        hadoop_instance_hash.should have_key(:numFound)
        hadoop_instance_hash.should have_key(:results)
        hadoop_instance_hash[:results][0].should have_key(:highlighted_attributes)
        hadoop_instance_hash[:results][0][:entity_type].should == 'hadoop_instance'
      end

      it "includes the right workspace keys" do
        @hash.should have_key(:workspaces)
        workspaces_hash = @hash[:workspaces]
        workspaces_hash.should have_key(:numFound)
        workspaces_hash.should have_key(:results)
        workspaces_hash[:results][0].should have_key(:highlighted_attributes)
        workspaces_hash[:results][0][:entity_type].should == 'workspace'
      end

      it "includes the right workfile keys" do
        @hash.should have_key(:workfiles)
        workfile_hash = @hash[:workfiles]
        workfile_hash.should have_key(:numFound)
        workfile_hash.should have_key(:results)
        workfile_hash[:results][0].should have_key(:highlighted_attributes)
        workfile_hash[:results][0].should have_key(:version_info)
        workfile_hash[:results][0][:entity_type].should == 'workfile'
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
        #datasets_hash[:results][0][:schema].should have_key(:highlighted_attributes)
        #datasets_hash[:results][0][:schema][:highlighted_attributes].should have_key(:name)
        datasets_hash[:results][0][:columns][0].should have_key(:highlighted_attributes)
        datasets_hash[:results][0][:columns][0][:highlighted_attributes].should have_key(:body)
        #datasets_hash[:results][0][:schema][:database].should have_key(:highlighted_attributes)
        #datasets_hash[:results][0][:schema][:database][:highlighted_attributes].should have_key(:name)

        datasets_hash[:results][0][:highlighted_attributes].should_not have_key(:name)
        datasets_hash[:results][0][:highlighted_attributes].should_not have_key(:database_name)
        datasets_hash[:results][0][:highlighted_attributes].should_not have_key(:schema_name)
        datasets_hash[:results][0][:highlighted_attributes].should_not have_key(:column_name)

        datasets_hash[:results][0][:entity_type].should == 'dataset'
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
        first_result[:entity_type].should == 'hdfs_file'
      end

      it "does not include the this_workspace key" do
        @hash.should_not have_key(:this_workspace)
      end
    end

    context "when workspace_id is set on the search" do
      let(:workspace) { workspaces(:search_public) }

      before do
        search = Search.new(user, :query => 'searchquery', :workspace_id => workspace.id)

        VCR.use_cassette('search_solr_query_all_types_with_workspace_as_owner') do
          search.models
        end
        @presenter = SearchPresenter.new(search, view)
        @hash = @presenter.to_hash
      end

      it "includes the right this_workspace keys" do
        @hash.should have_key(:this_workspace)
        this_workspace_hash = @hash[:this_workspace]
        this_workspace_hash.should have_key(:numFound)
        this_workspace_hash.should have_key(:results)
      end

      it "puts the highlighted schema attributes on the schema" do
        dataset_hash = @hash[:this_workspace][:results].find { |entry| entry[:entity_type] == 'dataset' }
        dataset_hash[:schema][:highlighted_attributes][:name][0].should == "<em>searchquery</em>_schema"
        dataset_hash[:schema][:database][:highlighted_attributes][:name][0].should == "<em>searchquery</em>_database"
        dataset_hash.should have_key(:workspace)
      end
    end

    context "when the search is a type ahead search" do
      let(:search) do
        Search.new(user,
                   :query => 'searchquery',
                   :search_type => :type_ahead).tap do |search|
          VCR.use_cassette('type_ahead_search') do
            search.models # force lazy evaluation of search results
          end
        end
      end
      let(:presenter) { SearchPresenter.new(search, view) }

      it "returns an array of models including one of each type" do
        results = presenter.to_hash[:type_ahead][:results]
        types = results.map { |result| result[:entity_type] }
        types.should include("user", "workfile", "dataset", "hdfs_file", "greenplum_instance", "hadoop_instance")
      end
    end
  end
end
