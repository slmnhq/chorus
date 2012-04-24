Chorus::Application.routes.draw do
  resource :sessions, :only => [ :create, :destroy ]
  resources :users, :only => [ :index, :show, :create, :destroy ] do
    collection do
      get :ldap
    end
  end
  resources :instances, :only => [:index, :create, :update]
end
