FactoryGirl.define do
  factory :user, :aliases => [:owner, :modifier, :actor] do
    sequence(:username) { |n| "user#{n}" }
    password "secret"
    first_name "John"
    last_name "Doe"
    title "Grand Poo Bah"
    dept "Corporation Corp., Inc."
    notes "One of our top performers"
    sequence(:email) { |n| "person#{n}@example.com" }
  end

  factory :admin, :parent => :user do
    first_name "Admin"
    last_name "User"
    admin true
  end

  factory :instance, :aliases => [:greenplum_instance] do
    sequence(:name) { |n| "instance#{n}" }
    sequence(:host) { |n| "host#{n}.emc.com" }
    sequence(:port) { |n| 5000+n }
    maintenance_db "postgres"
    owner
    version "9.1.2 - FactoryVersion"
  end

  factory :hadoop_instance do
    sequence(:name) { |n| "instance#{n}" }
    sequence(:host) { |n| "host#{n}.emc.com" }
    sequence(:port) { |n| 5000+n }
    owner
  end

  factory :instance_account do
    sequence(:db_username) { |n| "username#{n}" }
    db_password "secret"
    owner
    instance
  end

  factory :gpdb_database do
    sequence(:name) { |n| "database#{n}" }
    instance
  end

  factory :gpdb_schema do
    sequence(:name) { |n| "schema#{n}" }
    association :database, :factory => :gpdb_database
  end

  factory :gpdb_table do
    sequence(:name) { |n| "table#{n}" }
    association :schema, :factory => :gpdb_schema
  end

  factory :gpdb_view do
    sequence(:name) { |n| "view#{n}" }
    association :schema, :factory => :gpdb_schema
  end

  factory :gpdb_column do
    sequence(:name) { |n| "column#{n}" }
    data_type "text"
    description "A nice description"
    sequence(:ordinal_position)
  end

  factory :dataset_statistics do
    initialize_with do
      new({
            'table_type' => 'BASE_TABLE',
            'row_count' => '1000',
            'column_count' => '5',
            'description' => 'This is a nice table.',
            'last_analyzed' => '2012-06-06 23:02:42.40264+00',
            'disk_size' => '2048 kB',
            'partition_count' => '0',
            'definition' => "SELECT * FROM foo"
          })
    end
  end

  factory :workspace do
    sequence(:name) { |n| "workspace#{n}" }
    owner
    after(:create) do |workspace|
      FactoryGirl.create(:membership, :workspace => workspace, :user => workspace.owner)
    end
  end

  factory :membership do
    user
    workspace
  end

  factory :workfile do
    owner
    workspace
    description "A nice description"
    file_name "workfile.doc"
  end

  factory :workfile_version do
    workfile
    version_num "1"
    owner
    commit_message "Factory commit message"
    modifier
  end

  factory :workfile_draft do
    owner
    workfile
    content "Excellent content"
  end

  factory :visualization_frequency, :class => Visualization::Frequency do
    bins 20
    category "title"
    filters ["\"1000_songs_test_1\".year > '1980'"]
    association :dataset, :factory => :gpdb_table
    association :schema, :factory => :gpdb_schema
  end

  factory :visualization_histogram, :class => Visualization::Histogram do
    bins 20
    category "airport_cleanliness"
    filters ["\"2009_sfo_customer_survey\".terminal > 5"]
    association :dataset, :factory => :gpdb_table
    association :schema, :factory => :gpdb_schema
  end

  factory :visualization_heatmap, :class => Visualization::Heatmap do
    x_bins 3
    y_bins 3
    x_axis "theme"
    y_axis "artist"
    association :dataset, :factory => :gpdb_table
    association :schema, :factory => :gpdb_schema
  end

  factory :visualization_timeseries, :class => Visualization::Timeseries do
    time "time_value"
    value "column1"
    time_interval "month"
    aggregation "sum"
    association :dataset, :factory => :gpdb_table
    association :schema, :factory => :gpdb_schema
  end

  factory :associated_dataset do
    association :dataset, :factory => :gpdb_table
    workspace
  end

  factory :hdfs_file_reference do
    hadoop_instance_id 25
    path "/folder/subfolder/file.csv"
  end

  factory :event, :class => Events::Base do
    actor

    factory :greenplum_instance_created_event, :class => Events::GREENPLUM_INSTANCE_CREATED do
      greenplum_instance
    end

    factory :hadoop_instance_created_event, :class => Events::HADOOP_INSTANCE_CREATED do
      hadoop_instance
    end

    factory :greenplum_instance_changed_owner_event, :class => Events::GREENPLUM_INSTANCE_CHANGED_OWNER do
      greenplum_instance
      new_owner :factory => :user
    end

    factory :greenplum_instance_changed_name_event, :class => Events::GREENPLUM_INSTANCE_CHANGED_NAME do
      greenplum_instance
      new_name "new_instance_name"
      old_name "old_instance_name"
    end

    factory :hadoop_instance_changed_name_event, :class => Events::HADOOP_INSTANCE_CHANGED_NAME do
      hadoop_instance
      new_name "new_instance_name"
      old_name "old_instance_name"
    end

    factory :workfile_created_event, :class => Events::WORKFILE_CREATED do
      workfile { FactoryGirl.create(:workfile_version).workfile }
      workspace
    end

    factory :source_table_created_event, :class => Events::SOURCE_TABLE_CREATED do
      association :dataset, :factory => :gpdb_table
      workspace
    end

    factory :user_created_event, :class => Events::USER_ADDED do
      association :new_user, :factory => :user
    end

    factory :sandbox_added_event, :class => Events::WORKSPACE_ADD_SANDBOX do
      workspace
    end

    factory :hdfs_external_table_created_event, :class => Events::WORKSPACE_ADD_HDFS_AS_EXT_TABLE do
      association :dataset, :factory => :gpdb_table
      association :hdfs_file, :factory => :hdfs_file_reference
      workspace
    end

    factory :note_on_greenplum_instance_event, :class => Events::NOTE_ON_GREENPLUM_INSTANCE do
      greenplum_instance
      body "Note to self, add a body"
    end

    factory :note_on_hadoop_instance_event, :class => Events::NOTE_ON_HADOOP_INSTANCE do
      hadoop_instance
      body "Note to self, add a body"
    end

    factory :note_on_hdfs_file_event, :class => Events::NOTE_ON_HDFS_FILE do
      association :hdfs_file, :factory => :hdfs_file_reference
      body "This is a note on an hdfs file"
    end
  end
end

