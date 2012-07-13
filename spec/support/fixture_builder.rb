FixtureBuilder.configure do |fbuilder|
  # rebuild fixtures automatically when these files change:
  fbuilder.files_to_check += Dir["spec/support/fixture_builder.rb"]

  fbuilder.name_model_with(Workfile) do |record|
    record['file_name'].gsub(/\s+/, '_').downcase
  end

  # now declare objects
  fbuilder.factory do
    #Users
    admin = User.create!({:first_name => 'Admin', :last_name => 'Alpha', :username => 'admin', :email => 'admin@example.com', :password => 'password', :admin => true}, :without_protection => true)
    evil_admin = User.create!({:first_name => 'Evil', :last_name => 'Alpha', :username => 'evil_admin', :email => 'evil_admin@example.com', :password => 'password', :admin => true}, :without_protection => true)
    alice = User.create!(:first_name => 'Alice', :last_name => 'Alpha', :username => 'alice', :email => 'alice@example.com', :password => 'password')
    bob = User.create!(:first_name => 'Bob', :last_name => 'Brockovich', :username => 'bob', :email => 'bob@example.com', :password => 'password')
    carly = User.create!(:first_name => 'Carly', :last_name => 'Carlson', :username => 'carly', :email => 'carly@example.com', :password => 'password')


    #Instances
    greenplum_instance = Instance.create!({ :name => "Greenplum", :description => "Just for bob", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => admin }, :without_protection => true)
    purplebanana_instance = Instance.create!({ :name => "PurpleBanana", :description => "A nice instance in FactoryBuilder", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => admin, :shared => true }, :without_protection => true)


    #Workspaces
    workspaces = []
    workspaces << alice_public_workspace = alice.owned_workspaces.create!(:name => "Alice Public", :summary => 'Bob can see I guess')
    workspaces << alice_private_workspace = alice.owned_workspaces.create!(:name => "Alice Private", :summary => "Not for bob, ha ha", :public => false)
    workspaces << alice_archived_workspace = alice.owned_workspaces.create!({:name => "Archived", :archived_at => '2010-01-01'}, :without_protection => true)
    workspaces << bob_public_workspace = bob.owned_workspaces.create!(:name => "Bob Public")
    workspaces << bob_private_workspace = bob.owned_workspaces.create!(:name => "Bob Private", :public => false)
    workspaces.each do |workspace|
      workspace.members << carly
    end


    #Workfiles
    alice_private = Workfile.create!({:file_name => "Alice Private", :description => "Bob", :owner => alice, :workspace => alice_private_workspace}, :without_protection => true)
    WorkfileVersion.create!({:workfile => alice_private, :version_num => "1", :owner => alice, :modifier => alice}, :without_protection => true)

    bob_private = Workfile.create!({:file_name => "Bob Private", :owner => bob, :workspace => bob_private_workspace}, :without_protection => true)
    WorkfileVersion.create!({:workfile => bob_private, :version_num => "1", :owner => bob, :modifier => bob}, :without_protection => true)

    bob_public = Workfile.create!({:file_name => "Bob Public", :owner => bob, :workspace => bob_public_workspace}, :without_protection => true)
    WorkfileVersion.create!({:workfile => bob_public, :version_num => "1", :owner => bob, :modifier => bob}, :without_protection => true)


    #Notes
    Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => greenplum_instance, :actor => bob, :body => 'i am a comment with greenplum in me', :created_at => '2010-01-01 02:00'}, :without_protection => true)
    Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => greenplum_instance, :actor => bob, :body => 'i love bob', :created_at => '2010-01-01 02:01'}, :without_protection => true)
    Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => purplebanana_instance, :actor => bob, :body => 'is this a greenplum instance?', :created_at => '2010-01-01 02:02'}, :without_protection => true)
    Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => purplebanana_instance, :actor => bob, :body => 'no, not greenplum', :created_at => '2010-01-01 02:03'}, :without_protection => true)
    Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => purplebanana_instance, :actor => bob, :body => 'really really?', :created_at => '2010-01-01 02:04'}, :without_protection => true)
  end
end