class Legacy < ActiveRecord::Base
  establish_connection(:legacy) unless Rails.env.test?
end
