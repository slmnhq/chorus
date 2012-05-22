class Legacy < ActiveRecord::Base
  if Rails.env.test?
    establish_connection(:legacy_test)
  else
    establish_connection(:legacy)
  end
end
