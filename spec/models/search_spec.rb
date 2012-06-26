require "spec_helper"
describe Search do
  describe "new" do
    it "takes search params" do
      search = Search.new(:query => 'fries')
      search.query.should == 'fries'
    end
  end

  describe "results" do
    it "searches for Users and Instances with query" do
      search = Search.new(:query => 'bob')
      search.search
      Sunspot.session.should be_a_search_for(User)
      Sunspot.session.should be_a_search_for(Instance)
      Sunspot.session.should have_search_params(:fulltext, 'bob')
    end
  end

  context "with solr enabled" do
    before do
      create_solr_fixtures
      @instance = Instance.first
      @bob = User.find_by_first_name('bob')
    end

    describe "num_found" do
      it "returns a hash with the number found of each type" do
        VCR.use_cassette('search_solr_query') do
          search = Search.new(:query => 'bob')
          search.num_found[:users].should == 1
          search.num_found[:instances].should == 1
        end
      end
    end

    describe "users" do
      it "includes the highlighted attributes" do
        VCR.use_cassette('search_solr_query') do
          search = Search.new(:query => 'bob')
          user = search.users.first
          user.highlighted_attributes.length.should == 1
          user.highlighted_attributes[:first_name][0].should == '<em>bob</em>'
        end
      end

      it "returns the User objects found" do
        VCR.use_cassette('search_solr_query') do
          search = Search.new(:query => 'bob')
          search.users.length.should == 1
          search.users.first.should == @bob
        end
      end
    end

    describe "instances" do
      it "includes the highlighted attributes" do
        VCR.use_cassette('search_solr_query') do
          search = Search.new(:query => 'bob')
          instance = search.instances.first
          instance.highlighted_attributes.length.should == 1
          instance.highlighted_attributes[:name][0].should == "<em>bob's</em> great greenplum instance"
        end
      end

      it "returns the Instance objects found" do
        VCR.use_cassette('search_solr_query') do
          search = Search.new(:query => 'bob')
          search.instances.length.should == 1
          search.instances.first.should == @instance
        end
      end
    end
  end
end