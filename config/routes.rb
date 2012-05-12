Chorus::Application.routes.draw do
  resource :sessions, :only => [:create, :destroy, :show]
  resource :config, :only => [:show], :controller => 'configurations'

  resources :users, :only => [:index, :show, :create, :update, :destroy] do
    collection do
      get :ldap
    end
    member do
      resource :image, :only => [:update], :controller => :user_images
    end
  end

  resources :hadoop_instances, :only => [:create, :index]

  resources :instances, :only => [:index, :create, :update] do
    resources :databases, :only => [:index], :controller => 'instance_databases' do
      resources :schemas, :only => [:index]
    end

    scope :module => 'instances' do
      resource :owner, :only => [:update], :controller => 'owner'
      resource :sharing, :only => [:create, :destroy], :controller => 'sharing'
      resource :account, :only => [:show, :create, :update, :destroy], :controller => 'account'
      resources :members, :only => [:index, :create, :update, :destroy]
    end
  end

  resources :workspaces, :only => [:index, :create, :show] do
    member do
      resource :members, :only => [:show]
      resource :image, :only => [:update], :controller => :workspace_images
    end
  end

  match "/" => "root#index"

  # TODO: Remove this when it's no longer needed
  match '*not_found' => 'root#not_found'
end
