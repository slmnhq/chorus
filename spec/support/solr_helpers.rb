module SolrHelpers

  def create_solr_fixtures
    VCR.use_cassette('search_solr_index') do
      Sunspot.session = Sunspot.session.original_session
      Sunspot.remove_all
      FactoryGirl.create(:user, :id => 1, :username => 'some_user', :first_name => "marty", :last_name => "alpha")
      FactoryGirl.create(:user, :id => 2, :username => 'some_other_user', :first_name => "bob", :last_name => "alpha")
      FactoryGirl.create(:instance, :id => 1, :name => "bob_great_greenplum_instance")
      Sunspot.commit
    end
  end
end