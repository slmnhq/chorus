FactoryGirl.define do
  factory :user do
    sequence(:username) {|n| "user#{n}" }
    password "secret"
    first_name "John"
    last_name  "Doe"
    sequence(:email) {|n| "person#{n}@example.com" }
  end

  factory :admin, :parent => :user do
    first_name "Admin"
    last_name  "User"
    admin      true
  end
end

