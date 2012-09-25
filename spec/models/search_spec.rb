require "spec_helper"
describe Search do

  describe "with solr disabled" do
    let(:user) { users(:owner) }

    describe "new" do
      it "takes current user and search params" do
        search = Search.new(user, :query => 'fries')
        search.current_user.should == user
        search.query.should == 'fries'
      end
    end

    describe "valid" do
      it "is not valid without a valid entity_type" do
        search = Search.new(user, :query => 'fries', :entity_type => 'potato')
        search.should_not be_valid
        search.errors[:entity_type].should include [:invalid_entity_type, {}]
      end

      it "raises ApiValidationError when search is invalid" do
        search = Search.new(user, :query => 'fries')
        stub(search).valid? { false }
        expect {
          search.search
        }.to raise_error(ApiValidationError)
      end
    end

    describe "search" do
      it "searches for all types with query" do
        search = Search.new(user, :query => 'bob')
        search.search
        Sunspot.session.should be_a_search_for(User)
        Sunspot.session.should be_a_search_for(GpdbInstance)
        Sunspot.session.should be_a_search_for(HadoopInstance)
        Sunspot.session.should be_a_search_for(Workspace)
        Sunspot.session.should be_a_search_for(Workfile)
        Sunspot.session.should be_a_search_for(Dataset)
        Sunspot.session.should be_a_search_for(HdfsEntry)
        Sunspot.session.should have_search_params(:fulltext, 'bob')
        Sunspot.session.should have_search_params(:facet, :type_name)
        Sunspot.session.should have_search_params(:group, Proc.new {
          group :grouping_id do
            truncate
            limit 3
          end
        })
      end

      it "uses the page and per_page parameters" do
        search = Search.new(user, :query => 'bob', :page => 4, :per_page => 42)
        search.search
        Sunspot.session.should have_search_params(:paginate, :page => 4, :per_page => 42)
      end

      describe "per_type" do
        it "performs secondary searches to pull back needed records" do
          any_instance_of(Sunspot::Search::AbstractSearch) do |search|
            stub(search).group_response { {} }
          end
          search = Search.new(user, :query => 'bob', :per_type => 3)
          stub(search).num_found do
            hsh = Hash.new(0)
            hsh.merge({:users => 100, :gpdb_instances => 100, :hadoop_instances => 100, :workspaces => 100, :workfiles => 100, :datasets => 100, :hdfs_entries => 100})
          end
          stub(search.search).each_hit_with_result { [] }
          search.models
          Sunspot.session.searches.length.should == search.models_to_search.length + 1
          search.models_to_search.each_with_index do |model, index|
            sunspot_search = Sunspot.session.searches[index+1]
            sunspot_search.should be_a_search_for(model)
            (search.models_to_search - [model]).each do |other_model|
              sunspot_search.should_not be_a_search_for(other_model)
            end
            sunspot_search.should have_search_params(:fulltext, 'bob')
            sunspot_search.should have_search_params(:paginate, :page => 1, :per_page => 3)
            sunspot_search.should_not have_search_params(:facet, :type_name)
          end
        end

        describe "entity_type" do
          it "searches for the provided models" do
            search = Search.new(user, :query => 'bob', :entity_type => 'gpdb_instance')
            search.search
            Sunspot.session.should_not be_a_search_for(User)
            Sunspot.session.should be_a_search_for(GpdbInstance)
          end
        end

        it "overrides page and per_page" do
          search = Search.new(user, :query => 'bob', :per_type => 3, :page => 2, :per_page => 5)
          search.search
          Sunspot.session.should have_search_params(:paginate, :page => 1, :per_page => 100)
        end
      end

      describe "dataset search with no accessible instance accounts for the user" do
        it "does not include the condition for instance accounts" do
          stub(user).accessible_account_ids { [] }
          Search.new(user, :query => 'whatever', :entity_type => :dataset).search
          Sunspot.session.should have_search_params(:with, Proc.new {
            any_of do
              without :type_name, Dataset.type_name
            end
          })
        end
      end
    end

    describe "search with a specific model" do
      it "only searches for that model" do
        search = Search.new(user, :query => 'bob', :entity_type => 'user')
        search.search
        Sunspot.session.should be_a_search_for(User)
        Sunspot.session.should_not be_a_search_for(GpdbInstance)
        Sunspot.session.should have_search_params(:fulltext, 'bob')
        Sunspot.session.should_not have_search_params(:facet, :type_name)
      end
    end

    describe "with a workspace_id" do
      let(:search) { Search.new(user, :query => 'bob', :per_type => 3, :workspace_id => 7) }

      before do
        any_instance_of(Sunspot::Search::AbstractSearch) do |search|
          stub(search).group_response { {} }
        end
        search.models
      end

      it "performs a secondary search to pull back workfiles and datasets within the workspace" do
        Sunspot.session.searches.length.should == 2
        Sunspot.session.searches.last.should be_a_search_for(Dataset)
        Sunspot.session.searches.last.should be_a_search_for(Workfile)
        Sunspot.session.searches.last.should be_a_search_for(Workspace)
        Sunspot.session.searches.last.should_not be_a_search_for(User)
        Sunspot.session.searches.last.should have_search_params(:with, :workspace_id, 7)
      end

      it "limits the results to a max of per_page" do
        Sunspot.session.searches.last.should have_search_params(:paginate, :page => 1, :per_page => 3)
      end

      it "searches for the same query" do
        Sunspot.session.searches.last.should have_search_params(:fulltext, 'bob')
      end

      it "does not perform the workspace search more than once" do
        search.num_found
        Sunspot.session.searches.length.should == 2
      end
    end
  end

  context "with solr enabled" do
    let(:admin) { users(:admin) }
    let(:owner) { users(:owner) }
    let(:the_collaborator) { users(:the_collaborator) }
    let(:gpdb_instance) { gpdb_instances(:greenplum) }
    let(:hadoop_instance) { hadoop_instances(:hadoop) }
    let(:hdfs_entry) { HdfsEntry.find_by_path("/searchquery/result.txt") }
    let(:public_workspace) { workspaces(:public_with_no_collaborators) }
    let(:private_workspace) { workspaces(:private) }
    let(:private_workspace_not_a_member) { workspaces(:private_with_no_collaborators) }
    let(:private_workfile_hidden_from_owner) { workfiles(:no_collaborators_private) }
    let(:private_workfile) { workfiles(:private) }
    let(:public_workfile) { workfiles(:public) }
    let(:dataset) { datasets(:searchquery_table) }
    let(:shared_dataset) { datasets(:searchquery_shared_table) }
    let(:chorus_view) { datasets(:searchquery_chorus_view) }

    before do
      reindex_solr_fixtures
    end

    describe "num_found" do
      it "returns a hash with the number found of each type" do
        VCR.use_cassette('search_solr_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'searchquery')
          search.num_found[:users].should == 1
          search.num_found[:gpdb_instances].should == 1
          search.num_found[:datasets].should == 3
        end
      end

      it "returns a hash with the total count for the given type" do
        VCR.use_cassette('search_solr_query_user_as_owner') do
          search = Search.new(owner, :query => 'searchquery', :entity_type => 'user')
          search.num_found[:users].should == 1
          search.num_found[:gpdb_instances].should == 0
        end
      end

      it "includes the number of workspace specific results found" do
        workspace = workspaces(:search_public)
        VCR.use_cassette('search_solr_query_all_types_with_workspace_as_owner') do
          search = Search.new(owner, :query => 'searchquery', :workspace_id => workspace.id)
          search.num_found[:this_workspace].should == 3
        end

      end
    end

    describe "users" do
      it "includes the highlighted attributes" do
        VCR.use_cassette('search_solr_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'searchquery')
          user = search.users.first
          user.highlighted_attributes[:first_name][0].should == '<em>searchquery</em>'
        end
      end

      it "returns the User objects found" do
        VCR.use_cassette('search_solr_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'searchquery')
          search.users.length.should == 1
          search.users.first.should == owner
        end
      end
    end

    describe "gpdb_instances" do
      it "includes the highlighted attributes" do
        VCR.use_cassette('search_solr_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'searchquery')
          gpdb_instance = search.gpdb_instances.first
          gpdb_instance.highlighted_attributes.length.should == 1
          gpdb_instance.highlighted_attributes[:description][0].should == "Just for <em>searchquery</em> and greenplumsearch"
        end
      end

      it "returns the GpdbInstance objects found" do
        VCR.use_cassette('search_solr_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'searchquery')
          search.gpdb_instances.length.should == 1
          search.gpdb_instances.first.should == gpdb_instance
        end
      end
    end

    describe "hadoop_instances" do
      it "includes the highlighted attributes" do
        VCR.use_cassette('search_solr_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'searchquery')
          hadoop_instance = search.hadoop_instances.first
          hadoop_instance.highlighted_attributes.length.should == 1
          hadoop_instance.highlighted_attributes[:description][0].should == "<em>searchquery</em> for the hadoop instance"
        end
      end

      it "returns the HadoopInstance objects found" do
        VCR.use_cassette('search_solr_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'hadoop instance')
          search.hadoop_instances.length.should == 1
          search.hadoop_instances.first.should == hadoop_instance
        end
      end
    end

    describe "datasets" do
      it "includes the highlighted attributes" do
        VCR.use_cassette('search_solr_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'searchquery')
          dataset = search.datasets.first
          dataset.highlighted_attributes.length.should == 4
          dataset.highlighted_attributes[:name][0].should == "<em>searchquery</em>_table"
          dataset.highlighted_attributes[:database_name][0].should == "<em>searchquery</em>_database"
          dataset.highlighted_attributes[:schema_name][0].should == "<em>searchquery</em>_schema"
        end
      end

      it "includes the highlighted query for a chorus view" do
        VCR.use_cassette('search_solr_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'searchquery')
          chorus_view = search.datasets.find { |dataset| dataset.is_a? ChorusView }
          chorus_view.highlighted_attributes[:query][0].should == "select <em>searchquery</em> from a_table"
        end
      end

      it "returns the Dataset objects found" do
        VCR.use_cassette('search_solr_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'searchquery')
          search.datasets.should =~ [dataset, shared_dataset, chorus_view]
        end
      end

      it "excludes datasets you don't have permissions to" do
        VCR.use_cassette('search_solr_query_datasets_searchquery_as_the_collaborator') do
          the_collaborator.instance_accounts.joins(:gpdb_databases).should be_empty
          search = Search.new(the_collaborator, :query => 'searchquery', :entity_type => :dataset)
          search.datasets.should == [shared_dataset]
        end
      end

      it "includes notes" do
        events(:note_on_dataset).body.should == "notesearch ftw"
        VCR.use_cassette('search_solr_notes_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'notesearch')
          dataset = search.datasets.first
          dataset.search_result_notes[0][:highlighted_attributes][:body][0].should == "<em>notesearch</em> ftw"
        end
      end

      it "excludes notes on datasets you can't see" do
        events(:note_on_dataset).body.should == "notesearch ftw"
        VCR.use_cassette('search_solr_notes_query_all_types_as_the_collaborator') do
          search = Search.new(the_collaborator, :query => 'notesearch')
          search.datasets.should be_empty
        end
      end

      it "includes notes created in the workspace context" do
        events(:note_on_workspace_dataset).body.should == "workspacedatasetnotesearch"
        VCR.use_cassette('search_solr_ws_dataset_notes_query') do
          search = Search.new(owner, :query => 'workspacedatasetnotesearch')
          dataset = search.datasets.first
          dataset.search_result_notes[0][:highlighted_attributes][:body][0].should == "<em>workspacedatasetnotesearch</em>"
        end
      end
    end

    describe "hdfs_entries" do
      it "includes the highlighted attributes" do
        VCR.use_cassette('search_solr_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'searchquery')
          hdfs = search.hdfs_entries.first
          hdfs.highlighted_attributes.length.should == 2
          hdfs.highlighted_attributes[:parent_name][0].should == "<em>searchquery</em>"
          hdfs.highlighted_attributes[:path][0].should == "/<em>searchquery</em>"
        end
      end

      it "returns the HadoopInstance objects found" do
        VCR.use_cassette('search_solr_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'searchquery')
          search.hdfs_entries.length.should == 1
          search.hdfs_entries.first.should == hdfs_entry
        end
      end
    end

    describe "highlighted notes" do
      it "includes highlighted notes in the highlighted_attributes" do
        VCR.use_cassette('search_solr_query_all_types_greenplum_as_owner') do
          search = Search.new(owner, :query => 'greenplumsearch')
          search.gpdb_instances.length.should == 2
          gpdb_instance_with_notes = search.gpdb_instances[1]
          gpdb_instance_with_notes.search_result_notes.length.should == 2
          gpdb_instance_with_notes.search_result_notes[0][:highlighted_attributes][:body][0].should == "no, not <em>greenplumsearch</em>"
        end
      end
    end

    describe "per_type" do
      it "does not return more than per_type of any model" do
        VCR.use_cassette('search_solr_query_all_per_type_1_as_owner') do
          search = Search.new(owner, :query => 'alphasearch', :per_type => 1)
          search.users.length.should == 1
          search.num_found[:users].should > 1
        end
      end
    end

    describe "workspace permissions" do
      it "returns public and member workspaces, but not private ones" do
        VCR.use_cassette('search_solr_query_workspaces_as_owner') do
          search = Search.new(owner, :query => 'searchquery', :entity_type => :workspace)
          search.workspaces.should include(public_workspace)
          search.workspaces.should include(private_workspace)
          search.workspaces.should_not include(private_workspace_not_a_member)
        end
      end

      it "returns everything for admins" do
        VCR.use_cassette('search_solr_query_workspaces_as_admin') do
          search = Search.new(admin, :query => 'searchquery', :entity_type => :workspace)
          search.workspaces.should include(public_workspace)
          search.workspaces.should include(private_workspace)
          search.workspaces.should include(private_workspace_not_a_member)
        end
      end

      it "includes notes" do
        events(:note_on_public_workspace).body.should == "notesearch forever"
        VCR.use_cassette('search_solr_notes_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'notesearch')
          workspace = search.workspaces.first
          workspace.search_result_notes[0][:highlighted_attributes][:body][0].should == "<em>notesearch</em> forever"
        end
      end

      it "excludes notes on workspaces you can't see" do
        events(:note_on_no_collaborators_private).body.should == "notesearch never"
        VCR.use_cassette('search_solr_notes_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'notesearch')
          workspace = search.workspaces.should_not include private_workspace_not_a_member
        end
      end
    end

    describe "workfile permissions" do
      it "returns workfiles for public and member workspaces, but not private ones" do
        VCR.use_cassette('search_solr_query_workfiles_as_owner') do
          search = Search.new(owner, :query => 'searchquery', :entity_type => :workfile)
          search.workfiles.should include(public_workfile)
          search.workfiles.should include(private_workfile)
          search.workfiles.should_not include(private_workfile_hidden_from_owner)
        end
      end

      it "returns workfiles for every workspace for admins" do
        VCR.use_cassette('search_solr_query_workfiles_as_admin') do
          search = Search.new(admin, :query => 'searchquery', :entity_type => :workfile)
          search.workfiles.should include(public_workfile)
          search.workfiles.should include(private_workfile)
          search.workfiles.should include(private_workfile_hidden_from_owner)
        end
      end

      it "includes notes" do
        events(:note_on_public_workfile).body.should == "notesearch forever"
        VCR.use_cassette('search_solr_notes_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'notesearch')
          workfiles = search.workfiles.first
          workfiles.search_result_notes[0][:highlighted_attributes][:body][0].should == "<em>notesearch</em> forever"
        end
      end

      it "excludes notes on workfiles you can't see" do
        events(:note_on_no_collaborators_private_workfile).body.should == "notesearch never"
        VCR.use_cassette('search_solr_notes_query_all_types_as_owner') do
          search = Search.new(owner, :query => 'notesearch')
          workfile = search.workfiles.should_not include private_workfile_hidden_from_owner
        end
      end
    end
  end
end
