FactoryGirl.define do
  factory :user, :aliases => [:owner, :modifier] do
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

  factory :instance do
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
    sequence(:name) { |n| "database#{n}" }
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

  factory :gpdb_table_statistics do
    table_name 'A1000'
    table_type 'BASE_TABLE'
    rows 1000
    columns 5
    description 'This is a nice table.'
    last_analyzed Time.utc(2012, 10, 20, 10, 30, 00)
    disk_size 2048
    partition_count 0
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
end

