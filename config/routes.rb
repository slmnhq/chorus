Chorus::Application.routes.draw do
  resource :sessions, :only => [:create, :destroy, :show]
  resource :config, :only => [:show]
  resources :users, :only => [:index, :show, :create, :update, :destroy] do
    collection do
      get :ldap
    end
    member do
      resource :image, :only => [:create, :update, :destroy]
    end
  end

  resources :instances, :only => [:index, :create, :update] do
    resources :databases, :controller => :instance_databases, :only => [:index] do
      resources :schemas, :only => [:index]
    end

    scope :module => :instances do
      resources :members, :only => [:index, :create, :update]
      resource :sharing, :only => [:create, :destroy], :controller => :sharing
      resource :my_account, :only => [:show, :create, :update], :controller => :my_account
    end
  end
  resources :workspaces, :only => [:index, :create]

  match "/" => "root#index"

  # TODO: Remove this when it's no longer needed
  match '*not_found' => 'root#not_found'
end
