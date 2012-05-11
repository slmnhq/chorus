specs = [
  "edit_user_spec",
  "new_user_spec",
  "create_instance_spec",
  "new_instance_account_spec",
  "logout_spec",
  "login_spec",
  "dialog_spec"
]

specs.each do |filename|
  require_relative filename
end
