module SolrHelpers

  def create_solr_fixtures
    VCR.use_cassette('search_solr_index') do
      Sunspot.session = Sunspot.session.original_session
      Sunspot.remove_all
      instance1 = FactoryGirl.create(:instance, :id => 1, :name => "bob_great_greenplum_instance")
      instance2 = FactoryGirl.create(:instance, :id => 2, :name => "instance_without_fruit_in_name")
      admin = FactoryGirl.create(:admin, :id => 100)
      some_user = FactoryGirl.create(:user, :id => 101, :username => 'some_user', :first_name => "marty", :last_name => "alpha")
      bob = FactoryGirl.create(:user, :id => 102, :username => 'some_other_user', :first_name => "bob", :last_name => "alpha")
      FactoryGirl.create(:note_on_greenplum_instance_event, :id => 1, :greenplum_instance => instance1, :body => 'i am a comment with greenplum in me')
      FactoryGirl.create(:note_on_greenplum_instance_event, :id => 2, :greenplum_instance => instance1, :body => 'i love bob')
      FactoryGirl.create(:note_on_greenplum_instance_event, :id => 3, :greenplum_instance => instance2, :body => 'is this a greenplum instance?')
      FactoryGirl.create(:note_on_greenplum_instance_event, :id => 4, :greenplum_instance => instance2, :body => 'yes, greenplum')
      FactoryGirl.create(:note_on_greenplum_instance_event, :id => 5, :greenplum_instance => instance2, :body => 'really really?')
      public_bob_workspace = FactoryGirl.create(:workspace, :id => 1, :name => 'bob')
      private_bob_workspace = FactoryGirl.create(:workspace, :id => 2, :name => 'private bob workspace', :public => false)
      private_hidden_from_bob_workspace = FactoryGirl.create(:workspace, :id => 3, :name => 'private hidden from bob workspace', :public => false)
      FactoryGirl.create(:membership, :user => bob, :workspace => private_bob_workspace)
      FactoryGirl.create(:workfile, :id => 1, :owner => bob, :workspace => public_bob_workspace, :file_name => 'bob')
      FactoryGirl.create(:workfile, :id => 2, :owner => bob, :workspace => private_bob_workspace, :file_name => 'private_bob_workfile')
      FactoryGirl.create(:workfile, :id => 3, :owner => admin, :workspace => private_hidden_from_bob_workspace, :file_name => 'private_hidden_from_bob_workfile')
      Sunspot.commit
    end
  end
end