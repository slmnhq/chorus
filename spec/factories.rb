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
    comment "A helpful table"
    association :schema, :factory => :gpdb_schema
  end

  factory :gpdb_view do
    sequence(:name) { |n| "view#{n}" }
    comment "A helpful view"
    association :schema, :factory => :gpdb_schema
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
    after(:build) do |workfile|
      FactoryGirl.create(:workfile_version, :workfile => workfile, :owner => workfile.owner, :modifier => workfile.owner)
    end
  end

  factory :workfile_version do
    workfile
    version_num "1"
    owner
    commit_message "Factory commit message"
    modifier
    contents File.new("FactoryFileObject", "w")
  end
end

