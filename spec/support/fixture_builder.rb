require_relative "./database_integration/setup_gpdb"

def FixtureBuilder.password
  'password'
end

FixtureBuilder.configure do |fbuilder|
  # rebuild fixtures automatically when these files change:
  fbuilder.files_to_check += Dir["spec/support/fixture_builder.rb", "db/structure.sql", "spec/support/database_integration/setup_gpdb.sql", "tmp/GPDB_HOST_STALE"]

  fbuilder.name_model_with(Workfile) do |record|
    record['file_name'].gsub(/\s+/, '_').downcase
  end
  fbuilder.name_model_with(User) do |record|
    record['username'].downcase
  end

  fbuilder.fixture_builder_file = Rails.root + "tmp/fixture_builder_#{GpdbIntegration::REAL_GPDB_HOST}_#{Rails.env}.yml"

  # now declare objects
  fbuilder.factory do
    Sunspot.session = SunspotMatchers::SunspotSessionSpy.new(Sunspot.session)

    (ActiveRecord::Base.direct_descendants).each do |klass|
      ActiveRecord::Base.connection.execute("ALTER SEQUENCE #{klass.table_name}_id_seq RESTART WITH 1000000;")
    end

    #Users
    admin = FactoryGirl.create(:admin, {:last_name => 'AlphaSearch', :username => 'admin'})
    evil_admin = FactoryGirl.create(:admin, {:last_name => 'AlphaSearch', :username => 'evil_admin'})
    Events::UserAdded.by(admin).add(:new_user => evil_admin)

    FactoryGirl.create(:user, :username => 'default')

    no_collaborators = FactoryGirl.create(:user, :username => 'no_collaborators')
    Events::UserAdded.by(admin).add(:new_user => no_collaborators)

    FactoryGirl.create(:user, :first_name => 'no_picture', :username => 'no_picture')
    with_picture = FactoryGirl.create(:user, :first_name => 'with_picture', :username => 'with_picture')
    with_picture.image = Rack::Test::UploadedFile.new(Rails.root.join('spec', 'fixtures', 'User.png'), "image/png")
    with_picture.save!

    owner = FactoryGirl.create(:user, :first_name => 'searchquery', :username => 'owner')
    owner.image = Rack::Test::UploadedFile.new(Rails.root.join('spec', 'fixtures', 'User.png'), "image/png")
    owner.save!

    @admin_creates_owner = Events::UserAdded.by(admin).add(:new_user => owner)

    the_collaborator = FactoryGirl.create(:user, :username => 'the_collaborator')
    Events::UserAdded.by(admin).add(:new_user => the_collaborator)

    not_a_member = FactoryGirl.create(:user, :username => 'not_a_member')
    Events::UserAdded.by(admin).add(:new_user => not_a_member)

    user_with_restricted_access = FactoryGirl.create(:user, :username => 'restricted_user')
    Events::UserAdded.by(user_with_restricted_access).add(:new_user => user_with_restricted_access)

    #Instances
    greenplum_instance = FactoryGirl.create(:gpdb_instance, :name => "searchquery", :description => "Just for searchquery and greenplumsearch", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => admin)
    fbuilder.name :default, greenplum_instance
    Events::GreenplumInstanceCreated.by(admin).add(:greenplum_instance => greenplum_instance)

    aurora_instance = FactoryGirl.create(:gpdb_instance, :name => "Aurora", :description => "Provisioned", :host => "non.legit.example.com", :port => "5432", :maintenance_db => "postgres", :owner => admin, :provision_type => "create")
    Events::GreenplumInstanceCreated.by(admin).add(:greenplum_instance => aurora_instance)
    Events::ProvisioningSuccess.by(admin).add(:greenplum_instance => aurora_instance)
    Events::ProvisioningFail.by(admin).add(:greenplum_instance => aurora_instance, :error_message => "could not provision")

    shared_instance = FactoryGirl.create(:gpdb_instance, :name => "Shared", :owner => admin, :shared => true)
    owners_instance = FactoryGirl.create(:gpdb_instance, :name => "Owners", :owner => owner, :shared => false)

    FactoryGirl.create(:gpdb_instance, :name => "Offline", :owner => owner, :state => "offline")
    provisioning = FactoryGirl.create(:gpdb_instance, :name => "Provisioning", :owner => owner, :state => "provisioning")

    @owner_creates_greenplum_instance = Events::GreenplumInstanceCreated.by(owner).add(:greenplum_instance => owners_instance)

    hadoop_instance = HadoopInstance.create!({ :name => "searchquery", :description => "searchquery for the hadoop instance", :host => "hadoop.example.com", :port => "1111", :owner => admin}, :without_protection => true)
    fbuilder.name :hadoop, hadoop_instance
    Events::HadoopInstanceCreated.by(admin).add(:greenplum_instance => greenplum_instance)

    HdfsEntry.create!({:path => "/searchquery/result.txt", :size => 10, :is_directory => false, :modified_at => "2010-10-20 22:00:00", :content_count => 4, :hadoop_instance => hadoop_instance}, :without_protection => true)


    chorus_gpdb40_instance = FactoryGirl.create(:gpdb_instance, GpdbIntegration.instance_config_for_gpdb("chorus-gpdb40").merge(:name => "chorus_gpdb40", :owner => admin))
    chorus_gpdb41_instance = FactoryGirl.create(:gpdb_instance, GpdbIntegration.instance_config_for_gpdb("chorus-gpdb41").merge(:name => "chorus_gpdb41", :owner => admin))
    chorus_gpdb42_instance = FactoryGirl.create(:gpdb_instance, GpdbIntegration.instance_config_for_gpdb(GpdbIntegration::REAL_GPDB_HOST).merge(:name => GpdbIntegration::real_gpdb_hostname, :owner => admin))

    gnip_instance = FactoryGirl.create(:gnip_instance, :owner => owner, :name => "searchquery", :description => "an example gnip account")
    fbuilder.name :default, gnip_instance
    FactoryGirl.create(:gnip_instance, :owner => owner, :name => 'typeahead')
    Events::GnipInstanceCreated.by(admin).add(:gnip_instance => gnip_instance)

    # Instance Accounts
    @shared_instance_account = FactoryGirl.create(:instance_account, :owner => admin, :gpdb_instance => shared_instance)
    @unauthorized = FactoryGirl.create(:instance_account, :owner => the_collaborator, :gpdb_instance => owners_instance)
    owner_instance_account = FactoryGirl.create(:instance_account, :owner => owner, :gpdb_instance => owners_instance)
    @aurora = FactoryGirl.create(:instance_account, :owner => admin, :gpdb_instance => aurora_instance)

    FactoryGirl.create(:instance_account, :owner => owner, :gpdb_instance => provisioning)

    @chorus_gpdb40_test_superuser = FactoryGirl.create(:instance_account, GpdbIntegration.account_config_for_gpdb("chorus-gpdb40").merge(:owner => admin, :gpdb_instance => chorus_gpdb40_instance))
    @chorus_gpdb41_test_superuser = FactoryGirl.create(:instance_account, GpdbIntegration.account_config_for_gpdb("chorus-gpdb41").merge(:owner => admin, :gpdb_instance => chorus_gpdb41_instance))
    @chorus_gpdb42_test_superuser = FactoryGirl.create(:instance_account, GpdbIntegration.account_config_for_gpdb(GpdbIntegration::REAL_GPDB_HOST).merge(:owner => admin, :gpdb_instance => chorus_gpdb42_instance))

    [chorus_gpdb40_instance, chorus_gpdb41_instance, chorus_gpdb42_instance].each do |instance|
      FactoryGirl.create(:instance_account, :owner => user_with_restricted_access, :gpdb_instance => instance)
    end

    # Datasets
    default_database = FactoryGirl.create(:gpdb_database, :gpdb_instance => owners_instance, :name => 'default')
    default_schema = FactoryGirl.create(:gpdb_schema, :name => 'default', :database => default_database)
    FactoryGirl.create(:gpdb_schema, :name => "public", :database => default_database)
    default_table = FactoryGirl.create(:gpdb_table, :name => "table", :schema => default_schema)
    FactoryGirl.create(:gpdb_view, :name => "view", :schema => default_schema)

    other_schema = FactoryGirl.create(:gpdb_schema, :name => "other_schema", :database => default_database)
    other_table = FactoryGirl.create(:gpdb_table, :name => "other_table", :schema => other_schema)
    FactoryGirl.create(:gpdb_view, :name => "other_view", :schema => other_schema)

    source_table = FactoryGirl.create(:gpdb_table, :name => "source_table", :schema => other_schema)
    source_view = FactoryGirl.create(:gpdb_view, :name => "source_view", :schema => other_schema)

    # Search setup
    searchquery_database = FactoryGirl.create(:gpdb_database, :gpdb_instance => owners_instance, :name => 'searchquery_database')
    searchquery_schema = FactoryGirl.create(:gpdb_schema, :name => "searchquery_schema", :database => searchquery_database)
    searchquery_table = FactoryGirl.create(:gpdb_table, :name => "searchquery_table", :schema => searchquery_schema)
    searchquery_chorus_view = FactoryGirl.build(:chorus_view, :name => "searchquery_chorus_view", :schema => searchquery_schema, :query => "select searchquery from a_table")
    searchquery_chorus_view.save!(:validate => false)

    shared_search_database = FactoryGirl.create(:gpdb_database, :gpdb_instance => shared_instance, :name => 'shared_database')
    shared_search_schema = FactoryGirl.create(:gpdb_schema, :name => 'shared_schema', :database => shared_search_database)
    FactoryGirl.create(:gpdb_table, :name => "searchquery_shared_table", :schema => shared_search_schema)

    # type ahead search fixtures
    type_ahead_user = FactoryGirl.create :user, :first_name => 'typeahead', :username => 'typeahead'
    FactoryGirl.create(:gpdb_table, :name => "typeahead", :schema => searchquery_schema)
    typeahead_chorus_view = FactoryGirl.create(:chorus_view, :name => "typeahead_chorus_view", :schema => searchquery_schema)
    fbuilder.name :typeahead_chorus_view, typeahead_chorus_view
    typeahead_workfile = FactoryGirl.create :workfile, :file_name => 'typeahead'#, :owner => type_ahead_user
    File.open(Rails.root.join('spec', 'fixtures', 'workfile.sql')) do |file|
      FactoryGirl.create(:workfile_version, :workfile => typeahead_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file)
    end
    @typeahead = FactoryGirl.create(:hdfs_entry, :path => '/testdir/typeahead')#, :owner => type_ahead_user)
    typeahead_instance = FactoryGirl.create :greenplum_instance, :name => 'typeahead'
    [:workspace, :hadoop_instance].each do |model|
      FactoryGirl.create model, :name => 'typeahead'
    end
    FactoryGirl.create :workspace, :name => "typeahead_private", :public => false, :owner => owner
    typeahead_public_workspace = FactoryGirl.create :workspace, :name => "typeahead_public", :public => true, :owner => owner, :sandbox => searchquery_schema
    FactoryGirl.create :workspace, :name => "typeahead_private_no_members", :public => false, :owner => no_collaborators

    note_on_greenplum_typeahead = Events::NoteOnGreenplumInstance.by(owner).add(:greenplum_instance => typeahead_instance, :body => 'i exist only for my attachments', :created_at => '2010-01-01 02:00')
    note_on_greenplum_typeahead.attachments.create!(:contents => File.new(Rails.root.join('spec', 'fixtures', 'typeahead_instance')))

    typeahead_public_workspace.bound_datasets << typeahead_chorus_view

    # Search Database Instance Accounts
    searchquery_database.instance_accounts << owner_instance_account
    shared_search_database.instance_accounts << @shared_instance_account

    #Workspaces
    workspaces = []
    workspaces << no_collaborators_public_workspace = no_collaborators.owned_workspaces.create!(:name => "Public with no collaborators except collaborator", :summary => 'searchquery can see I guess')
    @public_with_no_collaborators = no_collaborators_public_workspace
    workspaces << no_collaborators_private_workspace = no_collaborators.owned_workspaces.create!(:name => "Private with no collaborators", :summary => "Not for searchquery, ha ha", :public => false)
    workspaces << no_collaborators_archived_workspace = no_collaborators.owned_workspaces.create!({:name => "Archived", :sandbox => other_schema, :archived_at => '2010-01-01', :archiver => no_collaborators}, :without_protection => true)
    workspaces << public_workspace = owner.owned_workspaces.create!({:name => "Public", :summary => "searchquery", :sandbox => default_schema}, :without_protection => true)
    workspaces << private_workspace = owner.owned_workspaces.create!(:name => "Private", :summary => "searchquery", :public => false)
    workspaces << search_public_workspace = owner.owned_workspaces.create!({:name => "Search Public", :summary => "searchquery", :sandbox => searchquery_schema}, :without_protection => true)
    workspaces << search_private_workspace = owner.owned_workspaces.create!({:name => "Search Private", :summary => "searchquery", :sandbox => searchquery_schema, :public => false}, :without_protection => true)

    fbuilder.name :public, public_workspace
    fbuilder.name :private, private_workspace
    fbuilder.name :search_public, search_public_workspace
    fbuilder.name :search_private, search_private_workspace

    workspaces << image_workspace = admin.owned_workspaces.create!({:name => "image"}, :without_protection => true)
    image_workspace.image = Rack::Test::UploadedFile.new(Rails.root.join('spec', 'fixtures', 'Workspace.jpg'), "image/jpg")
    image_workspace.save!
    workspaces.each do |workspace|
      workspace.members << the_collaborator
    end

    # Workspace / Dataset associations
    public_workspace.bound_datasets << source_table
    public_workspace.bound_datasets << source_view
    search_public_workspace.bound_datasets << searchquery_chorus_view

    @owner_creates_public_workspace = Events::PublicWorkspaceCreated.by(owner).add(:workspace => public_workspace, :actor => owner)
    @owner_creates_private_workspace = Events::PrivateWorkspaceCreated.by(owner).add(:workspace => private_workspace, :actor => owner)

    Events::WorkspaceMakePublic.by(owner).add(:workspace => public_workspace, :actor => owner)
    Events::WorkspaceMakePrivate.by(owner).add(:workspace => private_workspace, :actor => owner)

    # Chorus View
    chorus_view = ChorusView.new({:name => "chorus_view", :schema => default_schema, :query => "select * from a_table"}, :without_protection => true)
    chorus_view.bound_workspaces << public_workspace
    chorus_view.save!(:validate => false)

    # Tableau publications
    publication = FactoryGirl.create :tableau_workbook_publication, :name => "default",
                                     :workspace => public_workspace, :dataset => chorus_view, :project_name => "Default"
    @owner_publishes_to_tableau = Events::TableauWorkbookPublished.by(owner).add(
        :workbook_name => publication.name,
        :dataset => publication.dataset,
        :workspace => publication.workspace,
        :project_name => "Default",
        :workbook_url => publication.workbook_url,
        :project_url => publication.project_url
    )

    tableau_workfile = LinkedTableauWorkfile.create({:file_name => 'tableau',
                                  :workspace => public_workspace,
                                  :owner => owner,
                                  :tableau_workbook_publication => publication
                                 }, :without_protection => true)

    fbuilder.name :owner_creates_tableau_workfile, Events::TableauWorkfileCreated.by(owner).add(
        :workbook_name => publication.name,
        :dataset => publication.dataset,
        :workspace => publication.workspace,
        :workfile => tableau_workfile
    )

    #HDFS Entry
    @hdfs_file = FactoryGirl.create(:hdfs_entry, :path => '/foo/bar/baz.sql', :hadoop_instance => hadoop_instance)

    #Workfiles
    File.open(Rails.root.join('spec', 'fixtures', 'workfile.sql')) do |file|
      no_collaborators_private = FactoryGirl.create(:workfile, :file_name => "no collaborators Private", :description => "searchquery", :owner => no_collaborators, :workspace => no_collaborators_private_workspace)
      no_collaborators_public = FactoryGirl.create(:workfile, :file_name => "no collaborators Public", :description => "No Collaborators Search", :owner => no_collaborators, :workspace => no_collaborators_public_workspace)
      private_workfile = FactoryGirl.create(:workfile, :file_name => "Private", :description => "searchquery", :owner => owner, :workspace => private_workspace, :execution_schema => default_schema)
      public_workfile = FactoryGirl.create(:workfile, :file_name => "Public", :description => "searchquery", :owner => owner, :workspace => public_workspace)
      private_search_workfile = FactoryGirl.create(:workfile, :file_name => "Search Private", :description => "searchquery", :owner => owner, :workspace => search_private_workspace, :execution_schema => searchquery_schema)
      public_search_workfile = FactoryGirl.create(:workfile, :file_name => "Search Public", :description => "searchquery", :owner => owner, :workspace => search_public_workspace)

      archived_workfile = FactoryGirl.create(:workfile, :file_name => "archived", :owner => no_collaborators, :workspace => no_collaborators_archived_workspace)

      sql_workfile = FactoryGirl.create(:workfile, :file_name => "sql.sql", :owner => owner, :workspace => public_workspace)
      fbuilder.name :sql, sql_workfile

      no_collaborators_workfile_version = FactoryGirl.create(:workfile_version, :workfile => no_collaborators_private, :version_num => "1", :owner => no_collaborators, :modifier => no_collaborators, :contents => file)
      FactoryGirl.create(:workfile_version, :workfile => no_collaborators_public, :version_num => "1", :owner => no_collaborators, :modifier => no_collaborators, :contents => file)
      FactoryGirl.create(:workfile_version, :workfile => private_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file)
      fbuilder.name(:public, FactoryGirl.create(:workfile_version, :workfile => public_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file))
      FactoryGirl.create(:workfile_version, :workfile => private_search_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file)
      FactoryGirl.create(:workfile_version, :workfile => public_search_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file)
      FactoryGirl.create(:workfile_version, :workfile => sql_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file)
      FactoryGirl.create(:workfile_version, :workfile => archived_workfile, :version_num => "1", :owner => no_collaborators, :modifier => no_collaborators, :contents => file)

      @no_collaborators_creates_private_workfile = Events::WorkfileCreated.by(no_collaborators).add(:workfile => no_collaborators_private, :workspace => no_collaborators_private_workspace, :commit_message => "Fix all the bugs!")
      @public_workfile_created = Events::WorkfileCreated.by(owner).add(:workfile => public_workfile, :workspace => public_workspace, :commit_message => "There be dragons!")
      @private_workfile_created = Events::WorkfileCreated.by(owner).add(:workfile => private_workfile, :workspace => private_workspace, :commit_message => "Chorus chorus chorus, i made you out of clay")
      Events::WorkfileCreated.by(no_collaborators).add(:workfile => no_collaborators_public, :workspace => no_collaborators_public_workspace, :commit_message => "Chorus chorus chorus, with chorus I will play")

      @note_on_public_workfile = Events::NoteOnWorkfile.by(owner).add(:workspace => public_workspace, :workfile => public_workfile, :body => 'notesearch forever')
      @note_on_no_collaborators_private_workfile = Events::NoteOnWorkfile.by(no_collaborators).add(:workspace => no_collaborators_private_workspace, :workfile => no_collaborators_private, :body => 'notesearch never')
      Events::WorkfileUpgradedVersion.by(no_collaborators).add(:workspace => no_collaborators_private_workspace, :workfile => no_collaborators_private, :commit_message => 'commit message', :version_id => no_collaborators_workfile_version.id.to_s, :version_num => "1")

      Events::ChorusViewCreated.by(owner).add(:dataset => chorus_view, :workspace => public_workspace, :source_object => public_workfile)
      Events::ChorusViewChanged.by(owner).add(:dataset => chorus_view, :workspace => public_workspace)
    end

    text_workfile = FactoryGirl.create(:workfile, :file_name => "text.txt", :owner => owner, :workspace => public_workspace)
    image_workfile = FactoryGirl.create(:workfile, :file_name => "image.png", :owner => owner, :workspace => public_workspace)
    binary_workfile = FactoryGirl.create(:workfile, :file_name => "binary.tar.gz", :owner => owner, :workspace => public_workspace)
    code_workfile = FactoryGirl.create(:workfile, :file_name => "code.cpp", :owner => owner, :workspace => public_workspace)

    File.open Rails.root + 'spec/fixtures/some.txt' do |file|
      FactoryGirl.create(:workfile_version, :workfile => text_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file)
    end
    File.open Rails.root + 'spec/fixtures/small1.gif' do |file|
      FactoryGirl.create(:workfile_version, :workfile => image_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file)
    end
    File.open Rails.root + 'spec/fixtures/binary.tar.gz' do |file|
      FactoryGirl.create(:workfile_version, :workfile => binary_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file)
    end

    File.open Rails.root + 'spec/fixtures/test.cpp' do |file|
      FactoryGirl.create(:workfile_version, :workfile => code_workfile, :version_num => "1", :owner => owner, :modifier => owner, :contents => file)
    end

    fbuilder.name :default, FactoryGirl.create(:workfile_draft, :owner => owner)

    dataset_import_created = FactoryGirl.create(:dataset_import_created_event,
        :workspace => public_workspace, :dataset => nil,
        :source_dataset => default_table, :destination_table => 'new_table_for_import'
    )
    fbuilder.name :dataset_import_created, dataset_import_created

    import_schedule = FactoryGirl.create(:import_schedule, :start_datetime => '2012-09-04 23:00:00-07', :end_date => '2012-12-04',
                        :frequency => 'weekly', :workspace_id => public_workspace.id,
                        :to_table => "new_table_for_import", :source_dataset_id => default_table.id, :truncate => 't',
                        :new_table => 't', :user_id => owner.id, :dataset_import_created_event_id => dataset_import_created.id
                        )
    fbuilder.name :default, import_schedule

    import = FactoryGirl.create(:import, :user => owner, :workspace => public_workspace, :to_table => "new_table_for_import",
                  :import_schedule => import_schedule,
                  :dataset_import_created_event_id => dataset_import_created.id,
                  :created_at => Time.now,
                  :source_dataset_id => default_table.id)
    fbuilder.name :default, import

    previous_import = FactoryGirl.create(:import, :user => owner, :workspace => public_workspace, :to_table => "new_table_for_import",
                                         :import_schedule => import_schedule, :created_at => '2012-09-04 23:00:00-07',
                                         :dataset_import_created_event_id => dataset_import_created.id,
                                         :source_dataset_id => default_table.id)
    fbuilder.name :previous, previous_import

    #CSV File
    csv_file = CsvFile.new({:user => the_collaborator, :workspace => public_workspace, :column_names => [:id], :types => [:integer], :delimiter => ',', :file_contains_header => true, :to_table => 'table', :new_table => true, :contents_file_name => 'import.csv'}, :without_protection => true)
    csv_file.save!(:validate => false)

    csv_file_owner = CsvFile.new({:user => owner, :workspace => public_workspace, :column_names => [:id], :types => [:integer], :delimiter => ',', :file_contains_header => true, :to_table => 'table', :new_table => true, :contents_file_name => 'import.csv'}, :without_protection => true)
    csv_file_owner.save!(:validate => false)
    fbuilder.name :default, csv_file_owner
    #Notes
    note_on_greenplum = Events::NoteOnGreenplumInstance.by(owner).add(:greenplum_instance => greenplum_instance, :body => 'i am a comment with greenplumsearch in me', :created_at => '2010-01-01 02:00')
    fbuilder.name :note_on_greenplum, note_on_greenplum
    insight_on_greenplum = Events::NoteOnGreenplumInstance.by(owner).add(:greenplum_instance => greenplum_instance, :body => 'i am an insight with greenpluminsight in me', :created_at => '2010-01-01 02:00', :insight => true, :promotion_time => '2010-01-01 02:00', :promoted_by => owner)
    fbuilder.name :insight_on_greenplum, insight_on_greenplum
    Events::NoteOnGreenplumInstance.by(owner).add(:greenplum_instance => greenplum_instance, :body => 'i love searchquery', :created_at => '2010-01-01 02:01')
    Events::NoteOnGreenplumInstance.by(owner).add(:greenplum_instance => shared_instance, :body => 'is this a greenplumsearch instance?', :created_at => '2010-01-01 02:02')
    Events::NoteOnGreenplumInstance.by(owner).add(:greenplum_instance => shared_instance, :body => 'no, not greenplumsearch', :created_at => '2010-01-01 02:03')
    Events::NoteOnGreenplumInstance.by(owner).add(:greenplum_instance => shared_instance, :body => 'really really?', :created_at => '2010-01-01 02:04')
    note_on_hadoop_instance = Events::NoteOnHadoopInstance.by(owner).add(:hadoop_instance => hadoop_instance, :body => 'hadoop-idy-doop')
    fbuilder.name :note_on_hadoop_instance, note_on_hadoop_instance
    note_on_hdfs_file = Events::NoteOnHdfsFile.by(owner).add(:hdfs_file => @hdfs_file, :body => 'hhhhhhaaaadooooopppp')
    fbuilder.name :note_on_hdfs_file, note_on_hdfs_file
    note_on_workspace = Events::NoteOnWorkspace.by(owner).add(:workspace => public_workspace, :body => 'Come see my awesome workspace!')
    fbuilder.name :note_on_workspace, note_on_workspace
    note_on_workfile = Events::NoteOnWorkfile.by(owner).add(:workspace => public_workspace, :workfile => text_workfile, :body => "My awesome workfile")
    fbuilder.name :note_on_workfile, note_on_workfile
    note_on_gnip_instance = Events::NoteOnGnipInstance.by(owner).add(:gnip_instance => gnip_instance, :body => 'i am a comment with gnipsearch in me', :created_at => '2010-01-01 02:00')
    fbuilder.name :note_on_gnip_instance, note_on_gnip_instance
    insight_on_gnip_instance = Events::NoteOnGnipInstance.by(owner).add(:gnip_instance => gnip_instance, :body => 'i am an insight with gnipinsight in me', :created_at => '2010-01-01 02:00', :insight => true, :promotion_time => '2010-01-01 02:00', :promoted_by => owner)
    fbuilder.name :insight_on_gnip_instance, insight_on_gnip_instance

    Events::NoteOnDataset.by(owner).add(:dataset => default_table, :body => 'Note on dataset')
    Events::NoteOnWorkspaceDataset.by(owner).add(:dataset => default_table, :workspace => public_workspace, :body => 'Note on workspace dataset')
    Events::FileImportSuccess.by(the_collaborator).add(:dataset => default_table, :workspace => public_workspace)
    note_on_dataset = Events::NoteOnDataset.by(owner).add(:dataset => searchquery_table, :body => 'notesearch ftw')
    fbuilder.name :note_on_dataset, note_on_dataset
    @note_on_search_workspace_dataset = Events::NoteOnWorkspaceDataset.by(owner).add(:dataset => searchquery_table, :workspace => public_workspace, :body => 'workspacedatasetnotesearch')
    @note_on_workspace_dataset = Events::NoteOnWorkspaceDataset.by(owner).add(:dataset => source_table, :workspace => public_workspace, :body => 'workspacedatasetnotesearch')
    fbuilder.name :note_on_public_workspace, Events::NoteOnWorkspace.by(owner).add(:workspace => public_workspace, :body => 'notesearch forever')
    note_on_no_collaborators_private = Events::NoteOnWorkspace.by(no_collaborators).add(:workspace => no_collaborators_private_workspace, :body => 'notesearch never')
    fbuilder.name :note_on_no_collaborators_private, note_on_no_collaborators_private

    #Comments
    comment_on_note_on_greenplum = Comment.create!({:text => "Comment on Note on Greenplum", :event_id => note_on_greenplum.id, :author_id => owner.id})             
    fbuilder.name :comment_on_note_on_greenplum, comment_on_note_on_greenplum

    second_comment_on_note_on_greenplum = Comment.create!({:text => "2nd Comment on Note on Greenplum", :event_id => note_on_greenplum.id, :author_id => the_collaborator.id})
    fbuilder.name :second_comment_on_note_on_greenplum, second_comment_on_note_on_greenplum

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
    Events::WorkspaceChangeName.by(admin).add(:workspace => public_workspace, :workspace_old_name => 'old_name')
    Events::WorkspaceAddHdfsAsExtTable.by(owner).add(:workspace => public_workspace, :dataset => default_table, :hdfs_file => @hdfs_file)
    Events::FileImportCreated.by(owner).add(:workspace => public_workspace, :dataset => nil, :file_name => 'import.csv', :import_type => 'file', :destination_table => 'table')
    Events::FileImportSuccess.by(owner).add(:workspace => public_workspace, :dataset => default_table, :file_name => 'import.csv', :import_type => 'file')
    Events::FileImportFailed.by(owner).add(:workspace => public_workspace, :file_name => 'import.csv', :import_type => 'file', :destination_table => 'my_table', :error_message => "oh no's! everything is broken!")
    Events::MembersAdded.by(owner).add(:workspace => public_workspace, :member => the_collaborator, :num_added => '5')
    Events::DatasetImportCreated.by(owner).add(:workspace => public_workspace, :dataset => nil, :source_dataset => default_table, :destination_table => 'other_table')
    Events::DatasetImportSuccess.by(owner).add(:workspace => public_workspace, :dataset => other_table, :source_dataset => default_table)
    Events::DatasetImportFailed.by(owner).add(:workspace => public_workspace, :source_dataset => default_table, :destination_table => 'other_table', :error_message => "oh no's! everything is broken!")
    Events::GnipStreamImportCreated.by(owner).add(:workspace => public_workspace, :dataset => other_table, :gnip_instance => gnip_instance)
    Events::GnipStreamImportSuccess.by(owner).add(:workspace => public_workspace, :dataset => other_table, :gnip_instance => gnip_instance)
    Events::GnipStreamImportFailed.by(owner).add(:workspace => public_workspace, :dataset => other_table, :gnip_instance => gnip_instance)
    Events::ChorusViewCreated.by(owner).add(:dataset => chorus_view, :workspace => public_workspace, :source_object => default_table)
    Timecop.return

    #NotesAttachment
    @sql = note_on_greenplum.attachments.create!(:contents => File.new(Rails.root.join('spec', 'fixtures', 'workfile.sql')))
    @image = note_on_greenplum.attachments.create!(:contents => File.new(Rails.root.join('spec', 'fixtures', 'User.png')))
    @attachment = note_on_greenplum.attachments.create!(:contents => File.new(Rails.root.join('spec', 'fixtures', 'searchquery_instance')))
    @attachment_workspace = note_on_workspace.attachments.create!(:contents => File.new(Rails.root.join('spec', 'fixtures', 'searchquery_workspace')))
    @attachment_private_workspace = note_on_no_collaborators_private.attachments.create!(:contents => File.new(Rails.root.join('spec', 'fixtures', 'searchquery_workspace')))
    @attachment_workfile = note_on_workfile.attachments.create!(:contents => File.new(Rails.root.join('spec', 'fixtures', 'searchquery_workfile')))
    @attachment_private_workfile = @note_on_no_collaborators_private_workfile.attachments.create!(:contents => File.new(Rails.root.join('spec', 'fixtures', 'searchquery_workspace')))
    @attachment_dataset = note_on_dataset.attachments.create!(:contents => File.new(Rails.root.join('spec', 'fixtures', 'searchquery_dataset')))
    @attachment_hadoop = note_on_hadoop_instance.attachments.create!(:contents => File.new(Rails.root.join('spec', 'fixtures', 'searchquery_hadoop')))
    @attachment_hdfs = note_on_hdfs_file.attachments.create!(:contents => File.new(Rails.root.join('spec', 'fixtures', 'searchquery_hdfs_file')))
    @attachment_workspace_dataset = @note_on_search_workspace_dataset.attachments.create!(:contents => File.new(Rails.root.join('spec', 'fixtures', 'searchquery_workspace_dataset')))

    if ENV['GPDB_HOST']
      GpdbIntegration.refresh_chorus
      chorus_gpdb42_instance.refresh_databases
      GpdbSchema.refresh(@chorus_gpdb42_test_superuser, chorus_gpdb42_instance.databases.find_by_name(GpdbIntegration.database_name), :refresh_all => true)

      test_database = GpdbDatabase.find_by_name_and_gpdb_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance)
      test_schema = test_database.schemas.find_by_name('test_schema')
      @executable_chorus_view = FactoryGirl.build(:chorus_view, :name => "CHORUS_VIEW", :schema => test_schema, :query => "select * from test_schema.base_table1;")
      @executable_chorus_view.bound_workspaces << public_workspace
      @executable_chorus_view.save!(:validate => false)
    end

    #Notification
    notes = Events::NoteOnGreenplumInstance.by(owner)
    @notification1 = Notification.create!({:recipient => owner, :event => notes[0], :comment => second_comment_on_note_on_greenplum}, :without_protection => true)
    @notification2 = Notification.create!({:recipient => owner, :event => notes[1]}, :without_protection => true)
    @notification3 = Notification.create!({:recipient => owner, :event => notes[2]}, :without_protection => true)
    @notification4 = Notification.create!({:recipient => owner, :event => notes[3]}, :without_protection => true)

    Sunspot.session = Sunspot.session.original_session if Sunspot.session.is_a? SunspotMatchers::SunspotSessionSpy
    #Nothing should go ↓ here.  Resetting the sunspot session should be the last thing in this file.
  end
end
