Chorus::Application.routes.draw do

  resources :sessions, :only => [ :create ]

end
