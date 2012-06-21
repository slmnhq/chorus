class Legacy < ActiveRecord::Base
  self.inheritance_column = :_type_disabled
  self.abstract_class = true

  if Rails.env.test?
    establish_connection(:legacy_test)
  else
    establish_connection(:legacy)
  end
end
