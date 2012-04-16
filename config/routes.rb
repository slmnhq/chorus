Chorus::Application.routes.draw do

  resources :sessions, :only => [ :create ]
  resources :users, :only => [ :index ]

end
