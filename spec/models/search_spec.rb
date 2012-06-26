require "spec_helper"
describe Search do
  describe "new" do
    it "takes search params" do
      search = Search.new(:query => 'fries')
      search.query.should == 'fries'
    end
  end

  describe "results" do
    it "searches for Users with query" do
      search = Search.new(:query => 'bob')
      search.results
      Sunspot.session.should be_a_search_for(User)
      Sunspot.session.should have_search_params(:fulltext, 'bob')
    end
  end

  describe "num_found" do
    it "returns a hash with the number found of each type" do
      search = Search.new(:query => 'bob')
      search.num_found[:users].should == 0
    end
  end

  context "with solr enabled" do
    before do
      VCR.use_cassette('search_solr_index') do
        Sunspot.remove_all
        Sunspot.session = Sunspot.session.original_session
        FactoryGirl.create(:user, :id => 1, :username => 'some_user', :first_name => "marty", :last_name => "alpha")
        @bob = FactoryGirl.create(:user, :id => 2, :username => 'some_other_user', :first_name => "bob", :last_name => "alpha")
        Sunspot.commit
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
  end
end