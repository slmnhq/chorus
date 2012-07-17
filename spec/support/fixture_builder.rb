def FixtureBuilder.password
  'password'
end

FixtureBuilder.configure do |fbuilder|
  # rebuild fixtures automatically when these files change:
  fbuilder.files_to_check += Dir["spec/support/fixture_builder.rb"]

  fbuilder.name_model_with(Workfile) do |record|
    record['file_name'].gsub(/\s+/, '_').downcase
  end

  fbuilder.name_model_with(InstanceAccount) do |record|
    record['db_username']
  end

  # now declare objects
  fbuilder.factory do
    Sunspot.session = SunspotMatchers::SunspotSessionSpy.new(Sunspot.session)

    (ActiveRecord::Base.direct_descendants - [Legacy]).each do |klass|
      ActiveRecord::Base.connection.execute("ALTER SEQUENCE #{klass.table_name}_id_seq RESTART WITH 1000000;")
    end

    #Users
    admin = User.create!({:first_name => 'Admin', :last_name => 'AlphaSearch', :username => 'admin', :email => 'admin@example.com', :password => FixtureBuilder.password, :admin => true}, :without_protection => true)
    evil_admin = User.create!({:first_name => 'Evil', :last_name => 'AlphaSearch', :username => 'evil_admin', :email => 'evil_admin@example.com', :password => FixtureBuilder.password, :admin => true}, :without_protection => true)
    Events::USER_ADDED.by(admin).add(:new_user => evil_admin)

    alice = User.create!(:first_name => 'Alice', :last_name => 'Alpha', :username => 'alice', :email => 'alice@example.com', :password => FixtureBuilder.password)
    Events::USER_ADDED.by(admin).add(:new_user => alice)

    bob = User.create!(:first_name => 'BobSearch', :last_name => 'Brockovich', :username => 'bob', :email => 'bob@example.com', :password => FixtureBuilder.password)
    Events::USER_ADDED.by(admin).add(:new_user => bob)

    carly = User.create!(:first_name => 'Carly', :last_name => 'Carlson', :username => 'carly', :email => 'carly@example.com', :password => FixtureBuilder.password)
    Events::USER_ADDED.by(admin).add(:new_user => carly)


    #Instances
    greenplum_instance = Instance.create!({ :name => "Greenplum", :description => "Just for bobsearch and greenplumsearch", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => admin }, :without_protection => true)
    Events::GREENPLUM_INSTANCE_CREATED.by(admin).add(:greenplum_instance => greenplum_instance)

    purplebanana_instance = Instance.create!({ :name => "PurpleBanana", :description => "A nice instance in FactoryBuilder", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => admin, :shared => true }, :without_protection => true)
    bobs_instance = Instance.create!({ :name => "bobs_instance", :description => "Bob-like", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => bob, :shared => false}, :without_protection => true)
    hadoop_instance = HadoopInstance.create!({ :name => "Hadoop", :host => "hadoop.example.com", :port => "1111", :owner => admin}, :without_protection => true)
    Events::HADOOP_INSTANCE_CREATED.by(admin).add(:greenplum_instance => greenplum_instance)

    # Instance Accounts
    carly_bobs_instance_account = InstanceAccount.create!({:owner => carly, :instance => bobs_instance, :db_username => "iamcarly", :db_password => "corvette"}, :without_protection => true)

    # Datasets
    bob_database = GpdbDatabase.create!({ :instance => bobs_instance, :name => 'bobs_database' }, :without_protection => true)
    bob_schema = GpdbSchema.create!({ :name => "bobs_schema", :database => bob_database }, :without_protection => true)
    bobs_table = GpdbTable.create!({ :name => "bobs_table", :schema => bob_schema }, :without_protection => true)
    GpdbView.create!({ :name => "bobs_view", :schema => bob_schema }, :without_protection => true)

    other_schema = GpdbSchema.create!({ :name => "other_schema", :database => bob_database}, :without_protection => true)
    GpdbTable.create!({ :name => "other_table", :schema => other_schema }, :without_protection => true)
    GpdbView.create!({ :name => "other_view", :schema => other_schema }, :without_protection => true)

    #Workspaces
    workspaces = []
    workspaces << alice_public_workspace = alice.owned_workspaces.create!(:name => "Alice Public", :summary => 'BobSearch can see I guess')
    workspaces << alice_private_workspace = alice.owned_workspaces.create!(:name => "Alice Private", :summary => "Not for bobsearch, ha ha", :public => false)
    workspaces << alice_archived_workspace = alice.owned_workspaces.create!({:name => "Archived", :archived_at => '2010-01-01'}, :without_protection => true)
    workspaces << bob_public_workspace = bob.owned_workspaces.create!(:name => "Bob Public", :summary => "BobSearch")
    workspaces << bob_private_workspace = bob.owned_workspaces.create!(:name => "Bob Private", :summary => "BobSearch", :public => false)
    workspaces.each do |workspace|
      workspace.members << carly
    end

    #HDFS File References
    hdfs_file_reference = HdfsFileReference.create!({ :hadoop_instance_id => hadoop_instance.id, :path => '/foo/bar/baz.sql'}, :without_protection => true)

    #Workfiles
    File.open(Rails.root.join('spec', 'fixtures', 'workfile.sql')) do |file|
      alice_private = Workfile.create!({:file_name => "Alice Private", :description => "BobSearch", :owner => alice, :workspace => alice_private_workspace}, :without_protection => true)
      WorkfileVersion.create!({:workfile => alice_private, :version_num => "1", :owner => alice, :modifier => alice, :contents => file}, :without_protection => true)
      fbuilder.name :alice_creates_private_workfile, Events::WORKFILE_CREATED.by(alice).add(:workfile => alice_private, :workspace => alice_private_workspace)

      bob_private = Workfile.create!({:file_name => "Bob Private", :description => "BobSearch", :owner => bob, :workspace => bob_private_workspace}, :without_protection => true)
      WorkfileVersion.create!({:workfile => bob_private, :version_num => "1", :owner => bob, :modifier => bob, :contents => file}, :without_protection => true)
      fbuilder.name :bob_creates_private_workfile, Events::WORKFILE_CREATED.by(bob).add(:workfile => bob_private, :workspace => bob_private_workspace)

      bob_public = Workfile.create!({:file_name => "Bob Public", :description => "BobSearch", :owner => bob, :workspace => bob_public_workspace}, :without_protection => true)
      WorkfileVersion.create!({:workfile => bob_public, :version_num => "1", :owner => bob, :modifier => bob, :contents => file}, :without_protection => true)
      fbuilder.name :bob_creates_public_workfile, Events::WORKFILE_CREATED.by(bob).add(:workfile => bob_public, :workspace => bob_public_workspace)
    end

    #Notes
    Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => greenplum_instance, :actor => bob, :body => 'i am a comment with greenplumsearch in me', :created_at => '2010-01-01 02:00'}, :without_protection => true)
    Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => greenplum_instance, :actor => bob, :body => 'i love bobsearch', :created_at => '2010-01-01 02:01'}, :without_protection => true)
    Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => purplebanana_instance, :actor => bob, :body => 'is this a greenplumsearch instance?', :created_at => '2010-01-01 02:02'}, :without_protection => true)
    Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => purplebanana_instance, :actor => bob, :body => 'no, not greenplumsearch', :created_at => '2010-01-01 02:03'}, :without_protection => true)
    Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => purplebanana_instance, :actor => bob, :body => 'really really?', :created_at => '2010-01-01 02:04'}, :without_protection => true)
    Events::NOTE_ON_HADOOP_INSTANCE.by(bob).add(:hadoop_instance => hadoop_instance, :body => 'hadoop-idy-doop')
    Events::NOTE_ON_HDFS_FILE.by(bob).add(:hdfs_file => hdfs_file_reference, :body => 'hhhhhhaaaadooooopppp')
    Events::NOTE_ON_WORKSPACE.by(bob).add(:workspace => bob_public_workspace, :body => 'Come see my awesome workspace!')

    #Events
    Events::GREENPLUM_INSTANCE_CHANGED_OWNER.by(admin).add(:greenplum_instance => greenplum_instance, :new_owner => alice)
    Events::GREENPLUM_INSTANCE_CHANGED_NAME.by(admin).add(:greenplum_instance => greenplum_instance, :old_name => 'mahna_mahna', :new_name => greenplum_instance.name)
    Events::HADOOP_INSTANCE_CHANGED_NAME.by(admin).add(:hadoop_instance => hadoop_instance, :old_name => 'Slartibartfast', :new_name => hadoop_instance.name)
    Events::SOURCE_TABLE_CREATED.by(admin).add(:dataset => bobs_table, :workspace => bob_public_workspace)
    Events::WORKSPACE_ADD_SANDBOX.by(bob).add(:sandbox_schema => bob_schema, :workspace => bob_public_workspace)
    Events::WORKSPACE_ADD_HDFS_AS_EXT_TABLE.by(bob).add(:workspace => bob_public_workspace, :dataset => bobs_table, :hdfs_file => hdfs_file_reference)
    
    
    Sunspot.session = Sunspot.session.original_session if Sunspot.session.is_a? SunspotMatchers::SunspotSessionSpy
  end
end
