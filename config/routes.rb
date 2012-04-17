Chorus::Application.routes.draw do

  resource :sessions, :only => [ :create, :destroy ]
  resources :users, :only => [ :index, :create ]

end
