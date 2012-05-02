Chorus::Application.routes.draw do
  resource :sessions, :only => [ :create, :destroy, :show ]
  resource :config, :only => [ :show ]
  resources :users, :only => [ :index, :show, :create, :update, :destroy ] do
    collection do
      get :ldap
    end
    member do
      resource :image, :only => [ :create, :update, :destroy ]
    end
  end

  resources :instances, :only => [:index, :create, :update] do
    resources :accounts, :controller => :instance_credentials
  end
  match "/" => "root#index"

  match '*not_found' => 'root#not_found'
end
