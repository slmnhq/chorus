Chorus::Application.routes.draw do
  resource :sessions, :only => [:create, :destroy, :show]
  resource :config, :only => [:show], :controller => 'configurations'

  resources :users, :only => [:index, :show, :create, :update, :destroy] do
    collection do
      get :ldap
    end
    resource :image, :only => [:update], :controller => :user_images
  end

  resources :hadoop_instances, :only => [:create, :index, :show]

  resources :instances, :only => [:index, :create, :update] do
    resources :databases, :only => [:index], :controller => 'instance_databases'

    scope :module => 'instances' do
      resource :owner, :only => [:update], :controller => 'owner'
      resource :sharing, :only => [:create, :destroy], :controller => 'sharing'
      resource :account, :only => [:show, :create, :update, :destroy], :controller => 'account'
      resources :members, :only => [:index, :create, :update, :destroy]
    end
  end

  resources :databases, :only => [:show], :controller => 'instance_databases' do
    resources :schemas, :only => [:index]
  end

  resources :schemas, :only => [:show]

  resources :workspaces, :only => [:index, :create, :show] do
    resources :members, :only => [:index, :create]
    resource :image, :only => [:update], :controller => :workspace_images
  end

  match "/" => "root#index"

  # TODO: Remove this when it's no longer needed
  match '*not_found' => 'root#not_found'
end
