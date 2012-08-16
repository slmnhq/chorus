require_relative "./database_integration/setup_gpdb"

def FixtureBuilder.password
  'password'
end

FixtureBuilder.configure do |fbuilder|
  # rebuild fixtures automatically when these files change:
  fbuilder.files_to_check += Dir["spec/support/fixture_builder.rb"]

  fbuilder.name_model_with(Workfile) do |record|
    record['file_name'].gsub(/\s+/, '_').downcase
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

    not_a_member = User.create!(:first_name => 'Alone', :last_name => 'NoMember', :username => 'not_a_member', :email => 'alone@example.com', :password => FixtureBuilder.password)
    Events::USER_ADDED.by(admin).add(:new_user => not_a_member)

    user_with_restricted_access = User.create!(:first_name => 'Restricted', :last_name => 'User', :username => 'restricted_user', :email => 'restricted@example.com', :password => FixtureBuilder.password)
    Events::USER_ADDED.by(user_with_restricted_access).add(:new_user => user_with_restricted_access)

    #Instances
    greenplum_instance = Instance.create!({ :name => "Greenplum", :description => "Just for bobsearch and greenplumsearch", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => admin }, :without_protection => true)
    Events::GREENPLUM_INSTANCE_CREATED.by(admin).add(:greenplum_instance => greenplum_instance)

    aurora_instance = Instance.create!({ :name => "Aurora", :description => "Provisioned", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => admin, :provision_type => "aurora" }, :without_protection => true)
    Events::GREENPLUM_INSTANCE_CREATED.by(admin).add(:greenplum_instance => aurora_instance)

    purplebanana_instance = Instance.create!({ :name => "PurpleBanana", :description => "A nice instance in FactoryBuilder", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => admin, :shared => true }, :without_protection => true)
    bobs_instance = Instance.create!({ :name => "bobs_instance", :description => "Bob-like", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => bob, :shared => false}, :without_protection => true)
    fbuilder.name :bob_creates_greenplum_instance, Events::GREENPLUM_INSTANCE_CREATED.by(bob).add(:greenplum_instance => bobs_instance)

    hadoop_instance = HadoopInstance.create!({ :name => "Hadoop", :host => "hadoop.example.com", :port => "1111", :owner => admin}, :without_protection => true)
    Events::HADOOP_INSTANCE_CREATED.by(admin).add(:greenplum_instance => greenplum_instance)

    HdfsEntry.create!({:path => "/bobsearch/result.txt", :size => 10, :is_directory => false, :modified_at => Time.parse("2010-10-20 22:00:00"), :content_count => 4, :hadoop_instance => hadoop_instance}, :without_protection => true)

    chorus_gpdb40_instance = Instance.create!(GpdbIntegration.instance_config_for_gpdb("chorus-gpdb40").merge({:name => "chorus_gpdb40", :owner => admin}), :without_protection => true)
    chorus_gpdb41_instance = Instance.create!(GpdbIntegration.instance_config_for_gpdb("chorus-gpdb41").merge({:name => "chorus_gpdb41", :owner => admin}), :without_protection => true)
    chorus_gpdb42_instance = Instance.create!(GpdbIntegration.instance_config_for_gpdb("chorus-gpdb42").merge({:name => "chorus_gpdb42", :owner => admin}), :without_protection => true)

    # Instance Accounts
    shared_instance_account = InstanceAccount.create!({:owner => admin, :instance => purplebanana_instance, :db_username => 'admin', :db_password => '12345'}, :without_protection => true)
    fbuilder.name(:admin, shared_instance_account)
    carly_bobs_instance_account = InstanceAccount.create!({:owner => carly, :instance => bobs_instance, :db_username => "iamcarly", :db_password => "corvette"}, :without_protection => true)
    fbuilder.name(:iamcarly, carly_bobs_instance_account)
    bob_bobs_instance_account = InstanceAccount.create!({:owner => bob, :instance => bobs_instance, :db_username => 'bobo', :db_password => 'i <3 me'}, :without_protection => true)
    fbuilder.name(:bobo, bob_bobs_instance_account)
    aurora_instance_account = InstanceAccount.create!({:owner => admin, :instance => aurora_instance, :db_username => 'edcadmin', :db_password => 'secret'}, :without_protection => true)
    fbuilder.name(:aurora, aurora_instance_account)

    chorus_gpdb40_instance_account = InstanceAccount.create!(GpdbIntegration.account_config_for_gpdb("chorus-gpdb40").merge({:owner => admin, :instance => chorus_gpdb40_instance}), :without_protection => true)
    fbuilder.name(:chorus_gpdb40_test_superuser, chorus_gpdb40_instance_account)
    chorus_gpdb41_instance_account = InstanceAccount.create!(GpdbIntegration.account_config_for_gpdb("chorus-gpdb41").merge({:owner => admin, :instance => chorus_gpdb41_instance}), :without_protection => true)
    fbuilder.name(:chorus_gpdb41_test_superuser, chorus_gpdb41_instance_account)
    chorus_gpdb42_instance_account = InstanceAccount.create!(GpdbIntegration.account_config_for_gpdb("chorus-gpdb42").merge({:owner => admin, :instance => chorus_gpdb42_instance}), :without_protection => true)
    fbuilder.name(:chorus_gpdb42_test_superuser, chorus_gpdb42_instance_account)

    InstanceAccount.create!({:db_username => 'user_with_restricted_access', :db_password => 'secret', :owner => user_with_restricted_access, :instance => chorus_gpdb40_instance}, :without_protection => true)
    InstanceAccount.create!({:db_username => 'user_with_restricted_access', :db_password => 'secret', :owner => user_with_restricted_access, :instance => chorus_gpdb41_instance}, :without_protection => true)
    InstanceAccount.create!({:db_username => 'user_with_restricted_access', :db_password => 'secret', :owner => user_with_restricted_access, :instance => chorus_gpdb42_instance}, :without_protection => true)

    # Datasets
    bob_database = GpdbDatabase.create!({ :instance => bobs_instance, :name => 'bobs_database' }, :without_protection => true)
    bob_schema = GpdbSchema.create!({ :name => "bobs_schema", :database => bob_database }, :without_protection => true)
    bobs_table = GpdbTable.create!({ :name => "bobs_table", :schema => bob_schema }, :without_protection => true)
    GpdbView.create!({ :name => "bobs_view", :schema => bob_schema }, :without_protection => true)

    bobsearch_database = GpdbDatabase.create!({ :instance => bobs_instance, :name => 'bobsearch_database' }, :without_protection => true)
    bobsearch_schema = GpdbSchema.create!({ :name => "bobsearch_schema", :database => bobsearch_database }, :without_protection => true)
    bobssearch_table = GpdbTable.create!({ :name => "bobsearch_table", :schema => bobsearch_schema }, :without_protection => true)

    shared_search_database = GpdbDatabase.create!({ :instance => purplebanana_instance, :name => 'shared_database' }, :without_protection => true)
    shared_search_schema = GpdbSchema.create!({ :name => 'shared_schema', :database => shared_search_database }, :without_protection => true)
    GpdbTable.create!({ :name => "bobsearch_shared_table", :schema => shared_search_schema }, :without_protection => true)

    other_schema = GpdbSchema.create!({ :name => "other_schema", :database => bob_database}, :without_protection => true)
    other_table = GpdbTable.create!({ :name => "other_table", :schema => other_schema }, :without_protection => true)
    GpdbView.create!({ :name => "other_view", :schema => other_schema }, :without_protection => true)

    # Database Instance Accounts
    bobsearch_database.instance_accounts << bob_bobs_instance_account
    shared_search_database.instance_accounts << shared_instance_account

    #Workspaces
    workspaces = []
    workspaces << alice_public_workspace = alice.owned_workspaces.create!(:name => "Alice Public", :summary => 'BobSearch can see I guess')
    workspaces << alice_private_workspace = alice.owned_workspaces.create!(:name => "Alice Private", :summary => "Not for bobsearch, ha ha", :public => false)
    workspaces << alice_archived_workspace = alice.owned_workspaces.create!({:name => "Archived", :archived_at => '2010-01-01', :archiver => alice}, :without_protection => true)
    workspaces << bob_public_workspace = bob.owned_workspaces.create!({:name => "Bob Public", :summary => "BobSearch", :sandbox => bob_schema}, :without_protection => true)
    workspaces << bob_private_workspace = bob.owned_workspaces.create!(:name => "Bob Private", :summary => "BobSearch", :public => false)
    workspaces.each do |workspace|
      workspace.members << carly
    end

    # Workspace / Dataset associations
    bob_public_workspace.bound_datasets << bobs_table

    fbuilder.name :bob_creates_public_workspace, Events::PUBLIC_WORKSPACE_CREATED.by(bob).add(:workspace => bob_public_workspace, :actor => bob)
    fbuilder.name :bob_creates_private_workspace, Events::PRIVATE_WORKSPACE_CREATED.by(bob).add(:workspace => bob_private_workspace, :actor => bob)

    fbuilder.name :bob_makes_workspace_public, Events::WORKSPACE_MAKE_PUBLIC.by(bob).add(:workspace => bob_public_workspace, :actor => bob)
    fbuilder.name :bob_makes_workspace_private, Events::WORKSPACE_MAKE_PRIVATE.by(bob).add(:workspace => bob_private_workspace, :actor => bob)

    #HDFS File References
    hdfs_file_reference = HdfsFileReference.create!({ :hadoop_instance_id => hadoop_instance.id, :path => '/foo/bar/baz.sql'}, :without_protection => true)

    #Workfiles
    File.open(Rails.root.join('spec', 'fixtures', 'workfile.sql')) do |file|
      alice_private = Workfile.create!({:file_name => "Alice Private", :description => "BobSearch", :owner => alice, :workspace => alice_private_workspace}, :without_protection => true)
      alice_public = Workfile.create!({:file_name => "Alice Public", :description => "AliceSearch", :owner => alice, :workspace => alice_public_workspace}, :without_protection => true)
      bob_private = Workfile.create!({:file_name => "Bob Private", :description => "BobSearch", :owner => bob, :workspace => bob_private_workspace}, :without_protection => true)
      bob_public = Workfile.create!({:file_name => "Bob Public", :description => "BobSearch", :owner => bob, :workspace => bob_public_workspace}, :without_protection => true)

      WorkfileVersion.create!({:workfile => alice_private, :version_num => "1", :owner => alice, :modifier => alice, :contents => file}, :without_protection => true)
      WorkfileVersion.create!({:workfile => alice_public, :version_num => "1", :owner => alice, :modifier => alice, :contents => file}, :without_protection => true)
      WorkfileVersion.create!({:workfile => bob_private, :version_num => "1", :owner => bob, :modifier => bob, :contents => file}, :without_protection => true)
      WorkfileVersion.create!({:workfile => bob_public, :version_num => "1", :owner => bob, :modifier => bob, :contents => file}, :without_protection => true)

      fbuilder.name :alice_creates_private_workfile, Events::WORKFILE_CREATED.by(alice).add(:workfile => alice_private, :workspace => alice_private_workspace)
      fbuilder.name :bob_creates_public_workfile, Events::WORKFILE_CREATED.by(bob).add(:workfile => bob_public, :workspace => bob_public_workspace)
      fbuilder.name :bob_creates_private_workfile, Events::WORKFILE_CREATED.by(bob).add(:workfile => bob_private, :workspace => bob_private_workspace)
      fbuilder.name :alice_creates_public_workfile, Events::WORKFILE_CREATED.by(alice).add(:workfile => alice_public, :workspace => alice_public_workspace)

      fbuilder.name :note_on_bob_public_workfile, Events::NOTE_ON_WORKFILE.by(bob).add(:workspace => bob_public_workspace, :workfile => bob_public, :body => 'notesearch forever')
      fbuilder.name :note_on_alice_private_workfile, Events::NOTE_ON_WORKFILE.by(alice).add(:workspace => alice_private_workspace, :workfile => alice_private, :body => 'notesearch never')
    end

    #CSV File
    csv_file = CsvFile.new({:user => carly, :workspace => bob_public_workspace, :column_names => [:id], :types => [:integer], :delimiter => ',', :file_contains_header => true, :to_table => 'bobs_table', :new_table => true, :contents_file_name => 'import.csv'}, :without_protection => true)
    csv_file.save!(:validate => false)

    #Notes
    note_on_greenplum = Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => greenplum_instance, :actor => bob, :body => 'i am a comment with greenplumsearch in me', :created_at => '2010-01-01 02:00'}, :without_protection => true)
    fbuilder.name :note_on_greenplum, note_on_greenplum
    Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => greenplum_instance, :actor => bob, :body => 'i love bobsearch', :created_at => '2010-01-01 02:01'}, :without_protection => true)
    Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => purplebanana_instance, :actor => bob, :body => 'is this a greenplumsearch instance?', :created_at => '2010-01-01 02:02'}, :without_protection => true)
    Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => purplebanana_instance, :actor => bob, :body => 'no, not greenplumsearch', :created_at => '2010-01-01 02:03'}, :without_protection => true)
    Events::NOTE_ON_GREENPLUM_INSTANCE.create!({:greenplum_instance => purplebanana_instance, :actor => bob, :body => 'really really?', :created_at => '2010-01-01 02:04'}, :without_protection => true)
    Events::NOTE_ON_HADOOP_INSTANCE.by(bob).add(:hadoop_instance => hadoop_instance, :body => 'hadoop-idy-doop')
    Events::NOTE_ON_HDFS_FILE.by(bob).add(:hdfs_file => hdfs_file_reference, :body => 'hhhhhhaaaadooooopppp')
    Events::NOTE_ON_WORKSPACE.by(bob).add(:workspace => bob_public_workspace, :body => 'Come see my awesome workspace!')
    Events::NOTE_ON_DATASET.by(bob).add(:dataset => bobs_table, :body => 'Note on dataset')
    Events::NOTE_ON_WORKSPACE_DATASET.by(bob).add(:dataset => bobs_table, :workspace => bob_public_workspace, :body => 'Note on workspace dataset')
    Events::FILE_IMPORT_SUCCESS.by(carly).add(:dataset => bobs_table, :workspace => bob_public_workspace)
    fbuilder.name :note_on_dataset, Events::NOTE_ON_DATASET.by(bob).add(:dataset => bobssearch_table, :body => 'notesearch ftw')
    fbuilder.name :note_on_workspace_dataset, Events::NOTE_ON_WORKSPACE_DATASET.by(bob).add(:dataset => bobssearch_table, :workspace => bob_public_workspace, :body => 'workspacedatasetnotesearch')
    fbuilder.name :note_on_bob_public, Events::NOTE_ON_WORKSPACE.by(bob).add(:workspace => bob_public_workspace, :body => 'notesearch forever')
    fbuilder.name :note_on_alice_private, Events::NOTE_ON_WORKSPACE.by(alice).add(:workspace => alice_private_workspace, :body => 'notesearch never')

    #Events
    Events::GREENPLUM_INSTANCE_CHANGED_OWNER.by(admin).add(:greenplum_instance => greenplum_instance, :new_owner => alice)
    Events::GREENPLUM_INSTANCE_CHANGED_NAME.by(admin).add(:greenplum_instance => greenplum_instance, :old_name => 'mahna_mahna', :new_name => greenplum_instance.name)
    Events::HADOOP_INSTANCE_CHANGED_NAME.by(admin).add(:hadoop_instance => hadoop_instance, :old_name => 'Slartibartfast', :new_name => hadoop_instance.name)
    Events::SOURCE_TABLE_CREATED.by(admin).add(:dataset => bobs_table, :workspace => bob_public_workspace)
    Events::WORKSPACE_ADD_SANDBOX.by(bob).add(:sandbox_schema => bob_schema, :workspace => bob_public_workspace)
    Events::WORKSPACE_ARCHIVED.by(admin).add(:workspace => bob_public_workspace)
    Events::WORKSPACE_UNARCHIVED.by(admin).add(:workspace => bob_public_workspace)
    Events::WORKSPACE_ADD_HDFS_AS_EXT_TABLE.by(bob).add(:workspace => bob_public_workspace, :dataset => bobs_table, :hdfs_file => hdfs_file_reference)
    Events::FILE_IMPORT_SUCCESS.by(bob).add(:workspace => bob_public_workspace, :dataset => bobs_table, :file_name => 'import.csv', :import_type => 'file')
    Events::FILE_IMPORT_FAILED.by(bob).add(:workspace => bob_public_workspace, :file_name => 'import.csv', :import_type => 'file', :destination_table => 'my_table', :error_message => "oh no's! everything is broken!")
    Events::MEMBERS_ADDED.by(bob).add(:workspace => bob_public_workspace, :member => carly, :num_added => '5')
    Events::DATASET_IMPORT_SUCCESS.by(bob).add(:workspace => bob_public_workspace, :dataset => other_table, :source_dataset => other_table)
    Events::DATASET_IMPORT_FAILED.by(bob).add(:workspace => bob_public_workspace, :source_dataset => other_table, :destination_table => 'my_table', :error_message => "oh no's! everything is broken!")

    Sunspot.session = Sunspot.session.original_session if Sunspot.session.is_a? SunspotMatchers::SunspotSessionSpy

    #NotesAttachment
    File.open(Rails.root.join('spec', 'fixtures', 'workfile.sql')) do |file|
      note_on_greenplum.attachments.create!(:contents => file)
    end
  end
end
