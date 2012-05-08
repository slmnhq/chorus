FactoryGirl.define do
  factory :user, :aliases => [:owner] do
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

  factory :instance_account do
    sequence(:db_username) { |n| "username#{n}" }
    db_password "secret"
    owner
    instance
  end

  factory :workspace do
    sequence(:name) { |n| "workspace#{n}" }
  end
end

