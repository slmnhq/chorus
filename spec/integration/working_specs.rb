specs = [
  "edit_user_spec",
  "new_user_spec"
]

specs.each do |filename|
  require_relative filename
end
