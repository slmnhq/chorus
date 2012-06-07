Chorus::Application.routes.draw do
  resource :sessions, :only => [:create, :destroy, :show]
  resource :config, :only => [:show], :controller => 'configurations'

  resources :users, :only => [:index, :show, :create, :update, :destroy] do
    collection do
      get :ldap
    end
    resource :image, :only => [:update], :controller => :user_images
  end

  resources :hadoop_instances, :only => [:create, :index, :show, :update] do
    scope :module => 'hdfs' do
      resources :files, :only => [:show, :index], :constraints => {:id => /.*/}
      resources :contents, :only => :show, :constraints => {:id => /.*/}
    end
  end

  resources :instances, :only => [:index, :show, :create, :update] do
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

  resources :schemas, :only => [:show] do
    resources :database_objects, :only => [:index]
  end

  # TODO: Make it generally available for either views and tables
  resources :tables, :only => [] do
    resource :statistics, :only => :show
    resources :previews, :only => [:create]
    resource :analyze, :only => [:create], :controller => 'analyze'
  end
  
  resources :database_objects, :only => [:show] do
    resources :columns, :only=> [:index], :controller => 'column'
    resources :previews, :only => [:create]
  end

  resources :workspaces, :only => [:index, :create, :show, :update] do
    resources :members, :only => [:index, :create]
    resource :image, :only => [:update], :controller => :workspace_images
    resources :workfiles, :only => [:create, :index]
  end

  resources :workfiles, :only => [:show] do
    resources :versions, :only => [:update, :create], :controller => 'workfile_versions'
  end

  match "/" => "root#index"
  match "VERSION" => "configurations#version"

  # TODO: Remove this when it's no longer needed
  match '*not_found' => 'root#not_found'
end
