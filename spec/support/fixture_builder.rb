require_relative "./database_integration/setup_gpdb"

def FixtureBuilder.password
  'password'
end

FixtureBuilder.configure do |fbuilder|
  # rebuild fixtures automatically when these files change:
  fbuilder.files_to_check += Dir["spec/support/fixture_builder.rb", "db/structure.sql", "spec/support/database_integration/setup_gpdb.sql"]

  fbuilder.name_model_with(Workfile) do |record|
    record['file_name'].gsub(/\s+/, '_').downcase
  end

  # now declare objects
  fbuilder.factory do
    Sunspot.session = SunspotMatchers::SunspotSessionSpy.new(Sunspot.session)

    (ActiveRecord::Base.direct_descendants).each do |klass|
      ActiveRecord::Base.connection.execute("ALTER SEQUENCE #{klass.table_name}_id_seq RESTART WITH 1000000;")
    end

    #Users
    admin = User.create!({:first_name => 'Admin', :last_name => 'AlphaSearch', :username => 'admin', :email => 'admin@example.com', :password => FixtureBuilder.password, :admin => true}, :without_protection => true)
    evil_admin = User.create!({:first_name => 'Evil', :last_name => 'AlphaSearch', :username => 'evil_admin', :email => 'evil_admin@example.com', :password => FixtureBuilder.password, :admin => true}, :without_protection => true)
    Events::UserAdded.by(admin).add(:new_user => evil_admin)

    no_collaborators = User.create!(:first_name => 'Alice', :last_name => 'Alpha', :username => 'no_collaborators', :email => 'alice@example.com', :password => FixtureBuilder.password)
    Events::UserAdded.by(admin).add(:new_user => no_collaborators)

    owner = User.create!(:first_name => 'searchquery', :last_name => 'Brockovich', :username => 'owner', :email => 'bob@example.com', :password => FixtureBuilder.password)
    owner.image = Rack::Test::UploadedFile.new(Rails.root.join('spec', 'fixtures', 'User.png'), "image/png")
    owner.save!

    fbuilder.name :admin_creates_owner, Events::UserAdded.by(admin).add(:new_user => owner)

    the_collaborator = User.create!(:first_name => 'Carly', :last_name => 'Carlson', :username => 'the_collaborator', :email => 'carly@example.com', :password => FixtureBuilder.password)
    Events::UserAdded.by(admin).add(:new_user => the_collaborator)

    not_a_member = User.create!(:first_name => 'Alone', :last_name => 'NoMember', :username => 'not_a_member', :email => 'alone@example.com', :password => FixtureBuilder.password)
    Events::UserAdded.by(admin).add(:new_user => not_a_member)

    user_with_restricted_access = User.create!(:first_name => 'Restricted', :last_name => 'User', :username => 'restricted_user', :email => 'restricted@example.com', :password => FixtureBuilder.password)
    Events::UserAdded.by(user_with_restricted_access).add(:new_user => user_with_restricted_access)

    #Instances
    greenplum_instance = GpdbInstance.create!({ :name => "Greenplum", :description => "Just for searchquery and greenplumsearch", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => admin }, :without_protection => true)
    Events::GreenplumInstanceCreated.by(admin).add(:greenplum_instance => greenplum_instance)

    aurora_instance = GpdbInstance.create!({ :name => "Aurora", :description => "Provisioned", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => admin, :provision_type => "create" }, :without_protection => true)
    Events::GreenplumInstanceCreated.by(admin).add(:greenplum_instance => aurora_instance)
    Events::ProvisioningSuccess.by(admin).add(:greenplum_instance => aurora_instance)
    Events::ProvisioningFail.by(admin).add(:greenplum_instance => aurora_instance, :error_message => "could not provision")

    shared_instance = GpdbInstance.create!({ :name => "Shared", :description => "A nice instance in FactoryBuilder", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => admin, :shared => true }, :without_protection => true)
    owners_instance = GpdbInstance.create!({ :name => "Owners", :description => "Bob-like", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => owner, :shared => false}, :without_protection => true)
    fbuilder.name :owner_creates_greenplum_instance, Events::GreenplumInstanceCreated.by(owner).add(:greenplum_instance => owners_instance)

    hadoop_instance = HadoopInstance.create!({ :name => "Hadoop", :description => "searchquery for the hadoop instance", :host => "hadoop.example.com", :port => "1111", :owner => admin}, :without_protection => true)
    Events::HadoopInstanceCreated.by(admin).add(:greenplum_instance => greenplum_instance)

    HdfsEntry.create!({:path => "/searchquery/result.txt", :size => 10, :is_directory => false, :modified_at => "2010-10-20 22:00:00", :content_count => 4, :hadoop_instance => hadoop_instance}, :without_protection => true)

    chorus_gpdb40_instance = GpdbInstance.create!(GpdbIntegration.instance_config_for_gpdb("chorus-gpdb40").merge({:name => "chorus_gpdb40", :owner => admin}), :without_protection => true)
    chorus_gpdb41_instance = GpdbInstance.create!(GpdbIntegration.instance_config_for_gpdb("chorus-gpdb41").merge({:name => "chorus_gpdb41", :owner => admin}), :without_protection => true)
    chorus_gpdb42_instance = GpdbInstance.create!(GpdbIntegration.instance_config_for_gpdb("chorus-gpdb42").merge({:name => "chorus_gpdb42", :owner => admin}), :without_protection => true)

    # Instance Accounts
    shared_instance_account = InstanceAccount.create!({:owner => admin, :gpdb_instance => shared_instance, :db_username => 'admin', :db_password => '12345'}, :without_protection => true)
    fbuilder.name(:shared_instance_account, shared_instance_account)
    fbuilder.name(:unauthorized, InstanceAccount.create!({:owner => the_collaborator, :gpdb_instance => owners_instance, :db_username => "thisisafakeaccount", :db_password => "whichdoesntexist"}, :without_protection => true))
    owner_instance_account = InstanceAccount.create!({:owner => owner, :gpdb_instance => owners_instance, :db_username => 'owner', :db_password => 'i <3 me'}, :without_protection => true)
    fbuilder.name(:aurora, InstanceAccount.create!({:owner => admin, :gpdb_instance => aurora_instance, :db_username => 'edcadmin', :db_password => 'secret'}, :without_protection => true))

    fbuilder.name(:chorus_gpdb40_test_superuser, InstanceAccount.create!(GpdbIntegration.account_config_for_gpdb("chorus-gpdb40").merge({:owner => admin, :gpdb_instance => chorus_gpdb40_instance}), :without_protection => true))
    fbuilder.name(:chorus_gpdb41_test_superuser, InstanceAccount.create!(GpdbIntegration.account_config_for_gpdb("chorus-gpdb41").merge({:owner => admin, :gpdb_instance => chorus_gpdb41_instance}), :without_protection => true))
    chorus_gpdb42_instance_account = InstanceAccount.create!(GpdbIntegration.account_config_for_gpdb("chorus-gpdb42").merge({:owner => admin, :gpdb_instance => chorus_gpdb42_instance}), :without_protection => true)
    fbuilder.name(:chorus_gpdb42_test_superuser, chorus_gpdb42_instance_account)

    InstanceAccount.create!({:db_username => 'user_with_restricted_access', :db_password => 'secret', :owner => user_with_restricted_access, :gpdb_instance => chorus_gpdb40_instance}, :without_protection => true)
    InstanceAccount.create!({:db_username => 'user_with_restricted_access', :db_password => 'secret', :owner => user_with_restricted_access, :gpdb_instance => chorus_gpdb41_instance}, :without_protection => true)
    InstanceAccount.create!({:db_username => 'user_with_restricted_access', :db_password => 'secret', :owner => user_with_restricted_access, :gpdb_instance => chorus_gpdb42_instance}, :without_protection => true)

    # Datasets
    default_database = GpdbDatabase.create!({ :gpdb_instance => owners_instance, :name => 'default' }, :without_protection => true)
    default_schema = GpdbSchema.create!({ :name => 'default', :database => default_database }, :without_protection => true)
    GpdbSchema.create!({ :name => "public", :database => default_database }, :without_protection => true)
    default_table = GpdbTable.create!({ :name => "table", :schema => default_schema }, :without_protection => true)
    fbuilder.name :table, default_table
    GpdbView.create!({ :name => "view", :schema => default_schema }, :without_protection => true)

    searchquery_database = GpdbDatabase.create!({ :gpdb_instance => owners_instance, :name => 'searchquery_database' }, :without_protection => true)
    searchquery_schema = GpdbSchema.create!({ :name => "searchquery_schema", :database => searchquery_database }, :without_protection => true)
    searchquery_table = GpdbTable.create!({ :name => "searchquery_table", :schema => searchquery_schema }, :without_protection => true)
    searchquery_chorus_view = ChorusView.new({:name => "searchquery_chorus_view", :schema => searchquery_schema, :query => "select searchquery from a_table"}, :without_protection => true)
    searchquery_chorus_view.save!(:validate => false)

    shared_search_database = GpdbDatabase.create!({ :gpdb_instance => shared_instance, :name => 'shared_database' }, :without_protection => true)
    shared_search_schema = GpdbSchema.create!({ :name => 'shared_schema', :database => shared_search_database }, :without_protection => true)
    GpdbTable.create!({ :name => "searchquery_shared_table", :schema => shared_search_schema }, :without_protection => true)

    other_schema = GpdbSchema.create!({ :name => "other_schema", :database => default_database}, :without_protection => true)
    other_table = GpdbTable.create!({ :name => "other_table", :schema => other_schema }, :without_protection => true)
    GpdbView.create!({ :name => "other_view", :schema => other_schema }, :without_protection => true)

    # Database Instance Accounts
    searchquery_database.instance_accounts << owner_instance_account
    shared_search_database.instance_accounts << shared_instance_account

    #Workspaces
    workspaces = []
    workspaces << no_collaborators_public_workspace = no_collaborators.owned_workspaces.create!(:name => "Public with no collaborators", :summary => 'searchquery can see I guess')
    workspaces << no_collaborators_private_workspace = no_collaborators.owned_workspaces.create!(:name => "Private with no collaborators", :summary => "Not for searchquery, ha ha", :public => false)
    workspaces << no_collaborators_archived_workspace = no_collaborators.owned_workspaces.create!({:name => "Archived", :sandbox => other_schema, :archived_at => '2010-01-01', :archiver => no_collaborators}, :without_protection => true)
    workspaces << public_workspace = owner.owned_workspaces.create!({:name => "Public", :summary => "searchquery", :sandbox => default_schema}, :without_protection => true)
    workspaces << private_workspace = owner.owned_workspaces.create!(:name => "Private", :summary => "searchquery", :public => false)

    fbuilder.name :public, public_workspace
    fbuilder.name :private, private_workspace
    workspaces << api_workspace = admin.owned_workspaces.create!({:name => "Api", :summary => "APIs Are Cool"}, :without_protection => true)
    api_workspace.image = Rack::Test::UploadedFile.new(Rails.root.join('spec', 'fixtures', 'Workspace.jpg'), "image/jpg")
    api_workspace.save!
    workspaces.each do |workspace|
      workspace.members << the_collaborator
    end

    # Workspace / Dataset associations
    public_workspace.bound_datasets << default_table

    fbuilder.name :owner_creates_public_workspace, Events::PublicWorkspaceCreated.by(owner).add(:workspace => public_workspace, :actor => owner)
    fbuilder.name :owner_creates_private_workspace, Events::PrivateWorkspaceCreated.by(owner).add(:workspace => private_workspace, :actor => owner)

    Events::WorkspaceMakePublic.by(owner).add(:workspace => public_workspace, :actor => owner)
    Events::WorkspaceMakePrivate.by(owner).add(:workspace => private_workspace, :actor => owner)

    # Chorus View
    chorus_view = ChorusView.new({:name => "chorus_view", :schema => default_schema, :query => "select * from a_table"}, :without_protection => true)
    chorus_view.bound_workspaces << public_workspace
    chorus_view.save!(:validate => false)

    #HDFS Entry
    hdfs_entry = hadoop_instance.hdfs_entries.create!({:path => '/foo/bar/baz.sql', :is_directory => false, :modified_at => "2010-10-22 22:00:00"}, :without_protection => true)
    fbuilder.name :hdfs_file, hdfs_entry

    #Workfiles
    File.open(Rails.root.join('spec', 'fixtures', 'workfile.sql')) do |file|
      no_collaborators_private = Workfile.create!({:file_name => "no collaborators Private", :description => "searchquery", :owner => no_collaborators, :workspace => no_collaborators_private_workspace}, :without_protection => true)
      no_collaborators_public = Workfile.create!({:file_name => "no collaborators Public", :description => "No Collaborators Search", :owner => no_collaborators, :workspace => no_collaborators_public_workspace}, :without_protection => true)
      private_workfile = Workfile.create!({:file_name => "Private", :description => "searchquery", :owner => owner, :workspace => private_workspace, :execution_schema => default_schema}, :without_protection => true)
      public_workfile = Workfile.create!({:file_name => "Public", :description => "searchquery", :owner => owner, :workspace => public_workspace}, :without_protection => true)

      archived_workfile = Workfile.create!({:file_name => "archived", :owner => no_collaborators, :workspace => no_collaborators_archived_workspace}, :without_protection => true)

      sql_workfile = Workfile.create!({:file_name => "sql.sql", :owner => owner, :workspace => public_workspace}, :without_protection => true)
      fbuilder.name :sql, sql_workfile

      no_collaborators_workfile_version = WorkfileVersion.create!({:workfile => no_collaborators_private, :version_num => "1", :owner => no_collaborators, :modifier => no_collaborators, :contents => file}, :without_protection => true)
      WorkfileVersion.create!({:workfile => no_collaborators_public, :version_num => "1", :owner => no_collaborators, :modifier => no_collaborators, :contents => file}, :without_protection => true)
      WorkfileVersion.create!({:workfile => private_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file}, :without_protection => true)
      WorkfileVersion.create!({:workfile => public_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file}, :without_protection => true)
      WorkfileVersion.create!({:workfile => sql_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file}, :without_protection => true)
      WorkfileVersion.create!({:workfile => archived_workfile, :version_num => "1", :owner => no_collaborators, :modifier => no_collaborators, :contents => file}, :without_protection => true)

      fbuilder.name :no_collaborators_creates_private_workfile, Events::WorkfileCreated.by(no_collaborators).add(:workfile => no_collaborators_private, :workspace => no_collaborators_private_workspace)
      fbuilder.name :public_workfile_created, Events::WorkfileCreated.by(owner).add(:workfile => public_workfile, :workspace => public_workspace)
      fbuilder.name :private_workfile_created, Events::WorkfileCreated.by(owner).add(:workfile => private_workfile, :workspace => private_workspace)
      Events::WorkfileCreated.by(no_collaborators).add(:workfile => no_collaborators_public, :workspace => no_collaborators_public_workspace)

      fbuilder.name :note_on_public_workfile, Events::NoteOnWorkfile.by(owner).add(:workspace => public_workspace, :workfile => public_workfile, :body => 'notesearch forever')
      fbuilder.name :note_on_no_collaborators_private_workfile, Events::NoteOnWorkfile.by(no_collaborators).add(:workspace => no_collaborators_private_workspace, :workfile => no_collaborators_private, :body => 'notesearch never')
      Events::WorkfileUpgradedVersion.by(no_collaborators).add(:workspace => no_collaborators_private_workspace, :workfile => no_collaborators_private, :commit_message => 'commit message', :version_id => no_collaborators_workfile_version.id.to_s, :version_num => "1")

      Events::ChorusViewCreated.by(owner).add(:dataset => chorus_view, :workspace => public_workspace, :source_object => public_workfile)
      Events::ChorusViewChanged.by(owner).add(:dataset => chorus_view, :workspace => public_workspace)
    end

    text_workfile = Workfile.create!({:file_name => "text.txt", :owner => owner, :workspace => public_workspace}, :without_protection => true)
    image_workfile = Workfile.create!({:file_name => "image.png", :owner => owner, :workspace => public_workspace}, :without_protection => true)
    binary_workfile = Workfile.create!({:file_name => "binary.tar.gz", :owner => owner, :workspace => public_workspace}, :without_protection => true)

    File.open Rails.root + 'spec/fixtures/some.txt' do |file|
      WorkfileVersion.create!({:workfile => text_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file}, :without_protection => true)
    end
    File.open Rails.root + 'spec/fixtures/small1.gif' do |file|
      WorkfileVersion.create!({:workfile => image_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file}, :without_protection => true)
    end
    File.open Rails.root + 'spec/fixtures/binary.tar.gz' do |file|
      WorkfileVersion.create!({:workfile => binary_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file}, :without_protection => true)
    end

    fbuilder.name :default, ImportSchedule.create!({:start_datetime => '2012-09-04 23:00:00-07', :end_date => '2012-12-04', :frequency => 'weekly', :workspace_id => public_workspace.id, :to_table => "new_table_for_import", :source_dataset_id => default_table.id, :truncate => 't', :new_table => 't', :user_id => owner.id} , :without_protection => true)

    #CSV File
    csv_file = CsvFile.new({:user => the_collaborator, :workspace => public_workspace, :column_names => [:id], :types => [:integer], :delimiter => ',', :file_contains_header => true, :to_table => 'table', :new_table => true, :contents_file_name => 'import.csv'}, :without_protection => true)
    csv_file.save!(:validate => false)

    #Notes
    note_on_greenplum = Events::NoteOnGreenplumInstance.create!({:greenplum_instance => greenplum_instance, :actor => owner, :body => 'i am a comment with greenplumsearch in me', :created_at => '2010-01-01 02:00'}, :without_protection => true)
    fbuilder.name :note_on_greenplum, note_on_greenplum
    Events::NoteOnGreenplumInstance.create!({:greenplum_instance => greenplum_instance, :actor => owner, :body => 'i love searchquery', :created_at => '2010-01-01 02:01'}, :without_protection => true)
    Events::NoteOnGreenplumInstance.create!({:greenplum_instance => shared_instance, :actor => owner, :body => 'is this a greenplumsearch instance?', :created_at => '2010-01-01 02:02'}, :without_protection => true)
    Events::NoteOnGreenplumInstance.create!({:greenplum_instance => shared_instance, :actor => owner, :body => 'no, not greenplumsearch', :created_at => '2010-01-01 02:03'}, :without_protection => true)
    Events::NoteOnGreenplumInstance.create!({:greenplum_instance => shared_instance, :actor => owner, :body => 'really really?', :created_at => '2010-01-01 02:04'}, :without_protection => true)
    Events::NoteOnHadoopInstance.by(owner).add(:hadoop_instance => hadoop_instance, :body => 'hadoop-idy-doop')
    Events::NoteOnHdfsFile.by(owner).add(:hdfs_file => hdfs_entry, :body => 'hhhhhhaaaadooooopppp')
    Events::NoteOnWorkspace.by(owner).add(:workspace => public_workspace, :body => 'Come see my awesome workspace!')
    Events::NoteOnDataset.by(owner).add(:dataset => default_table, :body => 'Note on dataset')
    Events::NoteOnWorkspaceDataset.by(owner).add(:dataset => default_table, :workspace => public_workspace, :body => 'Note on workspace dataset')
    Events::FileImportSuccess.by(the_collaborator).add(:dataset => default_table, :workspace => public_workspace)
    fbuilder.name :note_on_dataset, Events::NoteOnDataset.by(owner).add(:dataset => searchquery_table, :body => 'notesearch ftw')
    fbuilder.name :note_on_workspace_dataset, Events::NoteOnWorkspaceDataset.by(owner).add(:dataset => searchquery_table, :workspace => public_workspace, :body => 'workspacedatasetnotesearch')
    fbuilder.name :note_on_public_workspace, Events::NoteOnWorkspace.by(owner).add(:workspace => public_workspace, :body => 'notesearch forever')
    note_on_no_collaborators_private = Events::NoteOnWorkspace.by(no_collaborators).add(:workspace => no_collaborators_private_workspace, :body => 'notesearch never')
    fbuilder.name :note_on_no_collaborators_private, note_on_no_collaborators_private

    #Comments
    comment_on_note_on_greenplum = Comment.create!({:text => "Comment on Note on Greenplum", :event_id => note_on_greenplum.id, :author_id => owner.id})             
    fbuilder.name :comment_on_note_on_greenplum, comment_on_note_on_greenplum
    
    fbuilder.name :second_comment_on_note_on_greenplum,
                  Comment.create!({:text => "2nd Comment on Note on Greenplum", :event_id => note_on_greenplum.id, :author_id => owner.id})
    fbuilder.name :comment_on_note_on_no_collaborators_private,
                  Comment.create!({:text => "Comment on no collaborators private", :event_id => note_on_no_collaborators_private.id, :author_id => no_collaborators.id})

    #Events
    Timecop.travel(-1.day)
    Events::GreenplumInstanceChangedOwner.by(admin).add(:greenplum_instance => greenplum_instance, :new_owner => no_collaborators)
    Events::GreenplumInstanceChangedName.by(admin).add(:greenplum_instance => greenplum_instance, :old_name => 'mahna_mahna', :new_name => greenplum_instance.name)
    Events::HadoopInstanceChangedName.by(admin).add(:hadoop_instance => hadoop_instance, :old_name => 'Slartibartfast', :new_name => hadoop_instance.name)
    Events::SourceTableCreated.by(admin).add(:dataset => default_table, :workspace => public_workspace)
    Events::WorkspaceAddSandbox.by(owner).add(:sandbox_schema => default_schema, :workspace => public_workspace)
    Events::WorkspaceArchived.by(admin).add(:workspace => public_workspace)
    Events::WorkspaceUnarchived.by(admin).add(:workspace => public_workspace)
    Events::WorkspaceAddHdfsAsExtTable.by(owner).add(:workspace => public_workspace, :dataset => default_table, :hdfs_file => hdfs_entry)
    Events::FileImportCreated.by(owner).add(:workspace => public_workspace, :dataset => nil, :file_name => 'import.csv', :import_type => 'file', :destination_table => 'table')
    Events::FileImportSuccess.by(owner).add(:workspace => public_workspace, :dataset => default_table, :file_name => 'import.csv', :import_type => 'file')
    Events::FileImportFailed.by(owner).add(:workspace => public_workspace, :file_name => 'import.csv', :import_type => 'file', :destination_table => 'my_table', :error_message => "oh no's! everything is broken!")
    Events::MembersAdded.by(owner).add(:workspace => public_workspace, :member => the_collaborator, :num_added => '5')
    Events::DatasetImportCreated.by(owner).add(:workspace => public_workspace, :dataset => nil, :source_dataset => default_table, :destination_table => 'other_table')
    Events::DatasetImportSuccess.by(owner).add(:workspace => public_workspace, :dataset => other_table, :source_dataset => default_table)
    Events::DatasetImportFailed.by(owner).add(:workspace => public_workspace, :source_dataset => default_table, :destination_table => 'other_table', :error_message => "oh no's! everything is broken!")
    Events::ChorusViewCreated.by(owner).add(:dataset => chorus_view, :workspace => public_workspace, :source_object => default_table)
    Timecop.return

    #NotesAttachment
    fbuilder.name(:sql, note_on_greenplum.attachments.create!(:contents => File.new(Rails.root.join('spec', 'fixtures', 'workfile.sql'))))
    fbuilder.name(:image, note_on_greenplum.attachments.create!(:contents => File.new(Rails.root.join('spec', 'fixtures', 'User.png'))))

    GpdbIntegration.refresh_chorus
    chorus_gpdb42_instance.refresh_databases
    GpdbSchema.refresh(chorus_gpdb42_instance_account, chorus_gpdb42_instance.databases.find_by_name("ChorusAnalytics"))

    Sunspot.session = Sunspot.session.original_session if Sunspot.session.is_a? SunspotMatchers::SunspotSessionSpy

    #Notification
    notes = Events::NoteOnGreenplumInstance.by(owner)
    fbuilder.name(:notification1, Notification.create!({:recipient => owner, :notification_event => notes[0], :comment => comment_on_note_on_greenplum}, :without_protection => true) )
    fbuilder.name(:notification2, Notification.create!({:recipient => owner, :notification_event => notes[1]}, :without_protection => true) )
    fbuilder.name(:notification3, Notification.create!({:recipient => owner, :notification_event => notes[2]}, :without_protection => true) )
    fbuilder.name(:notification4, Notification.create!({:recipient => owner, :notification_event => notes[3]}, :without_protection => true) )
  end
end
